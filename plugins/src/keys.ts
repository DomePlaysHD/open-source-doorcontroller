// *** Door Keys can be created here. *** //
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ItemFactory } from "../../../server/systems/item";
import { sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from "../../../shared/enums/itemTypes";
import { Item } from "../../../shared/interfaces/item";
import { appendToItemRegistry } from '../../../shared/items/itemRegistry';
import { deepCloneObject } from '../../../shared/utility/deepCopy';

export async function loadItems() {
    const allItems = await Database.fetchAllData<Item>('items');
    allItems.forEach((item, i) => {
        const dbItem: Item = {
            name: item.name,
            uuid: item.uuid,
            description: item.description,
            icon: 'keys',
            quantity: 1,
            behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
            model: 'bkr_prop_jailer_keys_01a',
            data: {},
            rarity: 3,
            dbName: item.name
        };
        const registerKey: Item = deepCloneObject<Item>(dbItem);
        appendToItemRegistry(registerKey);
    });
} 

alt.on('doorController:serverSide:createKey', async (keyName: string, keyDescription: string) => {
    const keyItem: Item = {
        name: keyName,
        uuid: sha256(keyName),
        description: keyDescription,
        icon: 'keys',
        quantity: 1,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
        model: 'bkr_prop_jailer_keys_01a',
        data: {},
        rarity: 3,
        dbName: keyName
    };
    ItemFactory.add(keyItem);

    const registerKey: Item = deepCloneObject<Item>(keyItem);
    appendToItemRegistry(registerKey);

    const keyExists = ItemFactory.doesExist(keyItem.dbName);
    if(keyExists) {
        return;
    }
});
