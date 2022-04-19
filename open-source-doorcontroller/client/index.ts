import alt from 'alt-client';
import IDoorObjects from '../shared/interfaces/IDoorObjects';

import './src/controller';
import './src/client-events';
import './src/client-functions';
import './src/view';
import { DOORCONTROLLER_EVENTS } from '../shared/defaults/events';

export let clientDoorArray: IDoorObjects [] = [];
alt.onServer(DOORCONTROLLER_EVENTS.FILL_ARRAY, (dbDoors: Array<IDoorObjects>) => {
    clientDoorArray = dbDoors;
});