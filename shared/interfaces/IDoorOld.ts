import { Vector3 } from "alt-shared";

export interface IDoorOld {
    // TODO: Remove this once the new version is released
    // Old Structure - Athena Version < 3.1.0
    _id?: string;
    name?: string;
    data?: {
        prop?: string;
        hash?: number;
        isLocked?: boolean;
        faction?: string;
    };
    keyData?: {
        keyName?: string;
        keyDescription?: string;
        data?: {
            faction?: string;
            lockHash?: string;
        };
    };
    pos: Vector3;
    rotation: Vector3;
    center: Vector3;
}