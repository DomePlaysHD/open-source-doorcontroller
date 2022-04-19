<template>
    <div class="doors-body">
        <p style="color: white;">Hello from DoorsBody.vue!</p>
    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.doors-body {
    height: 400px;
    width: 600px;
    background-color: black;
    flex-grow: 1;
    & > p {
        text-align: center;
    }
}
</style>