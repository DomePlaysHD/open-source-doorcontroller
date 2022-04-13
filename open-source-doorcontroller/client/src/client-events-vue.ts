import * as alt from 'alt-client';
import * as native from 'natives';
import { WebViewController } from '../../../../client/extensions/view2';
import { showNotification } from '../../../../client/utility/notification';
import { InputView } from '../../../../client/views/input';
import { InputMenu, InputOptionType, InputResult } from '../../../../shared/interfaces/inputMenus';
import IDoorControl from '../../server/src/interfaces/IDoorControl';
import { clientDoorList } from './client-events';
import { getEntityCenter } from './client-functions';

const player = alt.Player.local;
const PAGE_NAME = 'DoorController';
const doorsView = await WebViewController.get();

let doorProp: any;
let door: any;
let doorRot: alt.Vector3;
let doorCenter: alt.Vector3;

doorsView.on(`${PAGE_NAME}:Vue:OpenInputMenu`, () => {
    // Timeout here to ensure the IPM is getting opened.
    alt.emit(`${PAGE_NAME}:Vue:CloseUI`);
    let mainDoor: string;
    clientDoorList.forEach((obj, i) => {
        door = native.getClosestObjectOfType(
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0.5,
            alt.hash(obj.name),
            false,
            false,
            false,
        );
        if (door) {
            mainDoor = obj.name;
            alt.setTimeout(() => {
                const InputMenu: InputMenu = {
                    title: 'Athena DoorController',
                    generalOptions: {
                        description: `Database auto filled door model ==> ${mainDoor}`,
                    },
                    options: [
                        {
                            id: 'name',
                            desc: 'Name of this door.',
                            placeholder: 'Some Name.',
                            type: InputOptionType.TEXT,
                            error: 'Please specify name for this door.',
                        },
                        {
                            id: 'faction',
                            desc: 'Name of faction for this door.',
                            placeholder: 'Los Santos Police Department',
                            type: InputOptionType.TEXT,
                            error: '',
                        },
                        {
                            id: 'keyname',
                            desc: 'Database key name for this door. Use same name and null as description for double doors.',
                            placeholder: 'General Key LSPD',
                            type: InputOptionType.TEXT,
                            error: '',
                        },
                        {
                            id: 'keydescription',
                            desc: 'Data key description for this door.',
                            placeholder: 'This key is used to unlock all doors bound to the Mission Row Police Department',
                            type: InputOptionType.TEXT,
                            error: '',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }
        
                        const result = {
                            name: results.find((x) => x && x.id === 'name'),
                            faction: results.find((x) => x && x.id === 'faction'),
                            keyName: results.find((x) => x && x.id === 'keyname'),
                            keyDescription: results.find((x) => x && x.id === 'keydescription'),
                        };
        
                        if (!result.keyName) {
                            InputView.setMenu(InputMenu);
                            return;
                        }
        
                        clientDoorList.forEach((obj, i) => {
                            door = native.getClosestObjectOfType(
                                player.pos.x,
                                player.pos.y,
                                player.pos.z,
                                0.5,
                                alt.hash(obj.name),
                                false,
                                false,
                                false,
                            );
                            if (door) {
                                console.log(`Found Door ==> ${obj.name}`);
                                doorProp = obj.name;
                                doorRot = native.getEntityRotation(door, 2);
                                doorCenter = getEntityCenter(door);
                            }
                        });
                        const doorFound = native.getCoordsAndRotationOfClosestObjectOfType(
                            player.pos.x,
                            player.pos.y,
                            player.pos.z,
                            2,
                            alt.hash(doorProp),
                            { x: 0, y: 0, z: 0 } as alt.Vector3,
                            { x: 0, y: 0, z: 0 } as alt.Vector3,
                            0,
                        );
                        const doorDatas: IDoorControl = {
                            name: result.name.value,
                            data: {
                                prop: doorProp,
                            },
                            keyData: {
                                keyName: result.keyName.value,
                                keyDescription: result.keyDescription.value,
                                data: {
                                    lockHash: result.keyName.value,
                                    faction: result.faction.value,
                                },
                            },
                            pos: doorFound[1],
                            rotation: doorRot,
                            center: doorCenter,
                        };
                        if (!doorDatas.pos || !doorDatas.rotation) return;
                        alt.emitServer('DoorController:Server:AddDoor', doorDatas);
                        alt.log(JSON.stringify(doorDatas));
                    },
                };
                InputView.setMenu(InputMenu);
            }, 250);
        } else {
            showNotification('No door found!');
            return;
        }
    });
});

