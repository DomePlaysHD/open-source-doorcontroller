import './src/controller';
import './src/client-events';
import './src/client-functions';
import './src/view';

import alt from 'alt-client';
import IDoorObjects from '../shared/interfaces/IDoorObjects';

export let clientDoorArray: IDoorObjects [] = [];
alt.onServer('DCTest', (dbDoors: Array<IDoorObjects>) => {
    clientDoorArray = dbDoors;
});