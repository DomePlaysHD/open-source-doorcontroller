<template>
    <div class="doors-body">
        <div class="button-wrapper">
            <button>Default Door</button>
            <button>Custom Door</button>
            <button>Remove Door</button>
            <button>Button 4</button>
        </div>

        <div class="info-wrapper">
            <p v-if="selection == 'default'">Hello World</p>
        </div>

        <div class="input-wrapper" v-if="inputIsActive">
            <input placeholder="Hello World" />
            <input placeholder="Hello World" />
            <input placeholder="Hello World" />
            <input placeholder="Hello World" />
        </div>

        <div class="execute-button-wrapper">
            <p>Hello World!</p>
        </div>
    </div>
</template>

<script lang="ts" setup>

let selection = 'default';
let inputIsActive = true;

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

    background-color: rgb(35, 153, 81);

    & > p {
        text-align: center;
    }
}

.button-wrapper {
    display: grid;
    grid-template-columns: 2fr 2fr;

    & > button {
        display: grid;
        align-content: center;
        width: 150px;
        height: 35px;

        margin-top: 15px;
        margin-left: 10px;
        margin-right: 10px;
        margin-bottom: 10px;

        border: 0px;
        background: black;
        color: white;

        font-family: variables.$font-stack;

        transition: 0.5s !important;
    }

    & > button:hover {
        background: gray;
        transition: 0.5s !important;
        cursor: pointer;
    }
}

.input-wrapper {
    display: grid;
    grid-template-columns: 2fr 2fr;

    & > input {
        height: 35px;
        margin-left: 10px;
        margin-right: 10px;
        margin-bottom: 5px;
        border: 0px;
        background: variables.$input-background;
    }
}
</style>
