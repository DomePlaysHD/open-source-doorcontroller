import * as alt from 'alt-client';
import * as native from 'natives';
import Doorsystem from '../../plugins/AthenaDoorlock/src/interface';


alt.onServer('populate:Doors', (doors: Array<Doorsystem>) => {
	doors.forEach(async (door, index) => {
		const closestDoor = native.getClosestObjectOfType(door.pos.x, door.pos.y, door.pos.z, 2, door.hash, false, false, false);
		const defaultRotation = doors[index].rotation;
		if(!closestDoor) return;
		const isDoorClosed = await waitUntilDoorIsClosed(closestDoor, defaultRotation.z);
		if(!isDoorClosed) {
			console.log("Door seems to be unclosed. " + isDoorClosed);
		}
		if(doors[index].lockstate === true) {
			native.freezeEntityPosition(closestDoor, true);
		} else if(doors[index].lockstate === false) {
			native.freezeEntityPosition(closestDoor, false);
		}
	});
}); 

// >> Thanks to YANN (alt:V Discord - Snippets)
function waitUntilDoorIsClosed(entity: number, originOrientationYaw: number): Promise<boolean> {
    return new Promise(resolve => {
        const timeout = setTimeout(() => { clearInterval(interval), resolve(false) }, 5000);
        let i = 0;

        const interval = setInterval(() => {
            if (i === 5) { clearTimeout(timeout), clearInterval(interval), resolve(true) }
            if (isNumberBetween(originOrientationYaw, native.getEntityRotation(entity, 2).z, 1)) {
                i++
            } else {
                i = 0;
            }
        }, 10);
    });
}

function isNumberBetween(n1: number, n2: number, range: number): boolean {
    return n1 - range < n2 && n2 < n1 + range;
}