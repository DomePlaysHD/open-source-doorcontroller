import * as alt from 'alt-client';
import * as native from 'natives';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import IDoorControl from '../../shared/interfaces/IDoorControl';
import { waitUntilDoorIsClosed } from './client-functions';

alt.onServer(DOORCONTROLLER_EVENTS.POPULATE_DOORS, (doors: Array<IDoorControl>) => {
    doors.forEach(async (door, index) => {
        const closestDoor = native.getClosestObjectOfType(
            door.pos.x,
            door.pos.y,
            door.pos.z,
            2,
            door.data.hash,
            false,
            false,
            false,
        );
        const defaultRotation = doors[index].rotation;

        const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
        if (!isDoorClosed) {
            return;
        }

        if (doors[index].data.isLocked === true) {
            native.freezeEntityPosition(closestDoor, true);
            native.setEntityRotation(closestDoor, defaultRotation.x, defaultRotation.y, defaultRotation.z, 2, false);
        } else if (doors[index].data.isLocked === false) {
            native.freezeEntityPosition(closestDoor, false);
        }
    });
});
