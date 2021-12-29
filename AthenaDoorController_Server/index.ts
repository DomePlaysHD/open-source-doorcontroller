// Core-Imports
import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { ATHENA_EVENTS_PLAYER } from '../../shared/enums/athenaEvents';
import { DoorController } from './src/server-streamer';
import { PluginSystem } from '../../server/systems/plugins';
import { loadItems } from './src/server-keys';
import { loadDoors } from './src/server-functions';

// Serverside Imports
import './src/server-events';
import './src/server-functions';
import './src/server-streamer';
import './src/server-keys';
import './src/interfaces/IDoorControl';
import './src/interfaces/IDoorControlProps';

export const settings = {
	collectionName: 'doors', // Used to Create Collection, Insert Datas, Update Datas
	collectionPropsName: 'doors-props', // Used to store props. Unnecessary for now.
	doorTextEnabled: true, // If false doors won't have textlabels attached to center - Interaction is still possible.
	textLabelDistance: 3,
	requiredPermissionLevel: 4,
	keyIconName: 'keys', // Used to search through items database for the keys, all keys should use the same icon.
}

export enum Translations {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
    KEY_MISSING = ''
}

export const ATHENA_DOORCONTROLLER = {
	name: "Athena DoorController",
	version: 'v3.0',
}

PluginSystem.registerPlugin(ATHENA_DOORCONTROLLER.name, async () => {
    alt.log(`~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} - ${ATHENA_DOORCONTROLLER.version} ==> successfully loaded.`);
	
	loadDoors();
	loadItems();

	await Database.createCollection(settings.collectionName);
	await Database.createCollection('doors-props');
});

alt.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
	DoorController.refresh();
});