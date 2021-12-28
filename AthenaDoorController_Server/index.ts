import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';

import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { InteractionController } from '../../server/systems/interaction';
import { ATHENA_EVENTS_PLAYER } from '../../shared/enums/athenaEvents';
import { getFromRegistry } from '../../shared/items/itemRegistry';
import { DoorController } from './src/streamer';
import { PluginSystem } from '../../server/systems/plugins';
import { playerFuncs } from '../../server/extensions/Player';
import { Translations } from './src/translations';
import { loadItems } from './src/keys';

// Serverside Imports
import './src/events';
import './src/streamer';
import './src/keys';
import './src/interfaces/interface';
import './src/interfaces/interface-props';
import './src/translations';

// Interface Imports
import DoorControl_Main from './src/interfaces/interface';
import DoorControl_Props from './src/interfaces/interface-props';

export let doorInteraction: any;

const settings = {
	collectionName: 'doors', // Used to Create Collection, Insert Datas, Update Datas
	collectionPropsName: 'doors-props', // Used to store props. Unnecessary for now.
	doorTextEnabled: true, // If false doors won't have textlabels attached to center - Interaction is still possible.
}

const ATHENA_DOORLOCK = "Athena DoorController";
const VERSION_STRING = {
	version: "v3.0",
	release: "Stable"
}

PluginSystem.registerPlugin(ATHENA_DOORLOCK, async () => {
    alt.log(`~lg~${ATHENA_DOORLOCK} ${VERSION_STRING.version} - ${VERSION_STRING.release} ==> successfully loaded.`);
	
	loadDoors();
	loadItems();

	await Database.createCollection(settings.collectionName);
	await Database.createCollection('doors-props');
});

alt.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
	DoorController.refresh();
});

export async function createDoor(doorData: DoorControl_Main) {
	const newDocument = {
		name: doorData.name,
		data: {
			prop: doorData.data.prop,
			hash: alt.hash(doorData.data.prop),
			isLocked: false,
			faction: doorData.keyData.data.faction,
		},
		keyData: {
			keyName: doorData.keyData.keyName,
			data: {
				faction: doorData.keyData.data.faction,
				lockHash: alt.hash(doorData.keyData.keyName)
			}
		},
		pos: doorData.pos,
		rotation: doorData.rotation,
		center: doorData.center
	};
	const inserted = await Database.insertData<DoorControl_Main>(newDocument, settings.collectionName, true);

	doorInteraction = InteractionController.add({
		identifier: `door-${inserted._id}`,
		description: 'Use Door',
		range: 1,
		position: { x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z - 1 },
		callback: (player: alt.Player) => {
			const keyExists = getFromRegistry(inserted.keyData.keyName);
			if(!keyExists) {
				alt.log("Key does not exist. " + inserted.keyData.keyName);
				return;
			}

			if(!playerFuncs.inventory.isInInventory(player, { name: inserted.keyData.keyName })) {
				playerFuncs.emit.notification(player, `Key is missing! ((${inserted.keyData.keyName}))!`);
				return;
			}

			switch (inserted.data.isLocked) {
				case false: {
					inserted.data.isLocked = true;
					if(settings.doorTextEnabled) {
						ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
							data: `~r~${Translations.LOCKED}`,
							uid: `door-${inserted._id.toString()}`,
							maxDistance: 3,
						});
					}
					updateLockstate(inserted._id, inserted.data.isLocked);
					break;
				}
				case true: {
					inserted.data.isLocked = false;
					if(settings.doorTextEnabled) {
						ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
						ServerTextLabelController.append({
							pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
							data: `~g~${Translations.UNLOCKED}`,
							uid: `door-${inserted._id.toString()}`,
							maxDistance: 3
						});
					}
					updateLockstate(inserted._id, inserted.data.isLocked);
					break;
				}
				default:
					break;
			}
			updateLockstate(inserted._id.toString(), inserted.data.isLocked);
		}
	});

	if(settings.doorTextEnabled) {
		ServerTextLabelController.append({
			pos: {x: inserted.center.x, y: inserted.center.y, z: inserted.center.z } as alt.Vector3,
			data: `~g~${Translations.UNLOCKED}`,
			uid: `door-${inserted._id.toString()}`,
			maxDistance: 3
		});
	}

	alt.emit('doorController:serverSide:createKey', inserted.keyData.keyName, doorData.keyData.keyDescription, doorData.keyData.data.lockHash, inserted.keyData.data.faction);
	DoorController.append(inserted);
}

