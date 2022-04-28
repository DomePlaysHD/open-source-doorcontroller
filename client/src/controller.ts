import alt from 'alt-client';
import natives from 'natives';
import { config } from '../../shared/config';
import { doorProps } from '../../shared/defaults/door-props';
import { getEntityCenter } from './client-functions';

export class DoorController {
    static async checkNearDoors() {
        const startTime = Date.now();
        const player = alt.Player.local;
        const pos = player.pos;

        let closeDoor: [any, alt.Vector3, alt.Vector3];
        for(let x = 0; x < doorProps.length; x++) {
            const obj = doorProps[x];
            const hash = alt.hash(obj);
            const foundObject = natives.getClosestObjectOfType(
                pos.x,
                pos.y,
                pos.z,
                config.doorDetectionRange,
                hash,
                false,
                false,
                false,
            );

            closeDoor = natives.getCoordsAndRotationOfClosestObjectOfType(
                player.pos.x,
                player.pos.y,
                player.pos.z,
                config.doorDetectionRange,
                hash,
                null,
                null,
                2,
            );

            if (foundObject) {
                const name = obj;
                const center = getEntityCenter(foundObject);
                const rotation = natives.getEntityRotation(foundObject, 2);
                const position = closeDoor[1];
                return [name, center, rotation, position];
            }
        };
        return [];
    }
}
