// Core-Imports
import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';

import { loadItems } from './src/server-keys';
import { doorObjects, loadDoors, pushObjectArray } from './src/server-functions';
import { DoorController } from './controller';
import { PlayerEvents } from '../../../server/events/playerEvents';
import { PluginSystem } from '../../../server/systems/plugins';
import { ATHENA_EVENTS_PLAYER } from '../../../shared/enums/athenaEvents';
// Serverside Imports
import './controller';
import './src/server-events';
import './src/server-functions';
import './src/server-keys';
import { DOORCONTROLLER_SETTINGS } from '../shared/settings';

export enum Translations {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
    KEY_MISSING = '',
}

export const ATHENA_DOORCONTROLLER = {
    name: 'Athena DoorController',
    version: 'v3.0',
};

PluginSystem.registerPlugin(ATHENA_DOORCONTROLLER.name, async () => {
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} - ${ATHENA_DOORCONTROLLER.version} ==> successfully loaded.`,
    );

    loadDoors();
    loadItems();

    await Database.createCollection(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    await Database.createCollection(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
    DoorController.refresh();
    if (!player.hasMeta('DoorController:ArrayObjects')) {
        pushObjectArray(player);
        player.setMeta('DoorController:ArrayObjects', doorObjects);
    } else {
        return;
    }
});
