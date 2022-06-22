<template>
    <div class="wrapper">
        <Toolbar pageName="DoorController" @click="closePage">OS - DoorController</Toolbar>
        <div class="doors-header">
            <p class="header-text">Door Manager</p>
        </div>
        <div class="content-wrapper">
            <div class="prop-wrapper">
                <p>{{ currentProp }}</p>
            </div>
            <div class="input">
                <input class="door-input" placeholder="<Door Name>" v-model="inputData.name"/>
                <input class="door-input" placeholder="<Key-Name>" v-model="inputData.keyName"/>
                <input class="door-input" placeholder="<Key-Description>" v-model="inputData.keyDescription"/>
                <input class="door-input" placeholder="<Faction>" v-model="inputData.faction"/>
            </div>

            <div class="buttons">
                <button class="door-button" @click="saveDoor">Save Door</button>
                <button class="door-button">Disabled</button>
                <button class="door-button">Remove Door</button>
                <button class="door-button">Toggle Mode</button>
            </div>
        </div>
        <div class="footer-wrapper">
            <div class="footer-content">
                <p>Powerd by Open Source Development</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import Toolbar from '@components/Toolbar.vue';
import { DoorControllerEvents } from '../shared/enums/events';
import { Vector3 } from 'alt-shared';

defineComponent({
    name: 'DoorController',
});
let currentProp = ref('v_ilev_vh_door02');
let currentData = ref({});
let inputData = ref({
    name: '',
    keyName: '',
    keyDescription: '',
    faction: '',
})

onMounted(() => {
    if ('alt' in window) {
        alt.emit(`DoorController:Ready`);
        if ('alt' in window) {
            alt.on(DoorControllerEvents.setDefaultDoor, setDefaultDoor);
        }
        document.addEventListener('keyup', handleKeyPress);
    }
});

onUnmounted(() => {
    if ('alt' in window) {
        alt.on(DoorControllerEvents.setDefaultDoor, setDefaultDoor);
    }
    document.removeEventListener('keyup', handleKeyPress);
});

function setDefaultDoor(data: [string, Vector3, Vector3, Vector3]) {
    currentProp.value = data[0];
    currentData.value = data;
}
function saveDoor() {
    alt.emit(DoorControllerEvents.createDoor, currentData.value, inputData.value);
}
function handleKeyPress(e: { keyCode: number }) {
    if (e.keyCode === 27 && 'alt' in window) {
        alt.emit(`DoorController:Close`);
    }
}
function closePage() {
    'alt' in window ? alt.emit(`DoorController:Close`) : console.log("Closing (alt not in focus.)");
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap');
.wrapper {
    position: absolute;
    left: 2%;
    height: 750px;
    width: 450px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    background-color: rgba(0, 0, 0, 0.5);
}

.doors-header {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-image: url(./assets/images/banner.png);
    background-position: 1100px 415px;
    border-bottom: 2px inset rgb(40, 154, 253);
}

.header-text {
    text-align: center;
    font-size: 3em;
    font-family: 'Inter', sans-serif;
    font-weight: bold;
    color: rgba(236, 236, 236, 0.75);
    text-shadow: rgb(0, 0, 0) 1px 0 5px;
}

.content-wrapper {
    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;
    flex-grow: 1;
    background: rgb(0, 0, 0);
}
.prop-wrapper {
    width: 100%;
    margin: 0px;
    text-align: center;
    border-bottom: 2px inset rgb(40, 154, 253);
}
.input {
    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    height: 100%;
    width: 100%;
    border-bottom: 2px inset rgb(40, 154, 253);
}

.door-input {
    align-self: center;
    text-align: center;

    border: 0;
    border-radius: 5px;
    height: 40px;
    width: 70%;
    margin: 10px;
    background: rgba(120, 120, 120, 0.5);
}

.door-input::placeholder {
    font-family: 'Inter', sans-serif;
    font-size: 1.2em;
    text-align: center;
    color: rgba(236, 236, 236, 0.5);
}

.buttons {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    height: 35%;
    width: 100%;
    margin: 25px;
}

.door-button {
    text-align: center;
    width: 35%;
    height: 30%;
    margin: 10px;
    margin-top: 0px;
    margin-bottom: 0px;
    border-radius: 5px;
    color: white;
    font-family: 'Inter', sans-serif;
    background: rgb(0, 128, 255);
    border: 0px;
}

.door-button:hover {
    cursor: pointer;
    transition: 0.5s !important;
    background: rgb(58, 64, 70);
}

.footer-wrapper {
    display: flex;
    margin-top: auto;
    align-self: center;
    justify-content: center;
    align-items: center;

    width: 100%;
    background-color: rgb(0, 0, 0);
    border-top: 2px inset rgb(40, 154, 253);
}

input {
    font-family: 'Inter', sans-serif;
    color: white;
}
</style>
