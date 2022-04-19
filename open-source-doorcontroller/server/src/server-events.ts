import * as alt from 'alt-server';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { DOORCONTROLLER_SETTINGS } from '../../shared/settings';
import { InteractionController } from '../../../../../server/systems/interaction';
import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';
import { ATHENA_EVENTS_PLAYER } from '../../../../../shared/enums/athenaEvents';
import { DoorController } from './controller';
import { PlayerEvents } from '../../../../../server/events/playerEvents';
import { sha256Random } from '../../../../../server/utility/encryption';
import { Athena } from '../../../../../server/api/athena';

alt.onClient(DOORCONTROLLER_EVENTS.CREATE_DOOR, async (player: alt.Player, prop: string, data) => {
    const door: IDoorControl = {
        name: data.doorName,
        data: {
            prop: prop,
            hash: alt.hash(prop),
            isLocked: false,
            faction: data.faction,
        },
        keyData: {
            keyName: data.keyName,
            keyDescription: data.keyDescription,
            data: {
                faction: data.faction,
                lockHash: sha256Random(data.keyName).substring(0, 40),
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
            callback: () => DoorController.updateDoor(player, dbDoor._id)
        });

        await Athena.database.funcs.insertData(door, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION, false);
        
        DoorController.createKey(player, door.keyData.keyName, door.keyData.keyDescription, door.keyData.data.faction);
        DoorController.append(door);
    } else if (dbDoor !== null) {
        alt.logError('Door already exists!');
        return;
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SPAWNED, async (player: alt.Player) => {
    player.setLocalMeta('Permissionlevel', player.accountData.permissionLevel);
    const allDoors = await DoorController.getAll();
    DoorController.update(player, allDoors);
});
