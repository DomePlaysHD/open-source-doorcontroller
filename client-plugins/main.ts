import * as alt from 'alt-client';
import * as native from 'natives';
import Doorsystem from '../../plugins/AthenaDoorlock/interface';

alt.onServer('populate:Doors', (door: Array<Doorsystem>) => {
	door.forEach((test, i) => {
		const closestDoor = native.getClosestObjectOfType(test.pos.x, test.pos.y, test.pos.z, 2, test.hash, false, false, false);
		if(door[i].lockstate) {
			native.freezeEntityPosition(closestDoor, true);
		} else if(!door[i].lockstate) {
			native.freezeEntityPosition(closestDoor, false);
		}
	});
}); 