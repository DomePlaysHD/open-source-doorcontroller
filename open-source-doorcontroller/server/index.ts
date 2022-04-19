import * as alt from 'alt-server';

import { config } from '../shared/config/index';
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
 
    await Athena.database.funcs.createCollection(config.dbCollection);
    await Athena.database.funcs.createCollection(config.dbCollectionProps);
});
