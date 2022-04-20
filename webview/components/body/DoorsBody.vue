<template>
    <div class="doors-body">
        <div class="button-wrapper">
            <button>Default Door</button>
            <button>Custom Door</button>
            <button>Remove Door</button>
            <button>N/A</button>
        </div>

        <div class="info-wrapper">
            <span v-if="selection == 'default'">
                {{ door.name.value }}<br />
                {{ door.keyName.value }}<br />
                {{ door.keyDescription.value }}<br />
                {{ door.faction.value }}
            </span>
        </div>

        <div class="input-wrapper" v-if="inputIsActive">
            <input type="text" placeholder="<Door Name>" v-model="door.name.value"/>
            <input type="text" placeholder="<Door Keyname>" v-model="door.keyName.value" />
            <input type="text" placeholder="<Door Keydescription>" v-model="door.keyDescription.value" />
            <input type="text" placeholder="<Faction>" v-model="door.faction.value" />
        </div>

        <div class="execute-button-wrapper">
            <p>Hello World!</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

let selection = 'default';
let inputIsActive = true;

const door = {
    name: ref(),
    keyName: ref(),
    keyDescription: ref(),
    faction: ref()
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
    
    & > span {
        font-family: variables.$font-stack;
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
</style>
