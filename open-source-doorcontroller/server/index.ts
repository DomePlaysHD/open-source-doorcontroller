import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import { PluginSystem } from '../../../../server/systems/plugins';
import { config } from '../shared/config/index';
import './src/controller';
import { DoorController } from './src/controller';
import './src/server-events';
import './src/server-functions';

PluginSystem.registerPlugin(config.pluginName, async () => {
    alt.log(
        `~lg~${config.pluginName} ${config.pluginVersion} ==> successfully loaded.`,
    );

    DoorController.convertInterface();
    DoorController.loadDoors();
 
    await Athena.database.funcs.createCollection(config.dbCollection);
    await Athena.database.funcs.createCollection(config.dbCollectionProps);
});
