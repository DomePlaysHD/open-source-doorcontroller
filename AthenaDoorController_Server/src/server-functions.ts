import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ATHENA_DOORCONTROLLER, settings, Translations } from '../index';

import { playerFuncs } from '../../../server/extensions/Player';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { InteractionController } from '../../../server/systems/interaction';
import { DoorController } from './server-streamer';
import { ANIMATION_FLAGS } from '../../../shared/flags/animationFlags';
import { ItemFactory } from '../../../server/systems/item';

import IDoorControl from './interfaces/IDoorControl';
import IDoorObjects from './interfaces/IDoorObjects';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { sha256, sha256Random } from '../../../server/utility/encryption';

export let doorInteraction: any;

export async function createDoor(player: alt.Player, doorData: IDoorControl) {
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
				lockHash: sha256(JSON.stringify(doorData.keyData.keyName)).substring(0, 40)
			}
		},
		pos: doorData.pos as alt.Vector3,
		rotation: doorData.rotation as alt.Vector3,
		center: doorData.center as alt.Vector3
	};
	const inserted = await Database.insertData<IDoorControl>(newDocument, settings.collectionName, true);
        doorInteraction = InteractionController.add({
            identifier: `door-${inserted._id}`,
            description: 'Use Door',
            range: 1,
            position: { x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z - 1 },
            callback: (player: alt.Player) => {
                const keyExists = ItemFactory.get(inserted.keyData.keyName);
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
                            maxDistance: settings.textLabelDistance
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
                            maxDistance: settings.textLabelDistance
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
			maxDistance: settings.textLabelDistance
		});
	}

	alt.emit('doorController:serverSide:createKey', player, inserted.keyData.keyName, doorData.keyData.keyDescription, inserted.keyData.data.lockHash, inserted.keyData.data.faction);
	DoorController.append(inserted);
    DoorController.refresh();
	playerFuncs.emit.message(player, `==> {01DF01} ${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version}{FFFFFF} <==`);
	playerFuncs.emit.message(player, `==> {FFFFFF} Auto filled door prop by database ==> {01DF01}${inserted.data.prop}`);
}
export async function updateLockstate(doorId: string, isLocked: boolean) {
	const door = await Database.fetchData<IDoorControl>('_id', doorId, settings.collectionName);
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

export async function loadDoors() {
	const doorProps = await Database.fetchAllData<IDoorObjects>(settings.collectionDoorProps);
	const dbDoors = await Database.fetchAllData<IDoorControl>(settings.collectionName);
	dbDoors.forEach((door, index) => {
		switch (door.data.isLocked) {
			case false: {
				if(settings.doorTextEnabled) {
					ServerTextLabelController.append({
						pos: { x: door.center.x, y: door.center.y, z: door.center.z },
						data: `~g~${Translations.UNLOCKED}`,
						uid: `door-${door._id.toString()}`,
						maxDistance: settings.textLabelDistance
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
						maxDistance: settings.textLabelDistance
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
                const keyExists = ItemFactory.get(door.keyData.keyName);

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
                                maxDistance: settings.textLabelDistance
                            });
                        }
						playerFuncs.emit.animation(player, settings.animDict, settings.animName, ANIMATION_FLAGS.NORMAL, settings.animDuration);
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
                                maxDistance: settings.textLabelDistance
                            });
                        }
						playerFuncs.emit.animation(player, settings.animDict, settings.animName, ANIMATION_FLAGS.NORMAL, settings.animDuration);
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
	alt.log(`~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | ==> found ${dbDoors.length} doors to load.`);
	alt.log(`~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | ==> default doors ${doorProps.length}`);
}

export const doorObjects = Array<IDoorObjects>();
export async function pushObjectArray(player: alt.Player) {
	const objects = await Database.fetchAllData<IDoorObjects>(settings.collectionDoorProps);
	objects.forEach(async (obj, i) => {
		doorObjects.push(obj);
	});
	alt.emitClient(player, 'DoorController:Client:SendDatabaseObjects', doorObjects);
}