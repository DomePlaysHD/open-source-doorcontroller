import * as alt from 'alt-server';

import { Athena } from '../../../server/api/athena';
import { PluginSystem } from '../../../server/systems/plugins';
import { config } from '../shared/config/index';
import { DoorController } from './src/controller';

import './src/controller';
import './src/server-events';

PluginSystem.registerPlugin(config.pluginName, async () => {
    alt.log(
        `~lg~[PLUGIN] ==> ${config.pluginName} has been loaded!`,
    );

    // DoorController.convertInterface();
    DoorController.loadDoors();
 
    await Athena.database.funcs.createCollection(config.dbCollection);
});