doorsView.on(`${PAGE_NAME}:Vue:OpenCustomInputMenu`, () => {
    // Timeout here to ensure the IPM is getting opened.
    alt.emit(`${PAGE_NAME}:Vue:CloseUI`);
    alt.setTimeout(() => {
        const InputMenu: InputMenu = {
            title: 'Athena DoorController',
            options: [
                {
                    id: 'prop',
                    desc: 'CodeWalker Prop',
                    placeholder: '....Placeholder.',
                    type: InputOptionType.TEXT,
                    error: 'Please specify prop for this door.',
                },
                {
                    id: 'name',
                    desc: 'Name of this door.',
                    placeholder: 'Some Name.',
                    type: InputOptionType.TEXT,
                    error: 'Please specify name for this door.',
                },
                {
                    id: 'faction',
                    desc: 'Name of faction for this door.',
                    placeholder: 'Los Santos Police Department',
                    type: InputOptionType.TEXT,
                    error: '',
                },
                {
                    id: 'keyname',
                    desc: 'Database key name for this door. Use same name and null as description for double doors.',
                    placeholder: 'General Key LSPD',
                    type: InputOptionType.TEXT,
                    error: '',
                },
                {
                    id: 'keydescription',
                    desc: 'Data key description for this door.',
                    placeholder: 'This key is used to unlock all doors bound to the Mission Row Police Department',
                    type: InputOptionType.TEXT,
                    error: '',
                },
            ],
            callback: (results: InputResult[]) => {
                if (results.length <= 0) {
                    InputView.setMenu(InputMenu);
                    return;
                }

                const result = {
                    prop: results.find((x) => x && x.id === 'prop'),
                    name: results.find((x) => x && x.id === 'name'),
                    faction: results.find((x) => x && x.id === 'faction'),
                    keyName: results.find((x) => x && x.id === 'keyname'),
                    keyDescription: results.find((x) => x && x.id === 'keydescription'),
                };

                if (!result.keyName) {
                    InputView.setMenu(InputMenu);
                    return;
                }
                const doorFound = native.getCoordsAndRotationOfClosestObjectOfType(
                    player.pos.x,
                    player.pos.y,
                    player.pos.z,
                    2,
                    alt.hash(result.prop.value),
                    { x: 0, y: 0, z: 0 } as alt.Vector3,
                    { x: 0, y: 0, z: 0 } as alt.Vector3,
                    0,
                );
                const doorDatas: IDoorControl = {
                    name: result.name.value,
                    data: {
                        prop: result.prop.value,
                    },
                    keyData: {
                        keyName: result.keyName.value,
                        keyDescription: result.keyDescription.value,
                        data: {
                            lockHash: result.keyName.value,
                            faction: result.faction.value,
                        },
                    },
                    pos: doorFound[1],
                    rotation: doorRot,
                    center: doorCenter,
                };
                if (!doorDatas.pos || !doorDatas.rotation) return;
                alt.emitServer('DoorController:Server:AddDoor', doorDatas);
                alt.log(JSON.stringify(doorDatas));
            },
        };
        InputView.setMenu(InputMenu);
    }, 250);
});

doorsView.on(`${PAGE_NAME}:Vue:ReadDoorData`, () => {
    alt.emitServer(`${PAGE_NAME}:Server:ReadDoorData`);
});

doorsView.on(`${PAGE_NAME}:Vue:UpdateLockstate`, () => {
    alt.emitServer(`${PAGE_NAME}:Server:UpdateLockstate`);
});

doorsView.on(`${PAGE_NAME}:Vue:RemoveDoor`, () => {
    alt.emitServer(`${PAGE_NAME}:Server:RemoveDoor`);
});