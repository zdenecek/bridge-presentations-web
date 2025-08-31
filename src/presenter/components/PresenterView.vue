<template>
    <div class="presenter-view">
        <game-provider :game="game" v-slot="{game}">
        <GameView :game="game" :handsVisible="handsVisible" class="game-view"/>
        </game-provider>
    </div>
</template>

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import GameView from './GameView.vue';
import GameProvider from './GameProvider.vue';
import { Position } from '@/bridge/model/Position';

const props = defineProps<{
    game: PresentationGame;
    handsVisible: Map<Position, boolean>;
}>();

</script>

<style scoped lang="scss">
.presenter-view {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr 100vh 2fr;
    background-color: black;

    ::selection {
    color: none;
    background: none;
  }

    .game-view {
        grid-column: 2;
    }
}
</style>