import * as alt from 'alt-server';
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
import { IDoorOld } from '../../shared/interfaces/IDoorOld';
import { dbDoorArray } from './server-functions';

const globalDoors: Array<IDoorOld> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export class DoorController {
    static init() {
        StreamerService.registerCallback(KEY, DoorController.update, STREAM_RANGE);
    }

    static update(player: alt.Player, doors: Array<IDoorOld>) {
        alt.emitClient(player, DoorControllerEvents.populateDoors, doors);
    }

    static refresh() {
        StreamerService.updateData(KEY, globalDoors);
    }

    static append(door: IDoorOld): string {
        if (!door._id) {
            door._id = sha256Random(JSON.stringify(door));
        }

        globalDoors.push(door);
        DoorController.refresh();
        return door._id;
    }

    static async updateDoor(player: alt.Player, id: string) {
        const door = await Athena.database.funcs.fetchData<IDoorOld>('_id', id, config.dbCollection);

        let translatedLockstate = door.data.isLocked ? `~r~` + Translations.Locked : `~g~` + Translations.Unlocked;

        door.data.isLocked = !door.data.isLocked;

        if (config.useTextLabels) {
            translatedLockstate = door.data.isLocked ? `~r~` + Translations.Locked : `~g~` + Translations.Unlocked;

            ServerTextLabelController.remove(door._id.toString());
            ServerTextLabelController.append({
                pos: { x: door.center.x, y: door.center.y, z: door.center.z },
                data: translatedLockstate,
                uid: door._id.toString(),
                maxDistance: config.textLabelRange,
            });
        }

        if (config.useAnimation) {
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
            `${door.name} is now ${door.data.isLocked ? '~r~' + Translations.Locked : '~g~' + Translations.Unlocked}`,
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

                await Athena.database.funcs.insertData<IDoorObjects>(doorprop, config.dbCollectionProps, false);
            }
            doorProps = await DoorController.getProps();
        }

        const dbDoors = await DoorController.getAll();
        for (let x = 0; x < dbDoors.length; x++) {
            const door = dbDoors[x] as IDoorOld;
            let translatedLockstate = door.data.isLocked ? `~r~` + Translations.Locked : `~g~` + Translations.Unlocked;

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
                },
            });

            DoorController.append(door);
            DoorController.refresh();
        }

        alt.log(`~lg~${config.pluginName} ${config.pluginVersion} | DATABASE | Loaded ${dbDoors.length} Doors & ${dbDoorArray.length} GTA:V default door props!`);
    }

    static async convertInterface() {
        const dbDoors = await this.getAll();
        for (let x = 0; x < dbDoors.length; x++) {
            const door = dbDoors[x] as IDoorOld;
            const updatedDoor: IDoor = {
                _id: door._id,
                door: {
                    name: door.name,
                    hash: door.data.hash,
                    isLocked: door.data.isLocked,
                    prop: door.data.prop,
                    faction: door.data.faction,
                },
                key: {
                    name: door.keyData.keyName,
                    description: door.keyData.keyDescription,
                    hash: door.keyData.data.lockHash,
                    faction: door.keyData.data.faction,
                },

                pos: door.pos,
                rot: door.rotation,
                center: door.center,
                version: null
            };
            if (updatedDoor.version !== null) {
                await Athena.database.funcs.updatePartialData(
                    updatedDoor._id.toString(),
                    {  version: updatedDoor.version },
                    config.dbCollection,
                );
                alt.log('DoorController: Converting door interface...');
                alt.log(`Updated ${dbDoors.length} doors!`);
            }
        }
    }

    static async getAll() {
        return Athena.database.funcs.fetchAllData<Partial<IDoorOld> | Partial<IDoor>>(config.dbCollection);
    }

    static async getProps() {
        return Athena.database.funcs.fetchAllData<IDoorObjects>(config.dbCollectionProps);
    }
}
DoorController.init();
