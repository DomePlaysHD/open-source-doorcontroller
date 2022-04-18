import * as alt from 'alt-server';
import IDoorControl from '../../shared/interfaces/IDoorControl';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';

import { ATHENA_DOORCONTROLLER } from '../index';
import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { sha256 } from '../../../../server/utility/encryption';
import { ANIMATION_FLAGS } from '../../../../shared/flags/animationFlags';
import { doorsPropsDefaults } from '../../shared/defaults/doors-props';
import { InteractionController } from '../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import { DOORCONTROLLER_SETTINGS, DOORCONTROLLER_TRANSLATIONS } from '../../shared/settings';
import { SYSTEM_EVENTS } from '../../../../shared/enums/system';
import { PlayerEvents } from '../../../../server/events/playerEvents';
import { ATHENA_EVENTS_PLAYER } from '../../../../shared/enums/athenaEvents';
import { Athena } from '../../../../server/api/athena';
import { DoorController } from './controller';

export async function createDoor(player: alt.Player, doorData: IDoorControl) {
    const doorDocument: IDoorControl = {
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
                lockHash: sha256(JSON.stringify(doorData.keyData.keyName)).substring(0, 20),
            },
            keyDescription: doorData.keyData.keyDescription,
        },
        pos: doorData.pos as alt.Vector3,
        rotation: doorData.rotation as alt.Vector3,
        center: doorData.center as alt.Vector3,
    };

    const door = await Athena.database.funcs.insertData<IDoorControl>(
        doorDocument,
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
        true,
    );

    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
        ServerTextLabelController.append({
            pos: { x: door.center.x, y: door.center.y, z: door.center.z } as alt.Vector3,
            data: `~g~${DOORCONTROLLER_TRANSLATIONS.UNLOCKED}`,
            uid: door._id.toString(),
            maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
        });
    }
    // TODO: Refactor into main update lockstate function
    InteractionController.add({
        uid: door._id.toString(),
        description: 'Use Door',
        range: 1,
        position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
        callback: (player: alt.Player) => {
            const translatedLockstate = door.data.isLocked
                ? `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED
                : `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED;

            if (!Athena.player.inventory.isInInventory(player, { name: door.keyData.keyName })) {
                Athena.player.emit.notification(player, `It seems like you are missing Key ${door.keyData.keyName}!`);
                return;
            }

            if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                ServerTextLabelController.append({
                    pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                    data: translatedLockstate,
                    uid: door._id.toString(),
                    maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                });
            }

            Athena.player.emit.animation(
                player,
                DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                ANIMATION_FLAGS.NORMAL,
                DOORCONTROLLER_SETTINGS.ANIMATION_DURATION,
            );

            door.data.isLocked = !door.data.isLocked;
            updateLockstate(door._id.toString(), door.data.isLocked);
        },
    });

    alt.emit(
        DOORCONTROLLER_EVENTS.CREATE_KEY,
        player,
        door.keyData.keyName,
        door.keyData.keyDescription,
        door.keyData.data.lockHash,
        door.keyData.data.faction,
    );

    DoorController.append(door);
    DoorController.refresh();

    Athena.player.emit.notification(
        player,
        `~g~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version}~w~ ==> ${door.data.prop}`,
    );
}
export async function updateLockstate(doorId: string, isLocked: boolean) {
    const door = await Athena.database.funcs.fetchData<IDoorControl>('_id', doorId, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    await Athena.database.funcs.updatePartialData(
        doorId,
        {
            data: {
                isLocked,
            },
        },
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
    );
    alt.log(
        `${door.name} is now ${
            isLocked ? '~g~' + DOORCONTROLLER_TRANSLATIONS.UNLOCKED : '~r~' + DOORCONTROLLER_TRANSLATIONS.LOCKED
        }`,
    );
    DoorController.refresh();
}

export async function loadDoors() {
    let doorProps = await Athena.database.funcs.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);

    if (!doorProps || doorProps.length <= 0) {
        for (let i = 0; i < doorsPropsDefaults.length; i++) {
            const doorprop: IDoorObjects = {
                name: doorsPropsDefaults[i].name,
                hash: doorsPropsDefaults[i].hash,
            };
            await Athena.database.funcs.insertData<IDoorObjects>(doorprop, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS, false);
        }
        doorProps = await Athena.database.funcs.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
    }

    const dbDoors = await Athena.database.funcs.fetchAllData<IDoorControl>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    for (let x = 0; x < dbDoors.length; x++) {
        const door = dbDoors[x];
        let translatedLockstate = door.data.isLocked
            ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
            : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;

        if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
            ServerTextLabelController.append({
                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                data: translatedLockstate,
                uid: door._id.toString(),
                maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
            });
        }

        InteractionController.add({
            uid: door._id.toString(),
            description: 'Use Door',
            range: 1,
            position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
            callback: (player: alt.Player) => {
                door.data.isLocked = !door.data.isLocked;
                
                if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                    translatedLockstate = door.data.isLocked
                        ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
                        : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;
                    ServerTextLabelController.remove(door._id.toString());
                    ServerTextLabelController.append({
                        pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                        data: translatedLockstate,
                        uid: door._id.toString(),
                        maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                    });
                }

                Athena.player.emit.animation(
                    player,
                    DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                    DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                    ANIMATION_FLAGS.NORMAL,
                    DOORCONTROLLER_SETTINGS.ANIMATION_DURATION,
                );

                updateLockstate(door._id, door.data.isLocked);
            },
        });
        DoorController.append(door);
        alt.logError(JSON.stringify(door));
    }
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${dbDoors.length} Doors!`,
    );
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${doorProps.length} default Doors!`,
    );
}

export const dbDoorArray = Array<IDoorObjects>();
alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, async () => {
    const databaseDoors = await Athena.database.funcs.fetchAllData<IDoorObjects>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
    for (let i = 0; i < databaseDoors.length; i++) {
        dbDoorArray.push(databaseDoors[i]);
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
    alt.emitClient(player, 'DCTest', dbDoorArray);
});
