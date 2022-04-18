import { Vector3 } from "alt-shared";

export default interface IDoorControl {
    _id?: string;
    name: string;
    data: {
        prop?: string;
        hash?: number;
        isLocked?: boolean;
        faction?: string;
    };
    keyData: {
        keyName: string;
        keyDescription: string;
        data: {
            faction: string;
            lockHash: string;
        };
    };
    pos: Vector3;
    rotation: Vector3;
    center: Vector3;
}
