export enum DOORCONTROLLER_EVENTS {
    POPULATE_DOORS = 'DoorController:PopulateDoors',

    ADD_DOOR = 'DoorController:AddDoor',
    REMOVE_DOOR = 'DoorController:RemoveDoor',
    CREATE_KEY = 'DoorController:CreateKey',

    DATABASE_DATA = 'DoorController:DatabaseData',
    READ_DATA = 'DoorController:ReadData',
    DOOR_DATA = 'DoorController:SendDoors',

    UPDATE_LOCKSTATE = 'DoorController:UpdateLockstate',
    OPEN_INPUTMENU = 'DoorController:OpenInputMenu',
    OPEN_CUSTOM_INPUTMENU = 'DoorController:OpenCustomInputMenu',

    CHECK_PERMISSIONS = 'DoorController:CheckPermissions',
    PERMISSION_GRANTED = 'DoorController:PermissionGranted',
    CLOSE_UI = 'DoorController:CloseUI',
}