import * as alt from 'alt-server';
import { StreamerService } from '../../server/systems/streamer';
import { sha256Random } from '../../server/utility/encryption';

import Doorsystem from './interface';


const globalDoors: Array<Doorsystem> = [];
const STREAM_RANGE = 25;
const KEY = 'doors';

export class DoorController {
    /**
     * Initializes the streamer to use this callback to update players.
     */
    static init() {
        StreamerService.registerCallback(KEY, DoorController.update, STREAM_RANGE);
    }

    /**
     * Called when stream data is updated for this type.
     */
    static update(player: alt.Player, doors: Array<Doorsystem>) {
        alt.emitClient(player, 'populate:Doors', doors);
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
    static append(doorData: Doorsystem): string {
        if (!doorData._id) {
            doorData._id = sha256Random(JSON.stringify(doorData));
        }

        globalDoors.push(doorData);
        DoorController.refresh();
        return doorData._id;
    }
}

DoorController.init();