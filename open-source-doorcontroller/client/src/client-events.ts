import alt from 'alt-client';
import natives from 'natives';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';
import { waitUntilDoorIsClosed } from './client-functions';
import { WebViewController } from '../../../../client/extensions/view2';

const view = await WebViewController.get();
view.on(
    DOORCONTROLLER_EVENTS.CREATE_DOOR,
    (name, data) => {
        alt.emitServer(DOORCONTROLLER_EVENTS.CREATE_DOOR, name, data);
    },
);

alt.onServer(DOORCONTROLLER_EVENTS.POPULATE_DOORS, async (doors: Array<IDoorControl>) => {
    for (let x = 0; x < doors.length; x++) {
        const door = doors[x];
        const closestDoor = natives.getClosestObjectOfType(
            door.pos.x,
            door.pos.y,
            door.pos.z,
            2,
            door.data.hash,
            false,
            false,
            false,
        );
        const defaultRotation = door.rotation;

        const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
        if (!isDoorClosed) {
            return;
        }

        if (door.data.isLocked === true) {
            natives.freezeEntityPosition(closestDoor, true);
            natives.setEntityRotation(closestDoor, defaultRotation.x, defaultRotation.y, defaultRotation.z, 2, false);
        } else if (door.data.isLocked === false) {
            natives.freezeEntityPosition(closestDoor, false);
        }
    }
});
