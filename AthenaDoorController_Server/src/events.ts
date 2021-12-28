import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { playerFuncs } from '../../../server/extensions/Player';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { InteractionController } from '../../../server/systems/interaction';
import { createDoor, doorInteraction, updateLockstate } from '../index';
import IDoorControl from './interfaces/interface';


alt.onClient('doorController:serverSide:addDoor', (player: alt.Player, doorData: IDoorControl) => {
	createDoor(doorData);
});

alt.onClient('doorController:serverSide:removeDoor', async (player: alt.Player) => {
	const doors = await Database.fetchAllData<IDoorControl>('doors');
	doors.forEach(async (door, index) => {
		if (player.pos.isInRange(door.pos as alt.Vector3, 2)) {
			playerFuncs.emit.notification(player, `Successfully removed door with the prop ${door.name} and the hash: ${door.data.hash}.`);
			alt.setTimeout(() => {
				InteractionController.remove(doorInteraction.getType(), doorInteraction.getIdentifier());
				ServerTextLabelController.remove(`door-${door._id.toString()}`);
			}, 500);
			door.data.isLocked = false;
			updateLockstate(door._id, false);
			await Database.deleteById(door._id, 'doors');
		}
		return true;
	});
});

// Received when a key should be removed from the items database.
alt.onClient('doorController:client:removeKey', () => {

});