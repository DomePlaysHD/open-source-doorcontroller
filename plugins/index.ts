import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import Doorsystem from './src/interface';
import { InteractionController } from '../../server/systems/interaction';
import { playerFuncs } from '../../server/extensions/Player';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { PluginSystem } from '../../server/systems/plugins';
import { DoorController } from './src/streamer';
import { Translations } from './src/translations';
import { getFromRegistry } from '../../shared/items/itemRegistry';

let doorInteraction: any;

const ATHENA_DOORLOCK = "Athena Doorlock System";
PluginSystem.registerPlugin(ATHENA_DOORLOCK, () => {
    alt.log(`~lg~${ATHENA_DOORLOCK} was Loaded`);
	buildDoorInteractions();
});

alt.onClient('Doorsystem:Serverside:AddDoor', (player: alt.Player, name: string, keyname: string, prop: string, door: any, doorRot: alt.Vector3, center: alt.Vector3) => {
	createDoor(player, name, keyname, prop, door, doorRot, center);
});

export async function createDoor(player: alt.Player, name: string, prop: string, keyname: string, doorPos: any, doorRot: alt.Vector3, center: alt.Vector3) {
	const newDocument = {
		name: name,
		prop: prop,
		hash: alt.hash(prop),
		keyname: keyname,
		pos: doorPos,
		center: center,
		rotation: doorRot,
		lockstate: false
	};
	const inserted = await Database.insertData<Doorsystem>(newDocument, 'doors', true);
	doorInteraction = InteractionController.add({
		identifier: `door-${inserted._id}`,
		description: 'Use Door',
		range: 1,
		position: { x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z - 1 },
		callback: (player: alt.Player) => {
			const keyExists = getFromRegistry(inserted.keyname);
			if(!keyExists) {
				alt.log("Key does not exist. " + inserted.keyname);
				return;
			}
			if(!playerFuncs.inventory.isInInventory(player, { name: inserted.keyname })) {
				playerFuncs.emit.notification(player, `Key is missing! ((${inserted.keyname}))!`);
				return;
			}
			switch (inserted.lockstate) {
				case false: {
					inserted.lockstate = true;
					ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
					ServerTextLabelController.append({
						pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
						data: `~r~${Translations.LOCKED}`,
						uid: `door-${inserted._id.toString()}`
					});
					break;
				}
				case true: {
					inserted.lockstate = false;
					ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
					ServerTextLabelController.append({
						pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
						data: `~g~${Translations.UNLOCKED}`,
						uid: `door-${inserted._id.toString()}`
					});
					break;
				}
				default:
					break;
			}
			updateLockstate(inserted._id.toString(), inserted.lockstate);
		}
	});
	ServerTextLabelController.append({
		pos: {x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z } as alt.Vector3,
		data: `~g~${Translations.UNLOCKED}`,
		uid: `door-${inserted._id.toString()}`
	});
	DoorController.append(inserted);
}

export async function updateLockstate(doorId: string, lockstate: boolean) {
	const door = await Database.fetchData<Doorsystem>('_id', doorId, 'doors');
	await Database.updatePartialData(
		doorId,
		{
			name: door.name,
			lockstate: lockstate,
			prop: door.prop,
			hash: door.hash,
			pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z },
			rotation: door.rotation
		},
		'doors'
	);
	DoorController.refresh();
} 
export async function buildDoorInteractions() {
	const dbDoors = await Database.fetchAllData<Doorsystem>('doors');
	dbDoors.forEach((door, index) => {
		DoorController.append(door);
		switch (door.lockstate) {
			case false: {
				door.lockstate = true;
				ServerTextLabelController.remove(`door-${door._id.toString()}`);
				ServerTextLabelController.append({
					pos: { x: door.center.x, y: door.center.y, z: door.center.z },
					data: `~r~${Translations.LOCKED}`,
					uid: `door-${door._id.toString()}`
				});
				break;
			}
			case true: {
				door.lockstate = false;
				ServerTextLabelController.remove(`door-${door._id.toString()}`);
				ServerTextLabelController.append({
					pos: { x: door.center.x, y: door.center.y, z: door.center.z },
					data: `~g~${Translations.UNLOCKED}`,
					uid: `door-${door._id.toString()}`
				});
				break;
			}
			default:
				break;
		}
		doorInteraction = InteractionController.add({
			identifier: `door-${door._id}`,
			description: 'Use Door',
			range: 1,
			position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
			callback: (player: alt.Player) => {
				const keyExists = getFromRegistry(door.keyname);
				if(!keyExists) {
					alt.log("Key does not exist. " + door.keyname);
					return;
				}
				if(!playerFuncs.inventory.isInInventory(player, { name: door.keyname })) {
					playerFuncs.emit.notification(player, `It seems like you are missing Key ${door.keyname}!`);
					return;
				}
				switch (door.lockstate) {
					case false: {
						door.lockstate = true;
						ServerTextLabelController.remove(`door-${door._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: door.center.x, y: door.center.y, z: door.center.z },
							data: `~r~${Translations.LOCKED}`,
							uid: `door-${door._id.toString()}`
						});
						break;
					}
					case true: {
						door.lockstate = false;
						ServerTextLabelController.remove(`door-${door._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: door.center.x, y: door.center.y, z: door.center.z },
							data: `~g~${Translations.UNLOCKED}`,
							uid: `door-${door._id.toString()}`
						});
						break;
					}
					default:
						break;
				}
				updateLockstate(door._id.toString(), door.lockstate);
			}
		});
	});
	alt.log(`Found ${dbDoors.length} doors in the database.`);
}

alt.onClient('Doorsystem:Serverside:Removedoor', async (player: alt.Player) => {
	const doors = await Database.fetchAllData<Doorsystem>('doors');
	doors.forEach(async (door, index) => {
		if (player.pos.isInRange(door.pos as alt.Vector3, 2)) {
			playerFuncs.emit.notification(player, `Successfully removed door with the name ${door.name} and the hash: ${door.hash}.`);
			alt.setTimeout(() => {
				InteractionController.remove(doorInteraction.getType(), doorInteraction.getIdentifier());
				ServerTextLabelController.remove(`door-${door._id.toString()}`);
			}, 500);
			door.lockstate = false;
			await Database.deleteById(door._id, 'doors');
		}
		return true;
	});
});