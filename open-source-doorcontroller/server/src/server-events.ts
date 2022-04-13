import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { createDoor, updateLockstate } from './server-functions';
import { ATHENA_DOORCONTROLLER, settings, Translations } from '../index';
import { DoorController } from '../controller';
import { playerFuncs } from '../../../../server/extensions/extPlayer';
import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { sha256 } from '../../../../server/utility/encryption';
import { InteractionController } from '../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';

alt.onClient(DOORCONTROLLER_EVENTS.DOOR_DATA, (player: alt.Player, data: IDoorControl) => {
    data.keyData.data.lockHash = sha256(data.keyData.data.lockHash);
    DoorController.addDoor(data);
});

alt.onClient(DOORCONTROLLER_EVENTS.ADD_DOOR, (player: alt.Player, doorData: IDoorControl) => {
    createDoor(player, doorData);
    alt.log(JSON.stringify(doorData));
});

alt.onClient('Test', (player: alt.Player, doorData: IDoorControl) => {
    createDoor(player, doorData);
    alt.log(JSON.stringify(doorData));
});

alt.onClient(DOORCONTROLLER_EVENTS.UPDATE_LOCKSTATE, async (player: alt.Player) => {
    const doors = await Database.fetchAllData<IDoorControl>('doors');
    doors.forEach(async (door, index) => {
        if (player.pos.isInRange(door.pos, 3)) {
            switch (door.data.isLocked) {
                case true: {
                    door.data.isLocked = false;
                    if (settings.doorTextEnabled) {
                        ServerTextLabelController.remove(`door-${door._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                            data: `~r~${Translations.LOCKED}`,
                            uid: `door-${door._id.toString()}`,
                            maxDistance: 3,
                        });
                    }
                    playerFuncs.emit.notification(player, `Door is now unlocked.`);
                    await updateLockstate(door._id, door.data.isLocked);
                    alt.emitClient(player, DOORCONTROLLER_EVENTS.CLOSE_UI);
                    break;
                }
                case false: {
                    door.data.isLocked = true;
                    if (settings.doorTextEnabled) {
                        ServerTextLabelController.remove(`door-${door._id.toString()}`);
                        ServerTextLabelController.append({
                            pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                            data: `~r~${Translations.LOCKED}`,
                            uid: `door-${door._id.toString()}`,
                            maxDistance: 3,
                        });
                    }
                    playerFuncs.emit.notification(player, `Door is now locked.`);
                    await updateLockstate(door._id, door.data.isLocked);
                    alt.emitClient(player, DOORCONTROLLER_EVENTS.CLOSE_UI);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    });
});

alt.onClient(DOORCONTROLLER_EVENTS.REMOVE_DOOR, async (player: alt.Player) => {
    const doors = await Database.fetchAllData<IDoorControl>('doors');
    doors.forEach(async (door, index) => {
        if (player.pos.isInRange(door.pos as alt.Vector3, 2)) {
            playerFuncs.emit.notification(
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
        return true;
    });
});

alt.onClient(DOORCONTROLLER_EVENTS.READ_DATA, async (player: alt.Player) => {
    const allDoors = await Database.fetchAllData<IDoorControl>(settings.collectionName);
    allDoors.forEach((door, index) => {
        if (player.pos.isInRange(door.pos, 2)) {
            playerFuncs.emit.message(
                player,
                `{01DF01} ${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version}{FFFFFF}`,
            );
            playerFuncs.emit.message(player, `==> Door ID: {01DF01}${door._id}`);
            playerFuncs.emit.message(player, `==> Door Name: {01DF01}${door.name}`);
            playerFuncs.emit.message(player, `==> Door Prop: {01DF01}${door.data.prop}`);
            playerFuncs.emit.message(player, `==> Door Faction: {01DF01}${door.data.faction}`);
            alt.emitClient(player, DOORCONTROLLER_EVENTS.CLOSE_UI);
        }
    });
});

alt.onClient(DOORCONTROLLER_EVENTS.CHECK_PERMISSIONS, (player: alt.Player) => {
    if (player.accountData.permissionLevel >= settings.requiredPermissionLevel) {
        alt.emitClient(player, DOORCONTROLLER_EVENTS.PERMISSION_GRANTED);
    } else {
        return false;
    }
    return true;
});
