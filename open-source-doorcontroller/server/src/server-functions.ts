import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import IDoorControl from '../../shared/interfaces/IDoorControl';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';

import { ATHENA_DOORCONTROLLER, Translations } from '../index';
import { playerFuncs } from '../../../../server/extensions/extPlayer';
import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { ItemFactory } from '../../../../server/systems/item';
import { sha256 } from '../../../../server/utility/encryption';
import { ANIMATION_FLAGS } from '../../../../shared/flags/animationFlags';
import { DoorController } from '../controller';
import { doorsPropsDefaults } from '../../shared/defaults/doors-props';
import { InteractionController } from '../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import { DOORCONTROLLER_SETTINGS } from '../../shared/settings';

export let doorInteraction: string;

export async function createDoor(player: alt.Player, doorData: IDoorControl) {
    const newDocument: IDoorControl = {
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
                lockHash: sha256(JSON.stringify(doorData.keyData.keyName)).substring(0, 40),
            },
        },
        pos: doorData.pos as alt.Vector3,
        rotation: doorData.rotation as alt.Vector3,
        center: doorData.center as alt.Vector3,
    };
    const inserted = await Database.insertData<IDoorControl>(newDocument, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION, true);
    doorInteraction = InteractionController.add({
        uid: `door-${inserted._id}`,
        description: 'Use Door',
        range: 1,
        position: { x: inserted.pos.x, y: inserted.pos.y, z: inserted.pos.z - 1 },
        callback: (player: alt.Player) => {
            const keyExists = ItemFactory.get(inserted.keyData.keyName);
            if (!keyExists) {
                alt.log('Key does not exist. ' + inserted.keyData.keyName);
                return;
            }

            if (!playerFuncs.inventory.isInInventory(player, { name: inserted.keyData.keyName })) {
                playerFuncs.emit.notification(player, `It seems like you are missing Key ${inserted.keyData.keyName}!`);
                return;
            }

            switch (inserted.data.isLocked) {
                case false: {
                    inserted.data.isLocked = true;
                    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                        ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
                            data: `~r~${Translations.LOCKED}`,
                            uid: `door-${inserted._id.toString()}`,
                            maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                        });
                    }
                    playerFuncs.emit.animation(
                        player,
                        DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                        DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                        ANIMATION_FLAGS.NORMAL,
                        DOORCONTROLLER_SETTINGS.ANIMATION_DURATION,
                    );
                    updateLockstate(inserted._id, inserted.data.isLocked);
                    break;
                }
                case true: {
                    inserted.data.isLocked = false;
                    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                        ServerTextLabelController.remove(`door-${inserted._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z },
                            data: `~g~${Translations.UNLOCKED}`,
                            uid: `door-${inserted._id.toString()}`,
                            maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                        });
                    }
                    playerFuncs.emit.animation(
                        player,
                        DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                        DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                        ANIMATION_FLAGS.NORMAL,
                        DOORCONTROLLER_SETTINGS.ANIMATION_DURATION,
                    );
                    updateLockstate(inserted._id, inserted.data.isLocked);
                    break;
                }
                default:
                    break;
            }
            updateLockstate(inserted._id.toString(), inserted.data.isLocked);
        },
    });

    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
        ServerTextLabelController.append({
            pos: { x: inserted.center.x, y: inserted.center.y, z: inserted.center.z } as alt.Vector3,
            data: `~g~${Translations.UNLOCKED}`,
            uid: `door-${inserted._id.toString()}`,
            maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
        });
    }

    alt.emit(
        DOORCONTROLLER_EVENTS.CREATE_KEY,
        player,
        inserted.keyData.keyName,
        doorData.keyData.keyDescription,
        inserted.keyData.data.lockHash,
        inserted.keyData.data.faction,
    );

    DoorController.append(inserted);
    DoorController.refresh();

    playerFuncs.emit.notification(
        player,
        `~g~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version}~w~ ==> ${inserted.data.prop}`,
    );
}
export async function updateLockstate(doorId: string, isLocked: boolean) {
    const door = await Database.fetchData<IDoorControl>('_id', doorId, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
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
                },
            },
            pos: { x: door.pos.x, y: door.pos.y, z: door.pos.z } as alt.Vector3,
            rotation: { x: door.rotation.x, y: door.rotation.y, z: door.rotation.z } as alt.Vector3,
            center: { x: door.center.x, y: door.center.y, z: door.center.z } as alt.Vector3,
        },
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
    );
    DoorController.refresh();
}

export async function loadDoors() {
    let doorProps = await Database.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);

    if (!doorProps || doorProps.length <= 0) {
        for (let i = 0; i < doorsPropsDefaults.length; i++) {
            const doorprop: IDoorObjects = {
                name: doorsPropsDefaults[i].name,
                hash: doorsPropsDefaults[i].hash,
            };
            await Database.insertData<IDoorObjects>(doorprop, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS, false);
        }
        doorProps = await Database.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
    }

    const dbDoors = await Database.fetchAllData<IDoorControl>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    dbDoors.forEach((door) => {
        switch (door.data.isLocked) {
            case false: {
                if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                    ServerTextLabelController.append({
                        pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                        data: `~g~${Translations.UNLOCKED}`,
                        uid: `door-${door._id.toString()}`,
                        maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                    });
                }
                break;
            }
            case true: {
                if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                    ServerTextLabelController.append({
                        pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                        data: `~r~${Translations.LOCKED}`,
                        uid: `door-${door._id.toString()}`,
                        maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                    });
                }
                break;
            }
            default: {
                break;
            }
        }
        doorInteraction = InteractionController.add({
            uid: `door-${door._id}`,
            description: 'Use Door',
            range: 1,
            position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
            callback: (player: alt.Player) => {
                const keyExists = ItemFactory.get(door.keyData.keyName);

                if (!keyExists) {
                    alt.log('Key does not exist. ' + door.keyData.keyName);
                    return;
                }

                if (!playerFuncs.inventory.isInInventory(player, { name: door.keyData.keyName })) {
                    playerFuncs.emit.notification(player, `It seems like you are missing Key ${door.keyData.keyName}!`);
                    return;
                }

                switch (door.data.isLocked) {
                    case false: {
                        door.data.isLocked = true;
                        if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                            ServerTextLabelController.remove(`door-${door._id.toString()}`);
                            ServerTextLabelController.append({
                                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                                data: `~r~${Translations.LOCKED}`,
                                uid: `door-${door._id.toString()}`,
                                maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                            });
                        }
                        playerFuncs.emit.animation(
                            player,
                            DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                            DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                            ANIMATION_FLAGS.NORMAL,
                            DOORCONTROLLER_SETTINGS.ANIMATION_DURATION
                        );
                        updateLockstate(door._id, door.data.isLocked);
                        break;
                    }
                    case true: {
                        door.data.isLocked = false;
                        if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                            ServerTextLabelController.remove(`door-${door._id.toString()}`);
                            ServerTextLabelController.append({
                                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                                data: `~g~${Translations.UNLOCKED}`,
                                uid: `door-${door._id.toString()}`,
                                maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                            });
                        }
                        playerFuncs.emit.animation(
                            player,
                            DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                            DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                            ANIMATION_FLAGS.NORMAL,
                            DOORCONTROLLER_SETTINGS.ANIMATION_DURATION
                        );
                        updateLockstate(door._id, door.data.isLocked);
                        break;
                    }
                    default:
                        break;
                }
            },
        });
        DoorController.append(door);
    });
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | ==> found ${dbDoors.length} doors to load.`,
    );
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | ==> default doors ${doorProps.length}`,
    );
}

export const doorObjects = Array<IDoorObjects>();
export async function pushObjectArray(player: alt.Player) {
    const objects = await Database.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
    objects.forEach(async (obj, i) => {
        doorObjects.push(obj);
    });
    alt.emitClient(player, DOORCONTROLLER_EVENTS.DATABASE_DATA, doorObjects);
}
