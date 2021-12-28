import * as alt from 'alt-server';

export default interface DoorControl_Main {
    _id?: string;

    data: {
        name?: string;
        prop?: string;
        hash?: number;
        lockState?: boolean;
        faction?: string;
    }
    keyData: {
        keyName?: string;
        keyDescription?: string;
        keyHash?: string;
        data?: {
            faction?: string;
            lockHash?: number;
        }
    }
    pos: alt.Vector3,
    rotation: alt.Vector3,
    center: alt.Vector3,
};