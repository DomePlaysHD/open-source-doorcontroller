<template>
    <div class="doors-header">
        <div class="header-close-bar">
            <button class="close">Close!</button>
        </div>
        <p>Hello from DoorsHeader.vue!</p>
    </div>
</template>

<script lang="ts" setup>
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

    height: 100px;
    width: 600px;
    background-color: #000000;
    border-radius: 15px 15px 0 0;
    & > p {
        display: inline-flex;
        align-self: center;
    }
}

.header-close-bar {
    display: flex;
    align-self: flex-start;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    background-color: variables.$light-blue;
    border-radius: 15px 15px 0 0;
    & .close {
        height: 35px;
        width: 125px;
        background: red;
        border: 0px;
        color: white;
    }
}

</style>
