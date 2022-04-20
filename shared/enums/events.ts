export const enum DoorControllerEvents {
    createDoor = 'DoorController:AddDoor',
    createKey = 'DoorController:CreateKey',
    fillArray = 'DoorController:FillArray',
    
    updateLockState = 'DoorController:UpdateLockstate',
    
    populateDoors = 'DoorController:PopulateDoors',
    pushDefaultDoor = 'DoorController:PushDefaultDoor',
    removeDoor = 'DoorController:RemoveDoor',
    openWebview = 'DoorController:OpenWebview',
}