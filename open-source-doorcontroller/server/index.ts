import * as alt from 'alt-server';

import { DOORCONTROLLER_SETTINGS } from '../shared/settings';
import { DoorController } from './src/controller';
import { PluginSystem } from '../../../../server/systems/plugins';
import { Athena } from '../../../../server/api/athena';

import './src/controller';
import './src/server-events';
import './src/server-functions';

export const ATHENA_DOORCONTROLLER = {
    name: 'Athena DoorController',
    version: 'v1.0 - Release',
};

PluginSystem.registerPlugin(ATHENA_DOORCONTROLLER.name, async () => {
    alt.log(
        `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} - ${ATHENA_DOORCONTROLLER.version} ==> successfully loaded.`,
    );

    DoorController.loadDoors();
 
    await Athena.database.funcs.createCollection(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    await Athena.database.funcs.createCollection(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS);
});
