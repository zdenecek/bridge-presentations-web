<template>
    <div class="presenter-view">
        <GameView :game="game" :handsVisible="handsVisible" class="game-view" />
        <div class="side-panel">
            <BiddingHistoryView :auction="game?.auction" v-show="showBiddingHistory" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import GameView from './GameView.vue';
import { Position } from '@/bridge/model/Position';
import { computed } from 'vue';
import BiddingHistoryView from './BiddingHistoryView.vue';

const props = defineProps<{
    game: PresentationGame;
    handsVisible: Map<Position, boolean>;
}>();

const showBiddingHistory = computed(() =>
    (props.game.state === "cardplay" || props.game.state === "finished") &&
    (props.game).bidding
);

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

    .side-panel {
        grid-column: 3;
        display: flex;
        flex-direction: column;
        gap: 40px;
        align-items: center;
    }
}
</style>