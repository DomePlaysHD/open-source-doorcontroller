<template>
    <div class="flex-container">
        <DoorsHeader />
        <DoorsBody />
        <DoorsFooter />
    </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import DoorsHeader from './components/header/DoorsHeader.vue';
// @ts-ignore
import DoorsBody from './components/body/DoorsBody.vue';
// @ts-ignore
import DoorsFooter from './components/footer/DoorsFooter.vue';

import { defineComponent, onMounted, onUnmounted } from 'vue';
import { DoorControllerEvents } from '../shared/enums/events';

defineComponent({
    name: 'DoorController'
});

onMounted(() => {
    if ('alt' in window) {
        if ('alt' in window) {
            alt.emit(`DoorController:Ready`);
            alt.on(DoorControllerEvents.pushDefaultDoor, pushDefaultDoor);
        }
        document.addEventListener('keyup', handleKeyPress);
    }
});

onUnmounted(() => {
    if ('alt' in window) {
        alt.off(DoorControllerEvents.pushDefaultDoor, pushDefaultDoor);
    }
    document.removeEventListener('keyup', handleKeyPress);
});

let models: Object = {
    name: '',
    faction: '',
    
    keyDescription: '',
    keyName: '',

    prop: '',
}

function pushDefaultDoor() {}
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