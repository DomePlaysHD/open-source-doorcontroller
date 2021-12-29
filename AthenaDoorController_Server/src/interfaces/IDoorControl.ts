import * as alt from 'alt-server';

export default interface IDoorControl {
    _id?: string;
    name?: string;
    data: {
        prop?: string;
        hash?: number;
        isLocked?: boolean;
        faction?: string;
    }
    keyData: {
        keyName?: string;
        keyDescription?: string;
        data?: {
            faction?: string;
            lockHash?: string;
        }
    }
    pos: alt.Vector3,
    rotation: alt.Vector3,
    center: alt.Vector3,
};