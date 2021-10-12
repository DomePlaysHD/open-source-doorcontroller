import * as alt from 'alt-client';
import * as native from 'natives';

import { WheelMenu } from '../../client/utility/wheelMenu';
import { InputView } from '../../client/views/input';
import { InputOptionType, InputResult } from '../../shared/interfaces/InputMenus';

const player = alt.Player.local;

alt.on('keydown', (key) => {
	if (key === 104) {
		WheelMenu.create(
			'Doorlocksystem',
			[
				{
					name: 'Add Door',
					callback: () => {
						const InputMenu = {
							title: 'Add a new door to the database.',
							options: [
								{
									id: 'name',
									desc: 'Name of Door',
									placeholder: '<Mission Row LSPD Door - Left/Right>',
									type: InputOptionType.TEXT,
									error: 'Must specify door name'
								},
								{
									id: 'prop',
									desc: 'Name of Prop/Object (Codewalker/MLO_Files)',
									placeholder: 'Prop/Objname',
									type: InputOptionType.TEXT,
									error: 'Must specify prop (codewalker or mlo files).'
								},
								{
									id: 'faction',
									desc: 'Put in FactionID here (Name in 2.0.4) || "0" returns in everyone can use it.',
									placeholder: '<ObjectID>',
									type: InputOptionType.TEXT,
									error: 'Must specify FactionID.'
								}
							],
							callback: (results: InputResult[]) => {
								if (results.length <= 0) {
									InputView.show(InputMenu);
									return;
								}
								const name = results.find((x) => x && x.id === 'name');
								const prop = results.find((x) => x && x.id === 'prop');
								const faction = results.find((x) => x && x.id === 'faction');
								if (!prop && !faction && !name) {
									InputView.show(InputMenu);
									return;
								}
								const doorFound = native.getCoordsAndRotationOfClosestObjectOfType(
									player.pos.x,
									player.pos.y,
									player.pos.z,
									2,
									alt.hash(prop.value),
									{ x: 0, y: 0, z: 0 } as alt.Vector3,
									{ x: 0, y: 0, z: 0 } as alt.Vector3,
									0
								);
								alt.emitServer('Doorsystem:Serverside:AddDoor', name.value, prop.value, faction.value, doorFound[1]);
							}
						};
						InputView.show(InputMenu);
					}
				},
				{
					name: 'Remove Door',
					callback: () => {
						alt.emitServer('Doorsystem:Serverside:Removedoor');
					}
				}
			],
			true
		);
	}
});
