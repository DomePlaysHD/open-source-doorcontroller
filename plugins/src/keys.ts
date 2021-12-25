// *** Door Keys can be created here. *** //

import { ITEM_TYPE } from "../../../shared/enums/itemTypes";
import { Item } from "../../../shared/interfaces/item";
import { appendToItemRegistry } from "../../../shared/items/itemRegistry";
import { deepCloneObject } from "../../../shared/utility/deepCopy";

// Just some Example Key which can be used if database keyname equals "LSPD Master Key"
const someKey: Item = {
    name: `LSPD Master Key`,
    uuid: `LSPD-MasterKey`,
    description: `Probably used to unlock/lock all doors of the Mission Row Police Department.`,
    icon: 'crate',
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.CONSUMABLE,
    data: {
        
    },
    rarity: 3
};
const registerLSPDKey: Item = deepCloneObject<Item>(someKey);
appendToItemRegistry(registerLSPDKey);