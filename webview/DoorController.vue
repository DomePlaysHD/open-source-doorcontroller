<template>
    <div class="flex-container">
        <DoorsHeader />
        <DoorsBody />
        <DoorsFooter />
    </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import DoorsHeader from './components/DoorsHeader.vue';
// @ts-ignore
import DoorsBody from './components/DoorsBody.vue';
// @ts-ignore
import DoorsFooter from './components/DoorsFooter.vue';

import { onMounted, onUnmounted } from 'vue';
import { DoorControllerEvents } from '../shared/enums/events';
onMounted(() => {
    if ('alt' in window) {
        if ('alt' in window) {
            alt.emit(`DoorController:Ready`);
            alt.on(DoorControllerEvents.pushDoorObject, pushDoorObject);
        }
        document.addEventListener('keyup', handleKeyPress);
    }
});

onUnmounted(() => {
    if ('alt' in window) {
        alt.off(DoorControllerEvents.pushDoorObject, pushDoorObject);
    }
    document.removeEventListener('keyup', handleKeyPress);
});

let door: Object = null;
let models = {
    doorName: '',
    faction: '',
    
    keyDescription: '',
    keyName: '',
}
function pushDoorObject() {}
function handleKeyPress(e: { keyCode: number }) {
    if (e.keyCode === 27 && 'alt' in window) {
        alt.emit(`DoorController:Close`);
    }
}
</script>

<style lang="scss" scoped>
.flex-container {
    position: absolute;
    left: 2.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    height: 600px;
}
</style>