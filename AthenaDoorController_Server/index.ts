// Core-Imports
import * as alt from 'alt-server';
import { ATHENA_EVENTS_PLAYER } from '../../shared/enums/athenaEvents';
import { PluginSystem } from '../../server/systems/plugins';
import { loadItems } from './src/server-keys';
import { doorObjects, loadDoors, pushObjectArray } from './src/server-functions';

// Serverside Imports
import './controller';
import './src/server-events';
import './src/server-functions';
import './src/server-keys';
import './src/interfaces/IDoorControl';
import './src/interfaces/IDoorObjects';
import { PlayerEvents } from '../../server/events/playerEvents';
import ChatController from '../../server/systems/chat';
import { PERMISSIONS } from '../../shared/flags/permissionFlags';
import { DoorController } from './controller';
import { playerFuncs } from '../../server/extensions/extPlayer';
import Database from '@stuyk/ezmongodb';
import VehicleFuncs from '../../server/extensions/vehicleFuncs';
import { VehicleSystem } from '../../server/systems/vehicle';

export const settings = {
    collectionName: 'doors', // Used to Create Collection, Insert Datas, Update Datas
    collectionDoorProps: 'doors-props', // Used to store props. Used to find default doors. Better don't change it if you've no clue what you are doing here.
    doorTextEnabled: true, // If false doors won't have textlabels attached to center - Interaction is still possible.
    textLabelDistance: 3,
    requiredPermissionLevel: 4,
    keyIconName: 'keys', // Used to search through items database for the keys, all keys should use the same icon.
    animDict: 'anim@heists@keycard@',
    animName: 'idle_a',
    animDuration: 3000,
};

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

    await Database.createCollection(settings.collectionName);
    await Database.createCollection(settings.collectionDoorProps);
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

ChatController.addCommand('TestAdd', '/TestAdd - Adds a door per DoorController.', PERMISSIONS.ADMIN, someTesting);
function someTesting(player: alt.Player) {
    playerFuncs.emit.message(player, `Testing.....`);
    alt.emitClient(player, 'DoorController:Client:SendData');
}
