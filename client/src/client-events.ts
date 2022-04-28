import alt from 'alt-client';
import natives from 'natives';

import { WebViewController } from '../../../../client/extensions/view2';
import { DoorControllerEvents } from '../../shared/enums/events';
import { IDoorOld } from '../../shared/interfaces/IDoorOld';
import { waitUntilDoorIsClosed } from './client-functions';

const view = await WebViewController.get();
view.on(DoorControllerEvents.createDoor, (data) => {
    alt.emitServer(DoorControllerEvents.createDoor, data);
});

alt.onServer(DoorControllerEvents.populateDoors, async (doors: Array<IDoorOld>) => {
    for (let x = 0; x < doors.length; x++) {
        const door = doors[x];
        const closestDoor = natives.getClosestObjectOfType(
            door.pos.x,
            door.pos.y,
            door.pos.z,
            2,
            alt.hash(door.data.prop),
            false,
            false,
            false,
        );
        const defaultRotation = door.rotation;

        const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
        if (!isDoorClosed) {
            return;
        }

        if (door.data.isLocked) {
            natives.freezeEntityPosition(closestDoor, true);
            natives.setEntityRotation(closestDoor, defaultRotation.x, defaultRotation.y, defaultRotation.z, 2, false);
        } else {
            natives.freezeEntityPosition(closestDoor, false);
        }
    }
});
