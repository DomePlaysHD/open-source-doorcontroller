// TODO: Remove Benchmark
import alt from 'alt-client';
import natives from 'natives';
import { clientDoorArray } from '../index';
import { benchmarkTime } from '../../../development-plugin/shared/benchmark';
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
                0.5,
                alt.hash(obj.name),
                false,
                false,
                false,
            );

            closeDoor = natives.getCoordsAndRotationOfClosestObjectOfType(
                player.pos.x,
                player.pos.y,
                player.pos.z,
                0.5,
                alt.hash(obj.name),
                null,
                null,
                2,
            );

            if (foundObject) {
                alt.log(`Found Door ==> ${obj.name}`);
                return obj.name;
            }
        }
        return null;
    }
}