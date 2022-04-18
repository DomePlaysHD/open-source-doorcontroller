import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import { ItemFactory } from '../../../../server/systems/item';
import { StreamerService } from '../../../../server/systems/streamer';
import { sha256Random, sha256 } from '../../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../../shared/enums/itemTypes';
import { Item } from '../../../../shared/interfaces/item';
import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';
import IDoorControl from '../../shared/interfaces/IDoorControl';
import { DOORCONTROLLER_SETTINGS } from '../../shared/settings';

const globalDoors: Array<IDoorControl> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export class DoorController implements IDoorControl {
    _id?: string;
    name: string;
    data: { prop?: string; hash?: number; isLocked?: boolean; faction?: string };
    keyData: { keyName: string; keyDescription: string; data: { faction: string; lockHash: string } };
    pos: alt.Vector3;
    rotation: alt.Vector3;
    center: alt.Vector3;

    static init() {
        StreamerService.registerCallback(KEY, DoorController.update, STREAM_RANGE);
    }

    static update(player: alt.Player, doors: Array<IDoorControl>) {
        alt.emitClient(player, DOORCONTROLLER_EVENTS.POPULATE_DOORS, doors);
    }

    static refresh() {
        StreamerService.updateData(KEY, globalDoors);
    }

    static append(door: IDoorControl): string {
        if (!door._id) {
            door._id = sha256Random(JSON.stringify(door));
        }

        globalDoors.push(door);
        DoorController.refresh();
        return door._id;
    }

    static async createDoor(data: IDoorControl): Promise<Boolean | null> {
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

    static async giveKey(player: alt.Player, keyName: string, quantity?: number) {
        const keyToGive = await ItemFactory.getByName(keyName);
        const emptySlot = Athena.player.inventory.getFreeInventorySlot(player);
        const keyInInventory = Athena.player.inventory.isInInventory(player, keyToGive);
        if (!keyToGive) return Athena.player.emit.notification(player, `No valid key was found by name ${keyName}!`);
        if (!keyInInventory) {
            Athena.player.inventory.inventoryAdd(player, keyToGive, emptySlot.slot);
        } else if (keyInInventory) {
            quantity
                ? (player.data.inventory[keyInInventory.index].quantity += quantity)
                : (player.data.inventory[keyInInventory.index].quantity += 1);
        }
        Athena.player.save.field(player, 'inventory', player.data.inventory);
    }

    static async getAll() {
        return await Database.fetchAllData<IDoorControl>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    }
}
DoorController.init();
