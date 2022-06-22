import { PERMISSIONS } from "../../../../shared/flags/permissionFlags";

export const config = {
    pluginName: 'DoorController',
    permissionsRequired: PERMISSIONS.ADMIN,
    animationName: 'idle_a',
    animationDictionary: 'anim@heists@keycard@',
    animationDuration: 3000,

    // EXPERIMENTAL - Backup your fucking database before you change this!
    convertInterfaceOnStart: false,

    dbCollection: 'doors',
    doorDetectionRange: 1,
    doorStreamRange: 25,

    keyToOpenUi: 117,

    useAnimation: true,
    useTextLabels: true,

    textLabelRange: 25,
    interactionRange: 2,

}

export enum DOORCONTROLLER_TRANSLATIONS {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
}