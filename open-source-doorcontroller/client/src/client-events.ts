import * as alt from 'alt-client';
import * as native from 'natives';

import { WebViewController } from '../../../../client/extensions/view2';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import { waitUntilDoorIsClosed } from './client-functions';
import IDoorControl from '../../shared/interfaces/IDoorControl';

const player = alt.Player.local;
const doorsView = await WebViewController.get();

/*
doorsView.on(DOORCONTROLLER_EVENTS.OPEN_WEBVIEW, async () => {
    for (let x = 0; x < clientDoorArray.length; x++) {
        const obj = clientDoorArray[x];
        doorNumber = native.getClosestObjectOfType(
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0.5,
            alt.hash(obj.name),
            false,
            false,
            false,
        );
        if (doorNumber) {
            console.log(`Found Door ==> ${obj.name}`);
            prop = obj.name;
            rotation = native.getEntityRotation(doorNumber, 2);
            center = getEntityCenter(doorNumber);
        }
    }
});
*/
alt.onServer(DOORCONTROLLER_EVENTS.POPULATE_DOORS, async (doors: Array<IDoorControl>) => {
    for(let x = 0; x < doors.length; x++) {
        const door = doors[x];
        alt.log(JSON.stringify(door.data.hash));
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
        const defaultRotation = door.rotation;

        const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
        if (!isDoorClosed) {
            return;
        }

        if (door.data.isLocked === true) {
            native.freezeEntityPosition(closestDoor, true);
            native.setEntityRotation(closestDoor, defaultRotation.x, defaultRotation.y, defaultRotation.z, 2, false);
        } else if (door.data.isLocked === false) {
            native.freezeEntityPosition(closestDoor, false);
        }
    }
});
