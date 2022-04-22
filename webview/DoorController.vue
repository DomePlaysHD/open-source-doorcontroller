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

/* VueJS - Composition API */
defineComponent({
    name: 'DoorController',
});

onMounted(() => {
    if ('alt' in window) {
        alt.emit(`DoorController:Ready`);
        document.addEventListener('keyup', handleKeyPress);
    }
});

onUnmounted(() => {
    if ('alt' in window) {
        /* */
    }
    document.removeEventListener('keyup', handleKeyPress);
});

/* Functions */
function handleKeyPress(e: { keyCode: number }) {
    if (e.keyCode === 27 && 'alt' in window) {
        alt.emit(`DoorController:Close`);
    }
}
</script>

<style lang="scss" scoped>
.flex-container {
    position: absolute;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    left: 2.5%;
    width: 400px;
    height: 800px;
}
</style>
