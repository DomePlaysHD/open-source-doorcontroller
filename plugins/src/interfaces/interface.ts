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
    /* posData: {
        pos?: alt.Vector3,
        rotation?: alt.Vector3,
        center?: alt.Vector3,
    } */

    keyData: {
        keyName?: string;
        keyDescription?: string;
        keyHash?: string;
        
        keyData?: {
            faction?: string;
            lockHash?: string;
        }
    }
    pos: alt.Vector3,
    rotation: alt.Vector3,
    center: alt.Vector3,
};