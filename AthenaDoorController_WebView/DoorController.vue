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
import Button from '../../components/Button.vue';
import Frame from '../../components/Frame.vue';
import Icon from '../../components/Icon.vue';
import Input from '../../components/Input.vue';
import Modal from '../../components/Modal.vue';
import Module from '../../components/Module.vue';
import RangeInput from '../../components/RangeInput.vue';
import Toolbar from '../../components/Toolbar.vue';

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
    // Called when the page is loaded.
    mounted() {
        // Bind Events to Methods
        if ('alt' in window) {
            // alt.on('x', this.whatever);
            alt.on(`${ComponentName}:SendSomeData`, this.sendSomeData);
            alt.emit(`${ComponentName}:Ready`);
        }

        // Add Keybinds for In-Menu
        document.addEventListener('keyup', this.handleKeyPress);
    },
    // Called when the page is unloaded.
    unmounted() {
        // Make sure to turn off any document events as well.
        // Only if they are present of course.
        // Example:
        // document.removeEventListener('mousemove', this.someFunction)
        if ('alt' in window) {
            alt.off(`${ComponentName}:Close`, this.close);
        }

        // Remove Keybinds for In-Menu
        document.removeEventListener('keyup', this.handleKeyPress);
    },
    // Used to define functions you can call with 'this.x'
    methods: {
        relayClosePage(pageName: string) {
            this.$emit('close-page', pageName);
        },
        addDoorDatabase() {
            if ('alt' in window) {
                alt.emit(`${ComponentName}:Vue:OpenInputMenu`);
            }
        },
        addCustomDoor() {
            if ('alt' in window) {
                alt.emit(`${ComponentName}:Vue:OpenCustomInputMenu`);
            }
        },
        readDoorData() {
            if ('alt' in window) {
                alt.emit(`${ComponentName}:Vue:ReadDoorData`);
            }
        },
        updateLockstate() {
            if ('alt' in window) {
                alt.emit(`${ComponentName}:Vue:UpdateLockstate`);
            }
        },
        handleKeyPress(e) {
            // Escape Key
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
