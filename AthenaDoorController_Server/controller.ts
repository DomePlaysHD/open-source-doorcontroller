import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { playerFuncs } from '../../server/extensions/extPlayer';
import { ItemFactory } from '../../server/systems/item';
import { StreamerService } from '../../server/systems/streamer';
import { sha256, sha256Random } from '../../server/utility/encryption';
import { ITEM_TYPE } from '../../shared/enums/itemTypes';
import { Item } from '../../shared/interfaces/item';
import IDoorControl from './src/interfaces/IDoorControl';

const globalDoors: Array<IDoorControl> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export const DOORCONTROLLER_SETTINGS = {
    enableTextLabels: false,
    textLabelDistance: 5,
};

export const DOORCONTROLLER_DATABASE = {
    defaultCollection: 'doors',
    propsCollection: 'doors-props',
};

export class DoorController implements IDoorControl {
    _id?: string;
    name: string;
    data: { prop?: string; hash?: number; isLocked?: boolean; faction?: string };
    keyData: { keyName?: string; keyDescription?: string; data: { faction?: string; lockHash?: string } };
    pos: alt.Vector3;
    rotation: alt.Vector3;
    center: alt.Vector3;

    /**
     * Initializes the streamer to use this callback to update players.
     */
    static init() {
        StreamerService.registerCallback(KEY, DoorController.update, STREAM_RANGE);
    }

    /**
     * Called when stream data is updated for this type.
     */
    static update(player: alt.Player, doors: Array<IDoorControl>) {
        alt.emitClient(player, 'DoorController:Client:PopulateDoors', doors);
    }

    /**
     * Call this when you add / remove global stream data.
     */
    static refresh() {
        StreamerService.updateData(KEY, globalDoors);
    }

    /**
     * Call this when you want to add new stream data.
     */
    static append(doorData: IDoorControl): string {
        if (!doorData._id) {
            doorData._id = sha256Random(JSON.stringify(doorData));
        }

        globalDoors.push(doorData);
        DoorController.refresh();
        return doorData._id;
    }
    /**
     * Key will be automatically created through this method.
     * @param IDoorControl Door Datas, IDoorControl Interface
     * @returns Door found = true / Door not found = false
     */
    static async addDoor(data: IDoorControl): Promise<Boolean | null> {
        const keyItem: Item = {
            name: data.keyData.keyName,
            uuid: sha256(data.keyData.keyName),
            description: data.keyData.keyDescription,
            icon: 'keys',
            quantity: 1,
            behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
            model: 'bkr_prop_jailer_keys_01a',
            data: {
                lockHash: data.keyData.data.lockHash,
                faction: data.keyData.data.faction,
            },
            rarity: 3,
            dbName: data.keyData.keyName,
        };
        await ItemFactory.add(keyItem);

        await Database.insertData(data, DOORCONTROLLER_DATABASE.defaultCollection, false);
        alt.log(`Successfully added door. ${JSON.stringify(data)}`);
        return true;
    }

    static async giveKey(player: alt.Player, keyName: string, quantity?: number) {
        const keyToGive = await ItemFactory.getByName(keyName);
        const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
        const keyInInventory = playerFuncs.inventory.isInInventory(player, keyToGive);
        if(quantity) {
            keyToGive.quantity = quantity;
        }
        if(!keyToGive) return playerFuncs.emit.notification(player, `No valid key was found by name ${keyName}!`);
        if(!keyInInventory) {
            playerFuncs.inventory.inventoryAdd(player, keyToGive, emptySlot.slot);
        } else {
            if(quantity) {
                player.data.inventory[keyInInventory.index].quantity += quantity;
            } else {
                player.data.inventory[keyInInventory.index].quantity += 1;
            }
        }
        playerFuncs.save.field(player, 'inventory', player.data.inventory);
    }
}
DoorController.init();
