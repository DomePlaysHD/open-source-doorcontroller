import * as alt from 'alt-client';
import IDoorObjects from '../../server/src/interfaces/IDoorObjects';
export let clientDoorList = Array<IDoorObjects>();

alt.onServer('DoorController:Client:SendDatabaseObjects', (objects: Array<IDoorObjects>) => {
    objects.forEach((obj, i) => {
        clientDoorList.push(obj);
    });
});
