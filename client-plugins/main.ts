import * as alt from 'alt-client';
import * as native from 'natives';
import Doorsystem from '../../plugins/AthenaDoorlock/interface';

alt.onServer('populate:Doors', (door: Array<Doorsystem>) => {
	alt.log("Calling door controller update...");
	door.forEach((test, i) => {
		const closestDoor = native.getClosestObjectOfType(test.pos.x, test.pos.y, test.pos.z, 2, test.hash, false, false, false);
		if(door[i].lockstate) {
			alt.log("DoorControl - Locked a door. " + door[i].lockstate);
			native.freezeEntityPosition(closestDoor, true);
		} else if(!door[i].lockstate) {
			native.freezeEntityPosition(closestDoor, false);
			alt.log("DoorControl - Unlocked a door. " + door[i].lockstate);
		}
	});
}); 