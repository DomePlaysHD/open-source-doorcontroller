import alt from 'alt-client';
import natives from 'natives';

import { WebViewController } from '../../../../client/extensions/view2';
import { DoorControllerEvents } from '../../shared/enums/events';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';
import { IDoorOld } from '../../shared/interfaces/IDoorOld';
import { waitUntilDoorIsClosed } from './client-functions';


const view = await WebViewController.get();
export let clientDoorArray: IDoorObjects [] = [];

view.on(
    DoorControllerEvents.createDoor,
    (name, data) => {
        alt.emitServer(DoorControllerEvents.createDoor, name, data);
    },
);

alt.onServer(DoorControllerEvents.fillArray, (dbDoors: Array<IDoorObjects>) => {
    clientDoorArray = dbDoors;
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
        } else if (!door.data.isLocked) {
            natives.freezeEntityPosition(closestDoor, false);
        }
    }
});
