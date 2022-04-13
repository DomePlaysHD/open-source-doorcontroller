import * as alt from 'alt-client';
import * as native from 'natives';
import { DOORCONTROLLER_EVENTS } from '../shared/events';
import IDoorControl from '../shared/interfaces/IDoorControl';
import { clientDoorList } from './src/client-events';
import { getEntityCenter } from './src/client-functions';

const player = alt.Player.local;
// DO NOT TOUCH ME.
// LEAVE ME ALONE PLEASE.
export function clientAddDoor(data: IDoorControl) {
    const door: IDoorControl = {
        name: data.name,
        data: {
            prop: data.data.prop,
            hash: data.data.hash,
            isLocked: data.data.isLocked,
            faction: data.data.faction,
        },
        keyData: {
            keyName: data.keyData.keyName,
            keyDescription: data.keyData.keyDescription,
            data: {
                faction: data.keyData.data.faction,
                lockHash: data.keyData.data.lockHash,
            },
        },
        pos: null,
        rotation: null,
        center: null,
    };

    let doorType: number;
    let closeDoor: [any, alt.Vector3, alt.Vector3];

    clientDoorList.forEach((obj, i) => {
        doorType = native.getClosestObjectOfType(
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0.5,
            alt.hash(obj.name),
            false,
            false,
            false,
        );

        closeDoor = native.getCoordsAndRotationOfClosestObjectOfType(
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0.5,
            alt.hash(obj.name),
            null,
            null,
            2,
        );

        if (player.pos.isInRange(closeDoor[1], 2)) {
            if (doorType) {
                console.log(`Found Door ==> ${obj.name}`);
                door.data.prop = obj.name;
                door.data.hash = alt.hash(obj.name);
                door.pos = closeDoor[1];
                door.rotation = native.getEntityRotation(doorType, 2);
                door.center = getEntityCenter(doorType);
            }
        } else {
            return false;
        }
        return true;
    });
    alt.emitServer(DOORCONTROLLER_EVENTS.DOOR_DATA, door);
}
