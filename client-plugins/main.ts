import * as alt from 'alt-client';
import * as native from 'natives';

alt.onServer('Doorsystem:Clientside:Setlockstate', (door: any) => {
	native.doorControl(
		parseInt(door.hash),
		parseFloat(door.position.x),
		parseFloat(door.position.y),
		parseFloat(door.position.z),
		door.lockstate,
		0,
		50,
		0
	);
});

alt.onServer('Doorsystem:Clientside:Setlockstates', (lockedDoors: any) => {
	alt.setTimeout(() => {
		const test = native.doorControl(
			parseInt(lockedDoors.hash),
			parseFloat(lockedDoors.x),
			parseFloat(lockedDoors.y),
			parseFloat(lockedDoors.z),
			lockedDoors.lockstate,
			0,
			50,
			0
		);
		alt.log(JSON.stringify(test));
	}, 1000);
});
