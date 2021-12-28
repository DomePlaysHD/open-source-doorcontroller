import * as alt from 'alt-client';
import * as native from 'natives';
import { WheelMenu } from '../../../client/utility/wheelMenu';
import { InputView } from '../../../client/views/input';
import { InputOptionType, InputResult } from '../../../shared/interfaces/inputMenus';
import { clientTranslations } from './client-translations';

const player = alt.Player.local;

alt.on('keydown', (key) => {
	if (key === 190) {
		alt.emitServer('doorController:server:checkPermissions', player);
		
		WheelMenu.create(
			'Athena DoorController',
			[
				{
					name: clientTranslations.addDoor,
					callback: () => {
						const InputMenu = {
							title: 'Athena DoorController',
							options: [
								{
									id: 'name',
									desc: 'Database name for this door.',
									placeholder: '<Mission Row - Police Department - Left/Right>',
									type: InputOptionType.TEXT,
									error: 'Please specify a database name for this door.'
								},
								{
									id: 'prop',
									desc: 'Name of prop for this door. (Codewalker / MLO Files)',
									placeholder: 'v_ilev_ph_door01',
									type: InputOptionType.TEXT,
									error: 'Please specify a prop for this door.'
								},
								{
									id: 'faction',
									desc: 'Name of faction for this door.',
									placeholder: 'Los Santos Police Department',
									type: InputOptionType.TEXT,
									error: ''
								},
								{
									id: 'keyname',
									desc: 'Database key name for this door. Use same name and null as description for double doors.',
									placeholder: 'General Key LSPD',
									type: InputOptionType.TEXT,
									error: 'Please specify key name for this door.'
								}, 
								{
									id: 'keydescription',
									desc: 'Data key description for this door.',
									placeholder: 'This key is used to unlock all doors bound to the Mission Row Police Department',
									type: InputOptionType.TEXT,
									error: 'Must specify key description'
								}
							],
							callback: (results: InputResult[]) => {
								if (results.length <= 0) {
									InputView.setMenu(InputMenu);
									return;
								}

								const result = {
									name: results.find((x) => x && x.id === 'name'),
									prop: results.find((x) => x && x.id === 'prop'),
									faction: results.find((x) => x && x.id === 'faction'),
									keyName: results.find((x) => x && x.id === 'keyname'),
									keyDescription: results.find((x) => x && x.id === 'keydescription')
								}

								if (!result.name || !result.prop || !result.keyName) {
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
									0
								);

								const door = native.getClosestObjectOfType(player.pos.x, player.pos.y, player.pos.z, 2, alt.hash(result.prop.value), false, false, false);
								const doorRot = native.getEntityRotation(door, 2);
								
								const doorDatas = {
									name: result.name.value,
									data: {
										prop: result.prop.value, 
									},
									keyData: {
										keyName: result.keyName.value,
										keyDescription: result.keyDescription.value,
										data: {
											lockHash: alt.hash(result.keyName.value),
											faction: result.faction.value
										}
									},
									pos: doorFound[1],
									rotation: doorRot,
									center: getEntityCenter(door),
								}
								alt.emitServer('doorController:serverSide:addDoor', doorDatas);
							}
						};
						InputView.setMenu(InputMenu);
					}
				},
				{
					name: clientTranslations.changeLock,
					callback: () => {

					}
				},
				{
					name: clientTranslations.changeLockAll,
					callback: () => {

					}
				},
				{
					name: clientTranslations.createKey,
					callback: () => {

					}
				},
				{
					name: clientTranslations.removeKey,
					callback: () => {

					}
				},
				{
					name: clientTranslations.removeDoor,
					callback: () => {
						alt.emitServer('doorController:serverSide:removeDoor');
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