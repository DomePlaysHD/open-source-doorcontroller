import * as alt from 'alt-client';
import { DOORCONTROLLER_EVENTS } from '../../shared/events';
import IDoorObjects from '../../shared/interfaces/IDoorObjects';
export let clientDoorList = Array<IDoorObjects>();

alt.onServer(DOORCONTROLLER_EVENTS.DATABASE_DATA, (objects: Array<IDoorObjects>) => {
    objects.forEach((obj, i) => {
        clientDoorList.push(obj);
    });
});
