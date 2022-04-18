<template>
    <div class="doors-wrapper">
        <div class="header">
            <p>Athena Framework - Door Management</p>
            <button class="close-button" @click="close">Close</button>
        </div>

        <p>What would you like to do?</p>
        <div class="content-wrapper">
            <button class="button" @click="createDoor('default')">Create Door</button>
            <button class="button" @click="createDoor('custom')">Create custom Door</button>

            <button class="button" @click="removeDoor">Remove Door</button>
            <button class="button" @click="changeLock">Change Lockstate</button>
        </div>

        <div class="input-wrapper" v-if="inputActive">
            <p style="margin-top: -40px; text-align: center">
                Default GTA:V Door ({{ selection }})<br />
                {{ currentDoor }}
            </p>

            <input
                class="input"
                type="text"
                placeholder="<Mission Row - Police Department - Left>"
                v-model="data.doorName"
            />

            <input class="input" type="text" placeholder="<General Key LSPD>" v-model="data.keyName" />
            <input class="input" type="text" placeholder="<General Key Description>" v-model="data.keyDescription" />
            <input class="input" type="text" placeholder="<General Key LSPD>" v-model="data.faction" />
            <button class="execute" @click="execute">Execute!</button>
            <p style="text-align: center">&copy; Created with ❤️ by Lord Development</p>
        </div>

        <div class="notification" v-else>
            <p>Was execution successfull?</p>
            <p>Successfully added door with properties:</p>
            <p>NAME | FACTION | KEYNAME | KEYDESC</p>
            <p>&copy; Created with ❤️ by Lord Development</p>
        </div>
    </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Anek+Bangla&family=Poppins:ital,wght@0,100;0,200;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
$font-stack: 'Poppins', sans-serif;
$ui-color: rgb(82, 145, 218);

.doors-wrapper {
    width: 25%;
    height: 750px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgb(0, 0, 0);
    font-family: $font-stack;
    font-size: 1rem;
    border-radius: 15px 15px 0px 0px;
}
.header {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: $ui-color;
    width: 100%;
    height: 100px;
    text-align: center;

    & .close-button {
        margin: 10px;
        width: 180px;
        height: 100px;
        border: 0px;
        transition: 0.5s !important;
        font-family: $font-stack;
        border-radius: 5px;
        background-color: rgb(0, 0, 0);
        color: $ui-color;
        font-size: 1.2rem;
    }

    & .close-button:hover {
        transition: 0.5s !important;
        color: white;
        cursor: pointer;
        background-color: rgba(56, 56, 56, 0.589);
    }
}
.content-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    & .button {
        background-color: rgba(8, 108, 155, 0.747);
        color: white;
        border: 0px;
        height: 60px;
        width: 190px;
        font-family: $font-stack;
        font-weight: bolder;
        font-size: 16px;
        margin: 1rem;
        border-radius: 10px;
        transition: 0.5s !important;
    }
    & .button:hover {
        transition: 0.5s !important;
        cursor: pointer;
        background-color: rgb(8, 108, 155);
    }
}
.input-wrapper {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    width: 80%;
    margin: 25px;
    & .input {
        border-radius: 5px;
        border: 1px solid $ui-color;
        background-color: transparent;
        font-family: $font-stack;
        color: white;
        text-align: center;
        padding: 5px;
    }

    & .input::placeholder {
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
    }

    & > input:not(:last-child) {
        margin-bottom: 20px;
    }

    & .execute {
        color: white;
        background-color: $ui-color;
        border-radius: 0px;
        border: 0px;
        height: 40px;
        transition: 0.5s !important;
    }

    & .execute:hover {
        transition: 0.5s !important;
        cursor: pointer;
        background-color: rgb(8, 108, 155);
    }
}
.notification {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    width: 100%;
    padding: 60px;
    & p {
        font-family: $font-stack;
        font-size: 1.2rem;
        color: white;
        text-align: center;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { Vector3 } from '../../../shared/interfaces/vector';
import { DOORCONTROLLER_EVENTS } from '../shared/defaults/events';
const ComponentName = 'DoorController';
export default defineComponent({
    name: ComponentName,
    data() {
        return {
            inputActive: false,
            selection: 'None',
            currentDoor: 'None',
            data: {
                doorName: '',
                keyName: '',
                keyDescription: '',
                faction: '',
                center: null,
                position: null,
            },
        };
    },
    mounted() {
        if ('alt' in window) {
            alt.emit(`${ComponentName}:Ready`);
            alt.on(`${ComponentName}:SetDoor`, this.setDoor);
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
        execute() {
            if ('alt' in window) {
                if(!this.data) return;
                alt.emit(DOORCONTROLLER_EVENTS.CREATE_DOOR, this.currentDoor, this.data);
            }
        },
        setDoor(door: (string | Vector3)[]) {
            this.currentDoor = door[0];
            this.data.center = door[1];
            this.data.position = door[2];
        },
        createDoor(type: string) {
            if (type === 'default') {
                this.selection = type;
                this.inputActive = true;
            } else {
                this.selection = type;
                this.inputActive = true;
            }
        },
        removeDoor() {},
        close() {
            alt.emit(`${ComponentName}:Close`);
        },
        handleKeyPress(e: { keyCode: number }) {
            if (e.keyCode === 27 && 'alt' in window) {
                alt.emit(`${ComponentName}:Close`);
            }
        },
    },
});
</script>
