import * as alt from 'alt-server';
import { ATHENA_DOORCONTROLLER } from '..';
import { Athena } from '../../../../../server/api/athena';
import { ServerTextLabelController } from '../../../../../server/streamers/textlabel';
import { InteractionController } from '../../../../../server/systems/interaction';
import { StreamerService } from '../../../../../server/systems/streamer';
import { sha256Random } from '../../../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../../../shared/enums/itemTypes';
import { ANIMATION_FLAGS } from '../../../../../shared/flags/animationFlags';
import { Item } from '../../../../../shared/interfaces/item';
import { config } from '../../shared/config/index';
import { doorsPropsDefaults } from '../../shared/defaults/doors-props';
import { DoorControllerEvents } from '../../shared/enums/events';
import { Translations } from '../../shared/enums/translations';
import IDoor from '../../shared/interfaces/IDoor';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';


const globalDoors: Array<IDoor> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export class DoorController implements IDoor{
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

    static update(player: alt.Player, doors: Array<IDoor>) {
        alt.emitClient(player, DoorControllerEvents.populateDoors, doors);
    }

    static refresh() {
        StreamerService.updateData(KEY, globalDoors);
    }

    static append(door: IDoor): string {
        if (!door._id) {
            door._id = sha256Random(JSON.stringify(door));
        }

        globalDoors.push(door);
        DoorController.refresh();
        return door._id;
    }

    static async updateDoor(player: alt.Player, id: string, ) {
        const door = await Athena.database.funcs.fetchData<IDoor>(
            '_id',
            id,
            config.dbCollection,
        );
    
        let translatedLockstate = door.data.isLocked
            ? `~r~` + Translations.Locked
            : `~g~` + Translations.Unlocked;
    
        door.data.isLocked = !door.data.isLocked;
    
        if (config.useTextLabels) {
            translatedLockstate = door.data.isLocked
                ? `~r~` + Translations.Locked
                : `~g~` + Translations.Unlocked;
            
            ServerTextLabelController.remove(door._id.toString());
            ServerTextLabelController.append({
                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                data: translatedLockstate,
                uid: door._id.toString(),
                maxDistance: config.textLabelRange,
            });
        }
    
        if(config.useAnimation) {
            Athena.player.emit.animation(
                player,
                config.animationDictionary,
                config.animationName,
                ANIMATION_FLAGS.NORMAL,
                config.animationDuration,
            );
        }
    
        await Athena.database.funcs.updatePartialData(
            id,
            {
                data: door.data,
            },
            config.dbCollection,
        );
    
        alt.log(
            `${door.name} is now ${
                door.data.isLocked ? '~r~' + Translations.Locked : '~g~' + Translations.Unlocked
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
                    config.dbCollectionProps,
                    false,
                );
            }
            doorProps = await DoorController.getProps();
        }
    
        const dbDoors = await DoorController.getAll();
        for (let x = 0; x < dbDoors.length; x++) {
            const door = dbDoors[x];
            let translatedLockstate = door.data.isLocked
                ? `~r~` + Translations.Locked
                : `~g~` + Translations.Unlocked;
    
            if (config.useTextLabels) {
                ServerTextLabelController.append({
                    pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                    data: translatedLockstate,
                    uid: door._id.toString(),
                    maxDistance: config.textLabelRange,
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
        }
    
        alt.log(
            `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${dbDoors.length} Doors!`,
        );
    
        alt.log(
            `~lg~${ATHENA_DOORCONTROLLER.name} ${ATHENA_DOORCONTROLLER.version} | DATABASE | Loaded ${doorProps.length} default Doors!`,
        );
    }

    static async getAll() {
        return Athena.database.funcs.fetchAllData<IDoor>(config.dbCollection);
    }

    static async getProps() {
        return Athena.database.funcs.fetchAllData<IDoorObjects>(
            config.dbCollectionProps,
        );
    }
}
DoorController.init();
