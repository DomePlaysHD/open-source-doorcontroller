import * as alt from 'alt-server';
import { Athena } from '../../../../../server/api/athena';
import { PlayerEvents } from '../../../../../server/events/playerEvents';
import { ATHENA_EVENTS_PLAYER } from '../../../../../shared/enums/athenaEvents';
import { SYSTEM_EVENTS } from '../../../../../shared/enums/system';
import { config } from '../../shared/config/index';
import { DoorControllerEvents } from '../../shared/enums/events';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';

export const dbDoorArray = Array<IDoorObjects>();
alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, async () => {
    const databaseDoors = await Athena.database.funcs.fetchAllData<IDoorObjects>(config.dbCollectionProps);
    for (let i = 0; i < databaseDoors.length; i++) {
        dbDoorArray.push(databaseDoors[i]);
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
    alt.emitClient(player, DoorControllerEvents.fillArray, dbDoorArray);
});
