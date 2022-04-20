<template>
    <div class="doors-header">
        <div class="header-close-bar">
            <button class="close">Close Manager <Icon icon="icon-exit" :size="14" /></button>
        </div>

        <div class="header-title">
            <p>Athena Framework - Door Manager</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Icon from '@components/Icon.vue';
defineProps({
    firstLine: {
        type: String,
        default: 'No prop passed',
    },
});
</script>

<style lang="scss" scoped>
@use '../config/variables.scss';
.doors-header {
    display: flex;
    flex-direction: column;

    height: 200px;
    width: 100%;
    background-color: #000000;
    border-radius: 15px 15px 0 0;
    & > p {
        display: inline-flex;
        align-self: center;
    }
}

.header-close-bar {
    display: flex;
    flex-direction: column;
    align-self: center;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 50px;
    background-color: variables.$bar-color;
    border-radius: 15px 15px 0 0;
    & .close {
        height: 40px;
        width: 160px;
        background: variables.$button-color;
        border: 0px;
        color: white;
        transition: 0.5s !important;
    }
    & .close:hover {
        background: variables.$button-color-hover;
        transition: 0.5s !important;
        cursor: pointer;
    }
}

.header-title {
    align-self: center;
    font-family: variables.$header-font-stack;
    font-size: 2rem;
}
</style>
