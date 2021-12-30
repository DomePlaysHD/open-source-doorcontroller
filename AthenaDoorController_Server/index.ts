// Core-Imports
import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { ATHENA_EVENTS_PLAYER, ATHENA_EVENTS_PLAYER_CLIENT } from '../../shared/enums/athenaEvents';
import { DoorController } from './src/server-streamer';
import { PluginSystem } from '../../server/systems/plugins';
import { loadItems } from './src/server-keys';
import { doorObjects, loadDoors, pushObjectArray } from './src/server-functions';

// Serverside Imports
import './src/server-events';
import './src/server-functions';
import './src/server-streamer';
import './src/server-keys';
import './src/interfaces/IDoorControl';
import './src/interfaces/IDoorObjects';
import { PlayerEvents } from '../../server/events/playerEvents';
import IDoorProps from './src/interfaces/IDoorProps';
import { doorProps } from './src/doorProps';


export const settings = {
	collectionName: 'doors', // Used to Create Collection, Insert Datas, Update Datas
	collectionDoorProps: 'doors-props', // Used to store props. Used to find default doors. Better don't change it if you've no clue what you are doing here.
	doorTextEnabled: true, // If false doors won't have textlabels attached to center - Interaction is still possible.
	textLabelDistance: 3,
	requiredPermissionLevel: 4,
	keyIconName: 'keys', // Used to search through items database for the keys, all keys should use the same icon.
	animDict: 'anim@heists@keycard@',
	animName: 'idle_a',
	animDuration: 3000
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
	await Database.createCollection(settings.collectionDoorProps);
	const propsExisting = await Database.fetchAllData('doors-props');
	let props: IDoorProps = JSON.parse('{ "name": "string", "hash": 4 }');
	if(propsExisting.length === 0) {
		for(let i = 0; i < doorProps.length; i++) {
			const propDoc: IDoorProps = {
				name: props.name,
				hash: props.hash
			}
			await Database.insertData(propDoc, 'doors-props', false);
		}
		alt.log(`Builded Door Props Database.`)
	} else {
		alt.log(`Door Props Database already exists.`);
	}
});

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, (player: alt.Player) => {
	DoorController.refresh();
	if(!player.hasMeta('DoorController:ArrayObjects')) {
		pushObjectArray(player);
		player.setMeta('DoorController:ArrayObjects', doorObjects)
	} else {
		return;
	};
});

alt.on('playerDisconnect', (player: alt.Player) => {
	player.deleteMeta('DoorController:ArrayObjects');
});


