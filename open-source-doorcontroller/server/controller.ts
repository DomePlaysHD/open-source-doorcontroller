import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { ItemFactory } from '../../../server/systems/item';
import { StreamerService } from '../../../server/systems/streamer';
import { sha256Random, sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { Item } from '../../../shared/interfaces/item';
import { DOORCONTROLLER_EVENTS } from '../shared/events';
import IDoorControl from '../shared/interfaces/IDoorControl';
import { DOORCONTROLLER_SETTINGS } from '../shared/settings';

const globalDoors: Array<IDoorControl> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export class DoorController implements IDoorControl {
    _id?: string;
    name: string;
    data: { prop?: string; hash?: number; isLocked?: boolean; faction?: string };
    keyData: { keyName?: string; keyDescription?: string; data: { faction?: string; lockHash?: string } };
    pos: alt.Vector3;
    rotation: alt.Vector3;
    center: alt.Vector3;

    /**
     * "Register a callback function to be called when the server sends a message with the key 'door' to
     * the client."
     *
     * The callback function is DoorController.update.
     *
     * The server will only send messages to the client if the client is within a certain range of the
     * server.
     *
     * The range is defined by the variable STREAM_RANGE.
     */
    static init() {
        StreamerService.registerCallback(KEY, DoorController.update, STREAM_RANGE);
    }

    /**
     * It sends the doors array to the client
     * @param player - alt.Player - The player to send the data to.
     * @param doors - Array<IDoorControl>
     */
    static update(player: alt.Player, doors: Array<IDoorControl>) {
        alt.emitClient(player, DOORCONTROLLER_EVENTS.POPULATE_DOORS, doors);
    }

    static refresh() {
        StreamerService.updateData(KEY, globalDoors);
    }

    /**
     * If the doorData object doesn't have an _id property, then create one, and then add the doorData
     * object to the globalDoors array, and then refresh the globalDoors array.
     * @param {IDoorControl} doorData - IDoorControl
     * @returns The doorData._id is being returned.
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
     * It adds a door to the database
     * @param {IDoorControl} data - IDoorControl
     * @returns A boolean value.
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

        await Database.insertData(data, DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION, false);
        return true;
    }

    /**
     * It takes a player, a key name, and an optional quantity, and gives the player the key
     * @param player - alt.Player - The player you want to give the key to.
     * @param {string} keyName - The name of the key you want to give.
     * @param {number} [quantity] - number - The amount of keys to give.
     * @returns the player's inventory.
     */
    static async giveKey(player: alt.Player, keyName: string, quantity?: number) {
        const keyToGive = await ItemFactory.getByName(keyName);
        const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
        const keyInInventory = playerFuncs.inventory.isInInventory(player, keyToGive);
        if (quantity) {
            keyToGive.quantity = quantity;
        }
        if (!keyToGive) return playerFuncs.emit.notification(player, `No valid key was found by name ${keyName}!`);
        if (!keyInInventory) {
            playerFuncs.inventory.inventoryAdd(player, keyToGive, emptySlot.slot);
        } else {
            if (quantity) {
                player.data.inventory[keyInInventory.index].quantity += quantity;
            } else {
                player.data.inventory[keyInInventory.index].quantity += 1;
            }
        }
        playerFuncs.save.field(player, 'inventory', player.data.inventory);
    }
}
DoorController.init();
