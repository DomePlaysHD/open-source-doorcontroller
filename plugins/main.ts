import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import Doorsystem from './interface';
import { InteractionController } from '../../server/systems/interaction';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { ATHENA_EVENTS_PLAYER } from '../../shared/enums/athenaEvents';
import { TextLabelController } from '../../server/systems/textlabel';
import { playerFuncs } from '../../server/extensions/Player';

let doorInteraction: any;

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, buildDoorInteractions);

alt.onClient('Doorsystem:Serverside:AddDoor', (player: alt.Player, name: string, faction: string, prop: string, data: any) => {
	createDoor(player, name, faction, prop, data);
	JSON.stringify(data);
});

alt.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, async (player: alt.Player) => {
	const lockedDoors = await Database.fetchAllData<Doorsystem>('doors');
	lockedDoors.forEach((door, index) => {
		alt.emitClient(player, 'Doorsystem:Clientside:Setlockstates', door);
	}); 
});

export async function createDoor(player: alt.Player, name: string, prop: string, faction: string, doorData: any) {
	const newDocument = {
		name: name,
		data: {
			lockstate: true,
			faction: faction,
			prop: prop,
			hash: alt.hash(prop),
			position: { x: doorData.x, y: doorData.y, z: doorData.z - 1 } as alt.Vector3,
			rotation: player.rot as alt.Vector3
		}
	};
	const inserted = await Database.insertData<Doorsystem>(newDocument, 'doors', true);
	doorInteraction = InteractionController.add({
		position: { x: doorData.x, y: doorData.y, z: doorData.z - 1 },
		description: 'Use Door',
		identifier: `door-${inserted._id}`,
		type: 'Door',
		range: 1,
		callback: () => {
			if (inserted.data.faction != '0' && player.data.faction != inserted.data.faction) return;
			switch (inserted.data.lockstate) {
				case false: {
					inserted.data.lockstate = true;
					break;
				}
				case true: {
					inserted.data.lockstate = false;
					break;
				}
				default:
					break;
			}
			TextLabelController.remove(`door-${inserted._id.toString()}`);
			TextLabelController.append({
				pos: { x: inserted.data.position.x, y: inserted.data.position.y, z: inserted.data.position.z } as alt.Vector3,
				data: `Lockstate: ~g~${inserted.data.lockstate}`,
				uid: `door-${inserted._id.toString()}`
			});
			updateLockstate(inserted._id.toString(), inserted.data.lockstate);
			alt.emitAllClients('Doorsystem:Clientside:Setlockstate', inserted);
		}
	});
}
export async function updateLockstate(doorId: string, lockstate: boolean) {
	const door = await Database.fetchData<Doorsystem>('_id', doorId, 'doors');
	await Database.updatePartialData(
		doorId,
		{
			name: door.name,
			data: {
				lockstate: lockstate,
				faction: door.data.faction,
				prop: door.data.prop,
				hash: door.data.hash,
				position: door.data.position,
				rotation: door.data.rotation
			}
		},
		'doors'
	);
}
export async function buildDoorInteractions() {
	const dbDoors = await Database.fetchAllData<Doorsystem>('doors');
	dbDoors.forEach((door, index) => {
		TextLabelController.append({
			pos: { x: door.data.position.x, y: door.data.position.y, z: door.data.position.z } as alt.Vector3,
			data: `Lockstate: ~g~${door.data.lockstate}`,
			uid: `door-${door._id.toString()}`
		});
		doorInteraction = InteractionController.add({
			identifier: `door-${door._id}`,
			description: 'Use Door',
			range: 1,
			position: { x: door.data.position.x, y: door.data.position.y, z: door.data.position.z },
			callback: (player: alt.Player) => {
				if (door.data.faction != '0' && player.data.faction != door.data.faction) return;
				switch (door.data.lockstate) {
					case false: {
						door.data.lockstate = true;
						break;
					}
					case true: {
						door.data.lockstate = false;
						break;
					}
					default:
						break;
				}
				TextLabelController.remove(`door-${door._id.toString()}`);
				TextLabelController.append({
					pos: { x: door.data.position.x, y: door.data.position.y, z: door.data.position.z } as alt.Vector3,
					data: `Lockstate: ~g~${door.data.lockstate}`,
					uid: `door-${door._id.toString()}`
				});
				updateLockstate(door._id.toString(), door.data.lockstate);
				alt.emitAllClients('Doorsystem:Clientside:Setlockstate', door);
			}
		});
	});
	alt.log(`Found ${dbDoors.length} doors in the database.`);
}

alt.onClient('Doorsystem:Serverside:Removedoor', async (player: alt.Player) => {
	const doors = await Database.fetchAllData<Doorsystem>('doors');
	doors.forEach(async (door, index) => {
		if (player.pos.isInRange(door.data.position as alt.Vector3, 2)) {
			playerFuncs.emit.notification(player, `Successfully removed door with the name ${door.name} and the hash: ${door.data.hash}.`);
			await Database.deleteById(door._id, 'doors');
			InteractionController.remove(doorInteraction.getType(), doorInteraction.getIdentifier());
			TextLabelController.remove(`door-${door._id.toString()}`);
			alt.log(door._id.toString());
			return true;
		}
		return true;
	});
});
