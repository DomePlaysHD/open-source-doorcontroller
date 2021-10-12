import * as alt from 'alt-client';
import * as native from 'natives';
import Doorsystem from '../../plugins/AthenaDoorlock/interface';

alt.onServer('Doorsystem:Clientside:Setlockstate', (door: Doorsystem) => {
	const closestDoor = native.getClosestObjectOfType(door.data.position.x, door.data.position.y, door.data.position.z, 2, door.data.hash, false, false, false);
	native.freezeEntityPosition(closestDoor, door.data.lockstate);
	alt.log(door.data.position);
});
