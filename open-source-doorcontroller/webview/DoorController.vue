<template>
    <Frame maxWidth="25%" minWidth="15%" padding="20%" class="DoorController-Main">
        <template v-slot:toolbar>
            <div class="toolbar">
                <Toolbar :size="28" @close-page="relayClosePage" pageName="DoorController">
                    <span id="Headline">Athena DoorController</span>
                </Toolbar>
            </div>
        </template>
        <template v-slot:content>
            <div class="buttons">
                <br />
                <Button
                    v-on:click="addCustomDoor()"
                    class="mt-2"
                    color="green"
                    pageName="DoorController"
                    style="width: 49%; float: right"
                >
                    {{ TRANSLATIONS.ADD_CUSTOMDOOR_TO_DATABASE }}
                </Button>
                <Button
                    v-on:click="addDoorDatabase()"
                    class="mt-2"
                    color="green"
                    pageName="DoorController"
                    style="width: 49%"
                >
                    {{ TRANSLATIONS.ADD_DOOR_TO_DATABASE }}
                </Button>
                <Button class="mt-2" color="green" pageName="DoorController" style="width: 49%; float: right">
                    {{ TRANSLATIONS.ADD_KEY_TO_DATABASE }}
                </Button>
                <Button
                    v-on:click="readDoorData()"
                    class="mt-2"
                    color="green"
                    pageName="DoorController"
                    style="width: 49%"
                >
                    {{ TRANSLATIONS.READ_DOOR_DATA }}
                </Button>
                <br />
                <hr />
                <br />
                <Button
                    v-on:click="updateLockstate()"
                    class="mt-2"
                    color="yellow"
                    pageName="DoorController"
                    style="width: 49%; float: right"
                >
                    {{ TRANSLATIONS.UPDATE_LOCKSTATE }}
                </Button>
                <Button class="mt-2" color="yellow" pageName="DoorController" style="width: 49%">
                    {{ TRANSLATIONS.CHANGE_SINGLE_LOCK }}
                </Button>
                <Button class="mt-2" color="yellow" pageName="DoorController" style="width: 49%">
                    {{ TRANSLATIONS.CHANGE_ALL_LOCKS }}
                </Button>
                <br />
                <hr />
                <br />
                <Button class="mt-2" color="red" pageName="DoorController" style="width: 49%">
                    {{ TRANSLATIONS.REMOVE_DOOR_FROM_DATABASE }}
                </Button>
                <Button class="mt-2" color="red" pageName="DoorController" style="width: 49%">
                    {{ TRANSLATIONS.REMOVE_KEY }} </Button
                ><br />
                <hr />
            </div>
        </template>
    </Frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Button from '@components/Button.vue';
import Frame from '@components/Frame.vue';
import Icon from '@components/Icon.vue';
import Input from '@components/Input.vue';
import Modal from '@components/Modal.vue';
import Module from '@components/Module.vue';
import RangeInput from '@components/RangeInput.vue';
import Toolbar from '@components/Toolbar.vue';
import { DOORCONTROLLER_EVENTS } from '../shared/events';

// Very Important! The name of the component must match the file name.
// Don't forget to do this. This is a note so you don't forget.
const ComponentName = 'DoorController';
export default defineComponent({
    name: ComponentName,
    // Used to add Custom Components
    components: {
        Button,
        Frame,
        Icon,
        Input,
        Modal,
        Module,
        RangeInput,
        Toolbar,
    },
    // Used to define state
    data() {
        return {
            TRANSLATIONS: {
                ADD_DOOR_TO_DATABASE: 'Add a new default door to the database.',
                ADD_CUSTOMDOOR_TO_DATABASE: 'Add a new custom door to the database.',
                ADD_KEY_TO_DATABASE: 'Add a new key to the database.',
                READ_DOOR_DATA: 'Read data of a close door.',
                UPDATE_LOCKSTATE: 'Update Lockstate of this door.',
                REMOVE_KEY: 'Remove a key from the database.',
                CHANGE_SINGLE_LOCK: 'Change a single lock by keyname.',
                CHANGE_ALL_LOCKS: 'Change all locks by keyname.',
                REMOVE_DOOR_FROM_DATABASE: 'Remove a door from the database.',
                REMOVE_KEY_FROM_DATABASE: 'Remove a key from the database.',
            },
        };
    },
    mounted() {
        if ('alt' in window) {
            alt.emit(`${ComponentName}:Ready`);
        }
        document.addEventListener('keyup', this.handleKeyPress);
    },
    unmounted() {
        if ('alt' in window) {
            alt.off(`${ComponentName}:Close`, this.close);
        }
        document.removeEventListener('keyup', this.handleKeyPress);
    },
    methods: {
        relayClosePage(pageName: string) {
            this.$emit('close-page', pageName);
        },
        addDoorDatabase() {
            if ('alt' in window) {
                alt.emit(DOORCONTROLLER_EVENTS.OPEN_INPUTMENU);
            }
        },
        addCustomDoor() {
            if ('alt' in window) {
                alt.emit(DOORCONTROLLER_EVENTS.OPEN_CUSTOM_INPUTMENU);
            }
        },
        readDoorData() {
            if ('alt' in window) {
                alt.emit(DOORCONTROLLER_EVENTS.READ_DATA);
            }
        },
        updateLockstate() {
            if ('alt' in window) {
                alt.emit(DOORCONTROLLER_EVENTS.UPDATE_LOCKSTATE);
            }
        },
        handleKeyPress(e: { keyCode: number; }) {
            if (e.keyCode === 27 && 'alt' in window) {
                alt.emit(`${ComponentName}:Close`);
            }
        },
        sendSomeData(arg1: string) {
            console.log(arg1);
        },
    },
});
</script>

<style scoped>
.DoorController-Main {
    position: relative;
    width: 20%;
    margin-right: 78%;
}
#Headline {
    position: absolute;
    margin-left: 25%;
    text-align: center;
}
.DoorController-Mainbuttons {
    position: relative;
    margin-left: 30%;
}
</style>