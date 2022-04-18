import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import { StreamerService } from '../../../../server/systems/streamer';
import { sha256Random } from '../../../../server/utility/encryption';
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

    static async createKey(player: alt.Player, keyName: string, keyDescription: string, faction: string) {
        const emptySlot = Athena.player.inventory.getFreeInventorySlot(player);
        const key: Item = {
            name: keyName,
            description: keyDescription,
            icon: 'KEY',
            quantity: 0,
            behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
            data: {
                lockHash: null,
                faction: faction,
            },
            dbName: `DoorController-${keyName}`,
        }

        Athena.systems.itemFactory.add(key);
        Athena.player.inventory.inventoryAdd(player, key, emptySlot.slot);
        Athena.player.save.field(player, 'inventory', player.data.inventory);
        Athena.player.sync.inventory(player);

        alt.logWarning(`DoorController created ${keyName} and added it Athena's ItemFactory!`);
    }

    static async getAll() {
        return await Database.fetchAllData<IDoorControl>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    }
}
DoorController.init();
