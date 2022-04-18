import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { InteractionController } from '../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';
import { ATHENA_EVENTS_PLAYER } from '../../../../shared/enums/athenaEvents';
import { updateLockstate } from './server-functions';
import { DoorController } from './controller';
import { PlayerEvents } from '../../../../server/events/playerEvents';
import { Athena } from '../../../../server/api/athena';
import { sha256 } from '../../../../server/utility/encryption';
import { DOORCONTROLLER_SETTINGS } from '../../shared/settings';

alt.onClient(DOORCONTROLLER_EVENTS.DOOR_DATA, (player: alt.Player, data: IDoorControl) => {
    data.keyData.data.lockHash = sha256(data.keyData.data.lockHash);
    DoorController.createDoor(data);
});

alt.onClient(DOORCONTROLLER_EVENTS.CREATE_DOOR, async (player: alt.Player, prop: string, data) => {
    const door: IDoorControl = {
        name: data.doorName,
        data: {
            prop: prop,
            hash: 0,
            isLocked: false,
            faction: 'none',
        },
        keyData: {
            keyName: data.keyName,
            keyDescription: data.keyDescription,
            data: {
                faction: data.faction,
                lockHash: 'none',
            },
        },
        pos: data.position,
        rotation: data.rotation,
        center: data.center,
    };

    const dbDoor = await Athena.database.funcs.fetchData<IDoorControl>(
        'pos',
        data.position,
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
    );
    if (dbDoor === null) {
        ServerTextLabelController.append({
            data: '~g~UNLOCKED',
            pos: data.center,
            maxDistance: 5,
        });

        InteractionController.add({
            position: { x: data.position.x, y: data.position.y, z: data.position.z - 1 },
            range: 3,
            description: 'Use Door',
            callback: () => {
                alt.logError('Hello World!');
            },
        });

        await Athena.database.funcs.insertData(door, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION, false);
        DoorController.append(door);
    } else if (dbDoor !== null) {
        alt.logError('Door already exists!');
        return;
    }
});

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
