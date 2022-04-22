<template>
    <div class="doors-body">
        <div class="button-wrapper">
            <button disabled>DISABLED</button>
            <button disabled>DISABLED</button>
            <button disabled>DISABLED</button>
            <button disabled>DISABLED</button>
        </div>

        <div class="info-wrapper">
            <span v-if="selection == 'default'">
                <span>Current Selection => default</span><br />
                <span>Current Prop => {{ door.prop }}</span>
                <hr />
                {{ door.name }}<br />
                <hr />
                {{ door.keyName }}<br />
                <hr />
                {{ door.keyDescription }}<br />
                <hr />
                {{ door.faction }}
                <hr />
            </span>
        </div>

        <div class="input-wrapper" v-if="inputIsActive">
            <input type="text" placeholder="<Door Name>" v-model="door.name" />
            <input type="text" placeholder="<Door Keyname>" v-model="door.keyName" />
            <input type="text" placeholder="<Door Keydescription>" v-model="door.keyDescription" />
            <input type="text" placeholder="<Faction>" v-model="door.faction" />
        </div>

        <div class="execute-button-wrapper">
            <button @click="addDoor">Save</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { DoorControllerEvents } from '../../../shared/enums/events';

let selection = 'default';
let inputIsActive = true;

onMounted(() => {
    alt.on(DoorControllerEvents.setDefaultDoor, setDefaultDoor);
});

function setDefaultDoor(clientDoor: Object) {
    if (clientDoor[0]) door.value.prop = clientDoor[0];
    else door.value.prop = 'no prop found.';

    if (clientDoor[1]) door.value.center = clientDoor[1];
    if (clientDoor[2]) door.value.rot = clientDoor[2];
    if (clientDoor[3]) door.value.pos = clientDoor[3];
}

const door = ref({
    name: '<Door Name>',
    keyName: '<Key Name>',
    keyDescription: '<Key Description>',
    faction: '<Faction>',
    prop: 'Fallback',
    pos: {
        x: 0,
        y: 0,
        z: 0,
    },
    rot: {
        x: 0,
        y: 0,
        z: 0,
    },
    center: {
        x: 0,
        y: 0,
        z: 0,
    },
});

function addDoor() {
    if ('alt' in window) {
        alt.emit(DoorControllerEvents.createDoor, door.value);
    } else {
        console.log({ ...door.value });
    }
}
</script>

<style lang="scss" scoped>
@use '../../config/variables.scss';
.doors-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;

    height: 100%;
    width: 100%;

    background-color: rgb(0, 0, 0);

    & > p {
        text-align: center;
    }
}

.button-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;

    & > button {
        display: grid;
        align-content: center;
        width: 150px;
        height: 35px;

        margin-top: 15px;

        border: 0px;
        background: rgb(0, 111, 175);
        color: white;

        font-size: 1.1rem;
        font-family: variables.$font-stack;

        transition: 0.5s !important;
    }

    & > button:hover {
        background: gray;
        transition: 0.5s !important;
        cursor: pointer;
    }
}

.info-wrapper {
    display: flex;
    align-self: center;
    justify-content: center;
    flex-direction: column;

    flex-grow: 1;
    width: 100%;

    & > span {
        font-family: variables.$font-stack;
        text-align: center;
    }
}

.input-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;

    margin-top: 10px;
    & > input {
        height: 35px;

        margin-left: 10px;
        margin-right: 10px;
        margin-bottom: 5px;

        border: 0px;
        border-radius: 5px;
        background: variables.$input-background;

        font-family: variables.$font-stack;
        text-align: center;

        color: white;
    }

    & > ::placeholder {
        color: rgb(148, 133, 133);
    }
}

.execute-button-wrapper {
    display: flex;
    margin-top: 10px;
    margin-bottom: 10px;

    & > button {
        width: 150px;
        height: 35px;

        border: 0px;
        background: variables.$button-color;
        color: white;

        font-family: variables.$font-stack;
        transition: 0.5s !important;
    }

    & > button:hover {
        transition: 0.5s !important;
        background: variables.$button-color-hover;
        cursor: pointer;
    }
}

hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid lighten(variables.$button-color, 25%);
    margin: 1em 0;
    padding: 0;
}
</style>
