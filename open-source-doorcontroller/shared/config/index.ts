import { PERMISSIONS } from "../../../../../shared/flags/permissionFlags";

export const config = {
    pluginName: 'Athena-OSDoorController',
    pluginVersion: '1.0.0 - Release',
    permissionsRequired: PERMISSIONS.ADMIN,
    animationName: 'idle_a',
    animationDictionary: 'anim@heists@keycard@',
    animationDuration: 3000,

    dbCollectionProps: 'doors-props',
    dbCollection: 'doors',

    keyToOpenUi: 37,
    
    useAnimation: false,
    useTextLabels: true,

    textLabelRange: 25,
    interactionRange: 2,
}

export enum DOORCONTROLLER_TRANSLATIONS {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
}