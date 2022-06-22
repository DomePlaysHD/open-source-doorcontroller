import { Vector3 } from "alt-shared";
import { IDoorKeys } from "./IDoorKeys";

// Athena OSDoorController New interface Structure - Athena Version > 3.1.0
export default interface IDoor {
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
    rot: Vector3;
    center: Vector3;
    version?: number;
}
