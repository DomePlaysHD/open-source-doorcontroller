import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { createDoor, updateLockstate } from './server-functions';
import { DoorController } from './controller';
import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { InteractionController } from '../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import { DOORCONTROLLER_SETTINGS } from '../../shared/settings';
import { Athena } from '../../../../server/api/athena';
import { sha256 } from '../../../../server/utility/encryption';
import { PlayerEvents } from '../../../../server/events/playerEvents';
import { ATHENA_EVENTS_PLAYER } from '../../../../shared/enums/athenaEvents';

alt.onClient(DOORCONTROLLER_EVENTS.DOOR_DATA, (player: alt.Player, data: IDoorControl) => {
    data.keyData.data.lockHash = sha256(data.keyData.data.lockHash);
    DoorController.createDoor(data);
});

alt.onClient(DOORCONTROLLER_EVENTS.ADD_DOOR, (player: alt.Player, doorData: IDoorControl) => {
    createDoor(player, doorData);
});
/* 
alt.onClient(DOORCONTROLLER_EVENTS.UPDATE_LOCKSTATE, async (player: alt.Player) => {
    const allDoors = await Database.fetchAllData<IDoorControl>('doors');
    for (let x = 0; x < allDoors.length; x++) {
        const door = allDoors[x];
        if (player.pos.isInRange(door.pos, 3)) {
            door.data.isLocked = !door.data.isLocked;
            const translatedLockstate = door.data.isLocked ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;
            
            if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                ServerTextLabelController.remove(`door-${door._id.toString()}`);
                ServerTextLabelController.append({
                    pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                    data: `~r~${DOORCONTROLLER_TRANSLATIONS.LOCKED}`,
                    uid: `door-${door._id.toString()}`,
                    maxDistance: 3,
                });
            }
            /* switch (door.data.isLocked) {
                case true: {
                    door.data.isLocked = false;
                    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                        ServerTextLabelController.remove(`door-${door._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                            data: `~r~${DOORCONTROLLER_TRANSLATIONS.LOCKED}`,
                            uid: `door-${door._id.toString()}`,
                            maxDistance: 3,
                        });
                    }
                    playerNotification(player, `Door is now unlocked.`);
                    await updateLockstate(door._id, door.data.isLocked);
                    alt.emitClient(player, DOORCONTROLLER_EVENTS.CLOSE_UI);
                    break;
                }
                case false: {
                    door.data.isLocked = true;
                    if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                        ServerTextLabelController.remove(`door-${door._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                            data: `~r~${DOORCONTROLLER_TRANSLATIONS.LOCKED}`,
                            uid: `door-${door._id.toString()}`,
                            maxDistance: 3,
                        });
                    }
                    playerNotification(player, `Door is now locked.`);
                    await updateLockstate(door._id, door.data.isLocked);
                    alt.emitClient(player, DOORCONTROLLER_EVENTS.CLOSE_UI);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
}); */

alt.onClient(DOORCONTROLLER_EVENTS.REMOVE_DOOR, async (player: alt.Player) => {
    const allDoors = await Database.fetchAllData<IDoorControl>('doors');
    for (let x = 0; x < allDoors.length; x++) {
        const door = allDoors[x];
        if (player.pos.isInRange(door.pos as alt.Vector3, 2)) {
            Athena.player.emit.notification(
                player,
                `~g~AthenaDoorController => ~w~Successfully removed Door ~g~${door.name} ~w~| ~g~${door.data.prop} ~w~| ~g~${door.data.hash}.`,
            );
            door.data.isLocked = false;
            updateLockstate(door._id, false);

            InteractionController.remove(`door-${door._id}`);
            ServerTextLabelController.remove(`door-${door._id.toString()}`);

            await Database.deleteById(door._id, 'doors');
            DoorController.refresh();
        }
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
    player.setLocalMeta('Permissionlevel', player.accountData.permissionLevel);
});