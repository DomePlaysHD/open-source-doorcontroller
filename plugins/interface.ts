import * as alt from 'alt-server';
export default interface Doorsystem {
	_id?: string;
	name?: string;
	data: {
		prop?: string;
		hash?: number;
		faction?: string;
		position?: alt.Vector3;
		rotation?: alt.Vector3;
		lockstate?: boolean;
		// player?: string | number < SCRIPT YOURSELF >
		// keys?: string; < SCRIPT YOURSELF >
	};
}
