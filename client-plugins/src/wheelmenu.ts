import * as alt from 'alt-client';
import * as native from 'natives';
import { WheelMenu } from '../../../client/utility/wheelMenu';
import { InputView } from '../../../client/views/input';
import { InputOptionType, InputResult } from '../../../shared/interfaces/inputMenus';

const player = alt.Player.local;

alt.on('keydown', (key) => {
	if (key === 190) {
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
									id: 'keyname',
									desc: 'Put in a name for the doorkeys here if you want to add a double door just add same key',
									placeholder: 'General Key LSPD',
									type: InputOptionType.TEXT,
									error: 'Must specify Keyname.'
								}
							],
							callback: (results: InputResult[]) => {
								if (results.length <= 0) {
									InputView.setMenu(InputMenu);
									return;
								}
								const name = results.find((x) => x && x.id === 'name');
								const prop = results.find((x) => x && x.id === 'prop');
								const keyname = results.find((x) => x && x.id === 'keyname');
								if (!prop && !keyname && !name) {
									InputView.setMenu(InputMenu);
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
								const door = native.getClosestObjectOfType(player.pos.x, player.pos.y, player.pos.z, 2, alt.hash(prop.value), false, false, false);
								const doorRot = native.getEntityRotation(door, 2);
								alt.emitServer('Doorsystem:Serverside:AddDoor', name.value, prop.value, keyname.value, doorFound[1], doorRot, getEntityCenter(door));
								alt.log(JSON.stringify(door));
							}
						};
						InputView.setMenu(InputMenu);
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
function getEntityCenter(entity: number) {
	const [, min, max] = native.getModelDimensions(native.getEntityModel(entity));
	return native.getOffsetFromEntityInWorldCoords(entity, (min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2);
}