import * as alt from 'alt-server';

export default interface Doorsystem {
    _id?: string;
    name?: string;
    prop?: string;
    hash?: number;
	lockstate?: boolean;
    pos?: alt.Vector3;
	center?: alt.Vector3;
    rotation?: alt.Vector3;
    keyName?: string;
    keyDescription?: string;
};
