import * as alt from 'alt-server';
import { Athena } from '../../../../../server/api/athena';
import { PlayerEvents } from '../../../../../server/events/playerEvents';
import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { InteractionController } from '../../../../../server/systems/interaction';
import { sha256Random } from '../../../../../server/utility/encryption';
import { ATHENA_EVENTS_PLAYER } from '../../../../../shared/enums/athenaEvents';
import { config } from '../../shared/config/index';
import { DoorControllerEvents } from '../../shared/enums/events';
import { IDoorOld } from '../../shared/interfaces/IDoorOld';
import { DoorController } from './controller';

alt.onClient(DoorControllerEvents.createDoor, async (player: alt.Player, prop: string, data) => {
    const door: IDoorOld = {
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

    const dbDoor = await Athena.database.funcs.fetchData<IDoorOld>(
        'pos',
        data.position,
        config.dbCollection,
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
            callback: () => DoorController.updateDoor(player, door._id)
        });

        await Athena.database.funcs.insertData(door, config.dbCollection, false);
        
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
    DoorController.update(player, allDoors as IDoorOld[]);
});
