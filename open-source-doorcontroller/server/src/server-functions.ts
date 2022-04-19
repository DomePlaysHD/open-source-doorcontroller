import * as alt from 'alt-server';
import { Athena } from '../../../../../server/api/athena';
import { PlayerEvents } from '../../../../../server/events/playerEvents';
import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { ATHENA_EVENTS_PLAYER } from '../../../../../shared/enums/athenaEvents';
import { SYSTEM_EVENTS } from '../../../../../shared/enums/system';
import { ANIMATION_FLAGS } from '../../../../../shared/flags/animationFlags';
import { config } from '../../shared/config/index';
import { DoorControllerEvents } from '../../shared/enums/events';
import { Translations } from '../../shared/enums/translations';
import IDoor from '../../shared/interfaces/IDoor';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';
import { DoorController } from './controller';


export async function updateLockstate(player: alt.Player, doorId: string, isLocked: boolean) {
    const door = await Athena.database.funcs.fetchData<IDoor>('_id', doorId, config.dbCollection);

    let translatedLockstate = door.data.isLocked ? `~r~` + Translations.Locked : `~g~` + Translations.Unlocked;

    door.data.isLocked = !door.data.isLocked;

    if (config.useTextLabels) {
        translatedLockstate = door.data.isLocked ? `~r~` + Translations.Locked : `~g~` + Translations.Unlocked;
        ServerTextLabelController.remove(door._id.toString());
        ServerTextLabelController.append({
            pos: { x: door.center.x, y: door.center.y, z: door.center.z },
            data: translatedLockstate,
            uid: door._id.toString(),
            maxDistance: config.textLabelRange,
        });
    }

    if (config.useAnimation) {
        Athena.player.emit.animation(
            player,
            config.animationDictionary,
            config.animationName,
            ANIMATION_FLAGS.NORMAL,
            config.animationDuration,
        );
    }

    await Athena.database.funcs.updatePartialData(
        doorId,
        {
            data: door.data,
        },
        config.dbCollection,
    );

    alt.log(`${door.name} is now ${isLocked ? '~r~' + Translations.Locked : '~g~' + Translations.Unlocked}`);
    DoorController.refresh();
}

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
