import { PERMISSIONS } from "../../../../shared/flags/permissionFlags";

export const config = {
    pluginName: 'Athena-OSDoorController',
    pluginVersion: 'v1.0 | ~r~Development~g~',
    permissionsRequired: PERMISSIONS.ADMIN,
    animationName: 'idle_a',
    animationDictionary: 'anim@heists@keycard@',
    animationDuration: 3000,

    dbCollectionProps: 'doors-props',
    dbCollection: 'doors',
    doorDetectionRange: 1,
    
    keyToOpenUi: 37,
    
    useAnimation: true,
    useTextLabels: true,

    textLabelRange: 25,
    interactionRange: 2,
}

export enum DOORCONTROLLER_TRANSLATIONS {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
}