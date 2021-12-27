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
import { loadItems } from './src/keys';

import './src/events';
import './src/streamer';
import './src/keys';
import './src/interface';
import './src/translations';
import { ATHENA_EVENTS_PLAYER } from '../../shared/enums/athenaEvents';

export let doorInteraction: any;

const ATHENA_DOORLOCK = "Athena DoorController";
const VERSION_STRING = "v3.0 - Stable";

PluginSystem.registerPlugin(ATHENA_DOORLOCK, async () => {
    alt.log(`~lg~PLUGIN ==> ${ATHENA_DOORLOCK} ${VERSION_STRING} successfully loaded.`);
	
	loadDoors();
	loadItems();

	await Database.createCollection('doors');
});
alt.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
	DoorController.refresh();
});

export async function createDoor(player: alt.Player, doorData: Doorsystem) {
	const newDocument = {
		name: doorData.name,
		prop: doorData.prop,
		hash: alt.hash(doorData.prop),
		keyName: doorData.keyName,
		keyDescription: doorData.keyDescription,
		pos: doorData.pos,
		center: doorData.center,
		rotation: doorData.rotation,
		lockstate: false
	};
	alt.log(JSON.stringify(doorData));
	const inserted = await Database.insertData<Doorsystem>(newDocument, 'doors', true);

	doorInteraction = InteractionController.add({
		identifier: `door-${inserted._id}`,
		description: 'Use Door',
		range: 1,
		position: { x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z - 1 },
		callback: (player: alt.Player) => {
			const keyExists = getFromRegistry(inserted.keyName);
			if(!keyExists) {
				alt.log("Key does not exist. " + inserted.keyName);
				return;
			}

			if(!playerFuncs.inventory.isInInventory(player, { name: inserted.keyName })) {
				playerFuncs.emit.notification(player, `Key is missing! ((${inserted.keyName}))!`);
				return;
			}

			switch (inserted.lockstate) {
				case false: {
					inserted.lockstate = true;
					ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
					ServerTextLabelController.append({
						pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
						data: `~r~${Translations.LOCKED}`,
						uid: `door-${inserted._id.toString()}`,
						maxDistance: 3,
					});
					updateLockstate(inserted._id, inserted.lockstate);
					break;
				}
				case true: {
					inserted.lockstate = false;
					ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
					ServerTextLabelController.append({
						pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
						data: `~g~${Translations.UNLOCKED}`,
						uid: `door-${inserted._id.toString()}`,
						maxDistance: 3
					});
					updateLockstate(inserted._id, inserted.lockstate);
					break;
				}
				default:
					break;
			}
			updateLockstate(inserted._id.toString(), inserted.lockstate);
		}
	});

	ServerTextLabelController.append({
		pos: {x: inserted.center.x, y: inserted.center.y, z: inserted.center.z } as alt.Vector3,
		data: `~g~${Translations.UNLOCKED}`,
		uid: `door-${inserted._id.toString()}`,
		maxDistance: 3
	});

	alt.emit('doorController:serverSide:createKey', inserted.keyName, inserted.keyDescription);
	DoorController.append(inserted);
}

export async function updateLockstate(doorId: string, lockstate: boolean) {
	const door = await Database.fetchData<Doorsystem>('_id', doorId, 'doors');
	await Database.updatePartialData(
		doorId,
		{
			_id: door._id,
			name: door.name,
			prop: door.prop,
			hash: door.hash,
			lockstate: lockstate,
			keyName: door.keyName,
			keyDescription: door.keyDescription,
			pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z },
			center: { x: door.center.x, y: door.center.y, z: door.center.z },
			rotation: { x: door.rotation.x, y: door.rotation.y, z: door.rotation.z }
		},
		'doors'
	);
	DoorController.refresh();
} 
export async function loadDoors() {
	const dbDoors = await Database.fetchAllData<Doorsystem>('doors');
	dbDoors.forEach((door, index) => {
		switch (door.lockstate) {
			case false: {
				ServerTextLabelController.append({
					pos: { x: door.center.x, y: door.center.y, z: door.center.z },
					data: `~g~${Translations.UNLOCKED}`,
					uid: `door-${door._id.toString()}`,
					maxDistance: 3
				});
				break;
			}
			case true: {
				ServerTextLabelController.append({
					pos: { x: door.center.x, y: door.center.y, z: door.center.z },
					data: `~r~${Translations.LOCKED}`,
					uid: `door-${door._id.toString()}`,
					maxDistance: 3
				});
				break;
			}
			default:
			{
				break;
			}
		}
		doorInteraction = InteractionController.add({
			identifier: `door-${door._id}`,
			description: 'Use Door',
			range: 1,
			position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
			callback: (player: alt.Player) => {
				const keyExists = getFromRegistry(door.keyName);

				if(!keyExists) {
					alt.log("Key does not exist. " + door.keyName);
					return;
				}

				if(!playerFuncs.inventory.isInInventory(player, { name: door.keyName })) {
					playerFuncs.emit.notification(player, `It seems like you are missing Key ${door.keyName}!`);
					return;
				}

				switch (door.lockstate) {
					case false: {
						door.lockstate = true;

						ServerTextLabelController.remove(`door-${door._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: door.center.x, y: door.center.y, z: door.center.z },
							data: `~r~${Translations.LOCKED}`,
							uid: `door-${door._id.toString()}`,
							maxDistance: 3,
						});

						updateLockstate(door._id, door.lockstate);
						break;
					}
					case true: {
						door.lockstate = false;

						ServerTextLabelController.remove(`door-${door._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: door.center.x, y: door.center.y, z: door.center.z },
							data: `~g~${Translations.UNLOCKED}`,
							uid: `door-${door._id.toString()}`,
							maxDistance: 3
						});

						updateLockstate(door._id, door.lockstate);
						break;
					}
					default:
						break;
				}
			}
		});
		DoorController.append(door);
	});
	alt.log(`~lg~PLUGIN-DATABASE ===> ${dbDoors.length} doors loaded from the database.`);
}