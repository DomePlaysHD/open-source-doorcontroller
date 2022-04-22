import alt from 'alt-client';
import { WebViewController } from '../../../../client/extensions/view2';
import ViewModel from '../../../../client/models/viewModel';
import { isAnyMenuOpen } from '../../../../client/utility/menus';
import { config } from '../../shared/config/index';
import { DoorControllerEvents } from '../../shared/enums/events';
import { DoorController } from './controller';


const PAGE_NAME = 'DoorController';
let door: (string | alt.Vector3)[];

class InternalFunctions implements ViewModel {
    static async open() {
        if (isAnyMenuOpen()) {
            return;
        }

        await WebViewController.setOverlaysVisible(false);

        const view = await WebViewController.get();
        view.on(`${PAGE_NAME}:Ready`, InternalFunctions.ready);
        view.on(`${PAGE_NAME}:Close`, InternalFunctions.close);

        WebViewController.openPages([PAGE_NAME]);
        WebViewController.focus();
        WebViewController.showCursor(true);

        alt.toggleGameControls(false);

        alt.Player.local.isMenuOpen = true;
    }

    static async close() {
        alt.toggleGameControls(true);
        WebViewController.setOverlaysVisible(true);

        const view = await WebViewController.get();
        view.off(`${PAGE_NAME}:Ready`, InternalFunctions.ready);
        view.off(`${PAGE_NAME}:Close`, InternalFunctions.close);

        WebViewController.closePages([PAGE_NAME]);

        WebViewController.unfocus();
        WebViewController.showCursor(false);

        alt.Player.local.isMenuOpen = false;
    }

    static async ready() {
        const view = await WebViewController.get();
        view.emit(DoorControllerEvents.setDefaultDoor, door);
    }
}

alt.on('keydown', (key) => {
    if (key == config.keyToOpenUi) {
        if (alt.getLocalMeta('permissionLevel') >= config.permissionsRequired) {
            InternalFunctions.open();
            door = DoorController.checkNearDoors();
        }
    }
});
