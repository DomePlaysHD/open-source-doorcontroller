import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';

import { loadItems } from './src/server-keys';
import { loadDoors } from './src/server-functions';
import { PluginSystem } from '../../../server/systems/plugins';

// Serverside Imports
import './controller';
import './src/server-events';
import './src/server-functions';
import './src/server-keys';
import { DOORCONTROLLER_SETTINGS } from '../shared/settings';

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
