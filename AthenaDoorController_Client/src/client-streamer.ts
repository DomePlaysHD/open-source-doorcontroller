import * as alt from 'alt-client';
import * as native from 'natives';
import IDoorControl from '../../../plugins/AthenaDoorController/src/interfaces/interface';
import { waitUntilDoorIsClosed } from './client-functions';

alt.onServer('populate:Doors', (doors: Array<IDoorControl>) => {
	doors.forEach(async (door, index) => {
		const closestDoor = native.getClosestObjectOfType(door.pos.x, door.pos.y, door.pos.z, 2, door.data.hash, false, false, false);
		const defaultRotation = doors[index].rotation;
		if(!closestDoor) return;

		const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
		if(!isDoorClosed) {
			return;
		}
		
		if(doors[index].data.isLocked === true) {
			native.freezeEntityPosition(closestDoor, true);
		} else if(doors[index].data.isLocked === false) {
			native.freezeEntityPosition(closestDoor, false);
		}
	});
}); 