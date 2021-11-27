import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import Doorsystem from './interface';
import { InteractionController } from '../../server/systems/interaction';
import { playerFuncs } from '../../server/extensions/Player';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { DoorController } from './streamer';
import { SYSTEM_EVENTS } from '../../shared/enums/System';

let doorInteraction: any;

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, buildDoorInteractions);

alt.onClient('Doorsystem:Serverside:AddDoor', (player: alt.Player, name: string, faction: string, prop: string, data: any) => {
	createDoor(player, name, faction, prop, data);
});

export async function createDoor(player: alt.Player, name: string, prop: string, faction: string, doorData: any) {
	const newDocument = {
		name: name,
		prop: prop,
		hash: alt.hash(prop),
		faction: faction,
		pos: doorData,
		rotation: player.rot as alt.Vector3,
		lockstate: false
	};
	const inserted = await Database.insertData<Doorsystem>(newDocument, 'doors', true);
	doorInteraction = InteractionController.add({
		position: doorData,
		description: 'Use Door',
		identifier: `door-${inserted._id}`,
		type: 'Door',
		range: 1,
		callback: () => {
			if (inserted.faction != '0' && player.data.faction != inserted.faction) return;
			switch (inserted.lockstate) {
				case false: {
					inserted.lockstate = true;
					break;
				}
				case true: {
					inserted.lockstate = false;
					break;
				}
				default:
					break;
			}
			ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
			ServerTextLabelController.append({
				pos: {x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z } as alt.Vector3,
				data: `Lockstate: ~g~${inserted.lockstate}`,
				uid: `door-${inserted._id.toString()}`
			});
			DoorController.append(doorData);
			updateLockstate(inserted._id.toString(), inserted.lockstate);
			// alt.emitClient(player, 'Doorsystem:Clientside:Setlockstate', inserted);
		}
	}); 
}

export async function updateLockstate(doorId: string, lockstate: boolean) {
	const door = await Database.fetchData<Doorsystem>('_id', doorId, 'doors');
	await Database.updatePartialData(
		doorId,
		{
			name: door.name,
			lockstate: lockstate,
			faction: door.faction,
			prop: door.prop,
			hash: door.hash,
			pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z },
			rotation: door.rotation
		},
		'doors'
	);
	DoorController.refresh();
} 
export async function buildDoorInteractions(player: alt.Player) {
	const dbDoors = await Database.fetchAllData<Doorsystem>('doors');
	dbDoors.forEach((door, index) => {
		DoorController.append(door);
		ServerTextLabelController.append({
			pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z },
			data: `Lockstate: ~g~${door.lockstate}`,
			uid: `door-${door._id.toString()}`
		});
		doorInteraction = InteractionController.add({
			identifier: `door-${door._id}`,
			description: 'Use Door',
			range: 1,
			position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
			callback: (player: alt.Player) => {
				if (door.faction != '0' && player.data.faction != door.faction) return;
				switch (door.lockstate) {
					case false: {
						door.lockstate = true;
						break;
					}
					case true: {
						door.lockstate = false;
						break;
					}
					default:
						break;
				}
				ServerTextLabelController.remove(`door-${door._id.toString()}`);
				ServerTextLabelController.append({
					pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z },
					data: `Lockstate: ~g~${door.lockstate}`,
					uid: `door-${door._id.toString()}`
				});
				updateLockstate(door._id.toString(), door.lockstate);
				// alt.emitClient(player, 'Doorsystem:Clientside:Setlockstate', door);
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
			await Database.deleteById(door._id, 'doors');
			InteractionController.remove(doorInteraction.getType(), doorInteraction.getIdentifier());
			ServerTextLabelController.remove(`door-${door._id.toString()}`);
			return true;
		}
		return true;
	});
});