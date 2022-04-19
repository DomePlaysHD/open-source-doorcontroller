import { Vector3 } from "alt-shared";
import { IDoorKeys } from "./IDoorKeys";

export default interface IDoor {
    // New Structure - Athena Version > 3.1.0
    _id?: string;
    door?: {
        name: string;
        prop: string;
        hash: number;
        isLocked: boolean;
        faction: string;
    },
    key: IDoorKeys;
    
    pos: Vector3;
    rotation: Vector3;
    center: Vector3;
    version?: number;

    // TODO: Remove this once the new version is released
    // Old Structure - Athena Version < 3.1.0
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
    // pos: Vector3;
    // rotation: Vector3;
    // center: Vector3;
}
