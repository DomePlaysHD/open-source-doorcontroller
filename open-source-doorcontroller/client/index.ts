import alt from 'alt-client';
import IDoorObjects from '../shared/interfaces/IDoorObjects';

import './src/controller';
import './src/client-events';
import './src/client-functions';
import './src/view';

export let clientDoorArray: IDoorObjects [] = [];
alt.onServer('DCTest', (dbDoors: Array<IDoorObjects>) => {
    clientDoorArray = dbDoors;
});