import alt from 'alt-client';
import natives from 'natives';
import { config } from '../../shared/config';
import { clientDoorArray } from './client-events';
import { getEntityCenter } from './client-functions';

export class DoorController {
    static checkNearDoors() {
        const player = alt.Player.local;
        const pos = player.pos;

        let closeDoor: [any, alt.Vector3, alt.Vector3];

        for (let x = 0; x < clientDoorArray.length; x++) {
            const obj = clientDoorArray[x];
            const foundObject = natives.getClosestObjectOfType(
                pos.x,
                pos.y,
                pos.z,
                config.doorDetectionRange,
                alt.hash(obj.name),
                false,
                false,
                false,
            );

            closeDoor = natives.getCoordsAndRotationOfClosestObjectOfType(
                player.pos.x,
                player.pos.y,
                player.pos.z,
                config.doorDetectionRange,
                alt.hash(obj.name),
                null,
                null,
                2,
            );

            if (foundObject) {
                const name = obj.name;
                const center = getEntityCenter(foundObject);
                const rotation = natives.getEntityRotation(foundObject, 2);
                const position = closeDoor[1];
                return [name, center, rotation, position];
            }
        }
        return [];
    }
}
