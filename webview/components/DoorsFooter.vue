<template>
    <div class="doors-footer">
        <div class="footer-title">
            <p>&copy; Created with ❤️ by Lord Development</p>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@use '../config/variables.scss';
.doors-footer {
    display: flex;
    flex-direction: column;
    align-self: center;

    height: 50px;
    width: 100%;

    background-color: variables.$bar-color;
}

.footer-title {
    align-self: center;
    margin-top: -5px;
    
    & > p {
        text-align: center;
    }
}
</style>
