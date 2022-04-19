import * as alt from 'alt-server';
import IDoorControl from '../../shared/interfaces/IDoorControl';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';

import { DOORCONTROLLER_SETTINGS, DOORCONTROLLER_TRANSLATIONS } from '../../shared/settings';
import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { ATHENA_DOORCONTROLLER } from '../index';
import { InteractionController } from '../../../../../server/systems/interaction';
import { ATHENA_EVENTS_PLAYER } from '../../../../../shared/enums/athenaEvents';
import { doorsPropsDefaults } from '../../shared/defaults/doors-props';
import { ANIMATION_FLAGS } from '../../../../../shared/flags/animationFlags';
import { DoorController } from './controller';
import { SYSTEM_EVENTS } from '../../../../../shared/enums/system';
import { PlayerEvents } from '../../../../../server/events/playerEvents';
import { Athena } from '../../../../../server/api/athena';
import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';

export async function updateLockstate(player: alt.Player, doorId: string, isLocked: boolean) {
    const door = await Athena.database.funcs.fetchData<IDoorControl>(
        '_id',
        doorId,
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
    );

    let translatedLockstate = door.data.isLocked
        ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
        : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;

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

    await Athena.database.funcs.updatePartialData(
        doorId,
        {
            data: door.data,
        },
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
    );

    alt.log(
        `${door.name} is now ${
            isLocked ? '~r~' + DOORCONTROLLER_TRANSLATIONS.LOCKED : '~g~' + DOORCONTROLLER_TRANSLATIONS.UNLOCKED
        }`,
    );
    DoorController.refresh();
}

export const dbDoorArray = Array<IDoorObjects>();
alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, async () => {
    const databaseDoors = await Athena.database.funcs.fetchAllData<IDoorObjects>(
        DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS,
    );
    for (let i = 0; i < databaseDoors.length; i++) {
        dbDoorArray.push(databaseDoors[i]);
    }
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
    alt.emitClient(player, DOORCONTROLLER_EVENTS.FILL_ARRAY, dbDoorArray);
});
