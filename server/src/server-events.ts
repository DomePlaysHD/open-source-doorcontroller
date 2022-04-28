import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import { PlayerEvents } from '../../../../server/events/playerEvents';
import { ServerTextLabelController } from '../../../../server/streamers/textlabel';
import { InteractionController } from '../../../../server/systems/interaction';
import { sha256Random } from '../../../../server/utility/encryption';
import { ATHENA_EVENTS_PLAYER } from '../../../../shared/enums/athenaEvents';
import { config } from '../../shared/config/index';
import { DoorControllerEvents } from '../../shared/enums/events';
import { IDoorOld } from '../../shared/interfaces/IDoorOld';
import { DoorController } from './controller';

alt.onClient(DoorControllerEvents.createDoor, async (player: alt.Player, data, inputData) => {
    const door: IDoorOld = {
        name: inputData.name,
        data: {
            prop: data[0],
            hash: alt.hash(data[0]),
            isLocked: false,
            faction: inputData.faction,
        },
        keyData: {
            keyName: inputData.keyName,
            keyDescription: inputData.keyDescription,
            data: {
                faction: inputData.faction,
                lockHash: sha256Random(inputData.keyName).substring(0, 40),
            },
        },
        pos: data[3],
        rotation: data[2],
        center: data[1],
    };

    const dbDoor = await Athena.database.funcs.fetchData<IDoorOld>(
        'pos',
        data[3],
        config.dbCollection,
    );

    if (dbDoor === null) {
        const insertedDoor = await Athena.database.funcs.insertData(door, config.dbCollection, true);
        ServerTextLabelController.append({
            data: '~g~UNLOCKED',
            pos: data[1],
            maxDistance: 5,
            uid: insertedDoor._id.toString(),
        });

        InteractionController.add({
            position: { x: data[3].x, y: data[3].y, z: data[3].z - 1 },
            range: 3,
            description: 'Use Door',
            callback: () => DoorController.updateDoor(player, insertedDoor._id)
        });

        DoorController.createKey(player, door.keyData.keyName, door.keyData.keyDescription, door.keyData.data.faction);
        DoorController.append(insertedDoor);
    } else if (dbDoor !== null) {
        alt.logError('Door already exists!');
        return;
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, async (player: alt.Player) => {
    player.setLocalMeta('permissionLevel', player.accountData.permissionLevel);
    const dbDoors = await DoorController.getAll();
    DoorController.update(player, dbDoors as IDoorOld[]);
});
