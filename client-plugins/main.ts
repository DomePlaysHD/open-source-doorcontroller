import * as alt from 'alt-client';
import * as native from 'natives';
import Doorsystem from '../../plugins/AthenaDoorlock/interface';

alt.onServer('Doorsystem:Clientside:Setlockstate', (door: Doorsystem) => {
	// const closestDoor = native.getClosestObjectOfType(door.pos.x, door.pos.y, door.pos.z, 2, door.hash, false, false, false);
	// native.freezeEntityPosition(closestDoor, door.lockstate);
});

alt.onServer('populate:Doors', (door: Array<Doorsystem>) => {
	alt.log("Calling door controller update...");
	door.forEach((test, i) => {
		if(door[i].lockstate) {
			alt.log("DoorControl - Locked a door. " + door[i].lockstate);
			native.doorControl(door[i].hash, door[i].pos.x, door[i].pos.y, door[i].pos.z, door[i].lockstate, door[i].rotation.x, door[i].rotation.y, door[i].rotation.z);
		} else if(!door[i].lockstate) {
			native.doorControl(door[i].hash, door[i].pos.x, door[i].pos.y, door[i].pos.z, door[i].lockstate, door[i].rotation.x, door[i].rotation.y, door[i].rotation.z);
			alt.log("DoorControl - Unlocked a door. " + door[i].lockstate);
		}
	});
}); 