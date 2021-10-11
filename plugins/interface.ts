export default interface Doorsystem {
	_id?: string;
	name?: string;
	data: {
		prop?: string;
		hash?: number;
		faction?: string;
		position?: any;
		rotation?: any;
		lockstate?: boolean;
		// player?: string | number < SCRIPT YOURSELF >
		// keys?: string; < SCRIPT YOURSELF >
	};
}
