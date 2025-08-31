<template>
    <div class="main-view-wrapper">
        <game-provider :game="game" v-slot="{game}">
        <GameView :game="game" />
        </game-provider>
    </div>
</template>

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import GameView from './GameView.vue';
import GameProvider from './GameProvider.vue';

const props = defineProps<{
    game: PresentationGame;
}>();

</script>

<style scoped lang="scss">
.main-view-wrapper {
    width: 100%;
    height: 100%;
}
</style>