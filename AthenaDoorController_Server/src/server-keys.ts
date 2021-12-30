// *** Door Keys can be created here. *** //
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { settings } from '../index';
import { ItemFactory } from "../../../server/systems/item";
import { sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from "../../../shared/enums/ItemTypes";
import { Item } from "../../../shared/interfaces/item";
import { playerFuncs } from '../../../server/extensions/Player';

export async function loadItems() {
    const allItems = await Database.fetchAllData<Item>('items');
    allItems.forEach((item, i) => {
        if(item.icon === settings.keyIconName) {
            const dbItem: Item = {
                name: item.name,
                uuid: item.uuid,
                description: item.description,
                icon: 'keys',
                quantity: 1,
                behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
                model: 'bkr_prop_jailer_keys_01a',
                data: {
                    lockHash: item.data.lockHash,
                    faction: item.data.faction
                },
                rarity: 3,
                dbName: item.name
            };
        }
    });
} 

alt.on('doorController:serverSide:createKey', async (player: alt.Player, keyName: string, keyDescription: string, lockHash: string, faction: string) => {
    const keyItem: Item = {
        name: keyName,
        uuid: sha256(keyName),
        description: keyDescription,
        icon: 'keys',
        quantity: 1,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
        model: 'bkr_prop_jailer_keys_01a',
        data: {
            lockHash: lockHash,
            faction: faction
        },
        rarity: 3,
        dbName: keyName
    };

    await ItemFactory.add(keyItem);
    if(!await ItemFactory.doesExist(keyName)) {
        playerFuncs.emit.message(player, `==> Key Created: {01DF01}${keyName}`);
        playerFuncs.emit.message(player, `==> Key Description: {01DF01}${keyDescription}`);
        playerFuncs.emit.message(player, `==> Key Lockhash: {01DF01}${lockHash}`);
    }
});