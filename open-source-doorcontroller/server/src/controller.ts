import * as alt from 'alt-server';
import IDoorControl from '../../shared/interfaces/IDoorControl';

import { DOORCONTROLLER_SETTINGS, DOORCONTROLLER_TRANSLATIONS } from '../../shared/settings';
import { DOORCONTROLLER_EVENTS } from '../../shared/defaults/events';
import { StreamerService } from '../../../../../server/systems/streamer';
import { sha256Random } from '../../../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../../../shared/enums/itemTypes';
import { Athena } from '../../../../../server/api/athena';
import { Item } from '../../../../../shared/interfaces/item';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';
import { ATHENA_DOORCONTROLLER } from '..';
import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { doorsPropsDefaults } from '../../shared/defaults/doors-props';
import { InteractionController } from '../../../../../server/systems/interaction';
import { ANIMATION_FLAGS } from '../../../../../shared/flags/animationFlags';

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

    static async updateDoor(player: alt.Player, id: string, ) {
        const door = await Athena.database.funcs.fetchData<IDoorControl>(
            '_id',
            id,
            DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
        );
    
        let translatedLockstate = door.data.isLocked
            ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
            : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;
    
        door.data.isLocked = !door.data.isLocked;
    
        if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
            translatedLockstate = door.data.isLocked
                ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
                : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;
            
            ServerTextLabelController.remove(door._id.toString());
            ServerTextLabelController.append({
                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                data: translatedLockstate,
                uid: door._id.toString(),
                maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
            });
        }
    
        if(DOORCONTROLLER_SETTINGS.USE_ANIMATION) {
            Athena.player.emit.animation(
                player,
                DOORCONTROLLER_SETTINGS.ANIMATION_DICTIONARY,
                DOORCONTROLLER_SETTINGS.ANIMATION_NAME,
                ANIMATION_FLAGS.NORMAL,
                DOORCONTROLLER_SETTINGS.ANIMATION_DURATION,
            );
        }
    
        await Athena.database.funcs.updatePartialData(
            id,
            {
                data: door.data,
            },
            DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION,
        );
    
        alt.log(
            `${door.name} is now ${
                door.data.isLocked ? '~r~' + DOORCONTROLLER_TRANSLATIONS.LOCKED : '~g~' + DOORCONTROLLER_TRANSLATIONS.UNLOCKED
            }`,
        );
        DoorController.refresh();
    }

    static async createKey(player: alt.Player, keyName: string, keyDescription: string, faction: string) {
        const emptySlot = Athena.player.inventory.getFreeInventorySlot(player);
        const key: Item = {
            name: keyName,
            description: keyDescription,
            icon: 'KEY',
            quantity: 1,
            behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
            rarity: 6,
            data: {
                lockHash: null,
                faction: faction,
            },
            dbName: `DoorController-${keyName}`,
        };

        Athena.systems.itemFactory.add(key);
        Athena.player.inventory.inventoryAdd(player, key, emptySlot.slot);
        Athena.player.save.field(player, 'inventory', player.data.inventory);
        Athena.player.sync.inventory(player);

        alt.logWarning(`DoorController created ${keyName} and added it Athena's ItemFactory!`);
    }

    static async loadDoors() {
        let doorProps = await DoorController.getProps();

        if (!doorProps || doorProps.length <= 0) {
            for (let i = 0; i < doorsPropsDefaults.length; i++) {
                const doorprop: IDoorObjects = {
                    name: doorsPropsDefaults[i].name,
                    hash: doorsPropsDefaults[i].hash,
                };
    
                await Athena.database.funcs.insertData<IDoorObjects>(
                    doorprop,
                    DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS,
                    false,
                );
            }
            doorProps = await DoorController.getProps();
        }
    
        const dbDoors = await DoorController.getAll();
        for (let x = 0; x < dbDoors.length; x++) {
            const door = dbDoors[x];
            let translatedLockstate = door.data.isLocked
                ? `~r~` + DOORCONTROLLER_TRANSLATIONS.LOCKED
                : `~g~` + DOORCONTROLLER_TRANSLATIONS.UNLOCKED;
    
            if (DOORCONTROLLER_SETTINGS.USE_TEXTLABELS) {
                ServerTextLabelController.append({
                    pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                    data: translatedLockstate,
                    uid: door._id.toString(),
                    maxDistance: DOORCONTROLLER_SETTINGS.TEXTLABEL_RANGE,
                });
            }
    
            InteractionController.add({
                uid: door._id.toString(),
                description: 'Use Door',
                range: 2,
                position: { x: door.pos.x, y: door.pos.y, z: door.pos.z - 1 },
                callback: (player: alt.Player) => { 
                    door.data.isLocked = !door.data.isLocked;
                    DoorController.updateDoor(player, door._id);
                }
            });
    
            DoorController.append(door);
            DoorController.refresh();
    
            alt.logError(JSON.stringify(door));
        }
    
        alt.log(
            `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${dbDoors.length} Doors!`,
        );
    
        alt.log(
            `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${doorProps.length} default Doors!`,
        );
    }
    /**
     * This function returns a promise that resolves to an array of objects that are of type IDoorControl.
     * @returns An array of IDoorControl objects.
     */
    static async getAll() {
        return await Athena.database.funcs.fetchAllData<IDoorControl>(DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION);
    }

    /**
     * It fetches all the data from the database collection "props" and returns it as an array of
     * IDoorObjects.
     * @returns An array of IDoorObjects
     */
    static async getProps() {
        return await Athena.database.funcs.fetchAllData<IDoorObjects>(
            DOORCONTROLLER_SETTINGS.DATABASE_COLLECTION_PROPS,
        );
    }
}
DoorController.init();
