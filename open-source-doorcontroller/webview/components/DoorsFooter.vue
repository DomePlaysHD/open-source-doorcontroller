<template>
    <div class="doors-footer">
       <p> Hello from DoorsFooter.vue! </p>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.doors-footer {
    display: flex;
    flex-direction: column;
    align-self: center;

    height: 50px;
    width: 600px;

    background-color: red;
    & > p {
        text-align: center;
    }
}
</style>