export async function updateLockstate(doorId: string, isLocked: boolean) {
	const door = await Database.fetchData<DoorControl_Main>('_id', doorId, settings.collectionName);
	await Database.updatePartialData(
		doorId,
		{
			_id: door._id,
			name: door.name,
			data: {
				prop: door.data.prop,
				hash: door.data.hash,
				isLocked: isLocked,
				faction: door.keyData.data.faction,
			},
			keyData: {
				keyName: door.keyData.keyName,
				data: {
					faction: door.keyData.data.faction,
					lockHash: door.keyData.data.lockHash,
				}
			},
			pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z } as alt.Vector3,
			rotation: { x: door.rotation.x, y: door.rotation.y, z: door.rotation.z } as alt.Vector3,
			center: { x: door.center.x, y: door.center.y, z: door.center.z } as alt.Vector3
		},
		settings.collectionName
	);
	DoorController.refresh();
} 

async function loadDoors() {
	const dbDoors = await Database.fetchAllData<DoorControl_Main>(settings.collectionName);
	dbDoors.forEach((door, index) => {
		switch (door.data.isLocked) {
			case false: {
				if(settings.doorTextEnabled) {
					ServerTextLabelController.append({
						pos: { x: door.center.x, y: door.center.y, z: door.center.z },
						data: `~g~${Translations.UNLOCKED}`,
						uid: `door-${door._id.toString()}`,
						maxDistance: 3
					});
				}
				break;
			}
			case true: {
				if(settings.doorTextEnabled) {
					ServerTextLabelController.append({
						pos: { x: door.center.x, y: door.center.y, z: door.center.z },
						data: `~r~${Translations.LOCKED}`,
						uid: `door-${door._id.toString()}`,
						maxDistance: 3
					});
				}
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
				const keyExists = getFromRegistry(door.keyData.keyName);

				if(!keyExists) {
					alt.log("Key does not exist. " + door.keyData.keyName);
					return;
				}

				if(!playerFuncs.inventory.isInInventory(player, { name: door.keyData.keyName })) {
					playerFuncs.emit.notification(player, `It seems like you are missing Key ${door.keyData.keyName}!`);
					return;
				}

				switch (door.data.isLocked) {
					case false: {
						door.data.isLocked = true;
						if(settings.doorTextEnabled) {
							ServerTextLabelController.remove(`door-${door._id.toString()}`);
							ServerTextLabelController.append({
								pos: { x: door.center.x, y: door.center.y, z: door.center.z },
								data: `~r~${Translations.LOCKED}`,
								uid: `door-${door._id.toString()}`,
								maxDistance: 3,
							});
						}

						updateLockstate(door._id, door.data.isLocked);
						break;
					}
					case true: {
						door.data.isLocked = false;
						if(settings.doorTextEnabled) {
							ServerTextLabelController.remove(`door-${door._id.toString()}`);
							ServerTextLabelController.append({
								pos: { x: door.center.x, y: door.center.y, z: door.center.z },
								data: `~g~${Translations.UNLOCKED}`,
								uid: `door-${door._id.toString()}`,
								maxDistance: 3
							});
						}
						updateLockstate(door._id, door.data.isLocked);
						break;
					}
					default:
						break;
				}
			}
		});
		DoorController.append(door);
	});
	alt.log(`~lg~${ATHENA_DOORLOCK} ${VERSION_STRING.version} | DATABASE | ==> found ${dbDoors.length} doors to load.`);
}