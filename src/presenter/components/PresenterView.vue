<template>
    <div class="presenter-view">
        <div style="color: white;">{{ game.state }}</div>
        <game-view :game="game" :handsVisible="handsVisible" class="game-view" />
        <div class="side-panel">
            <status-panel :game="game" />
            <bidding-history-view :auction="game?.auction" v-show="showBiddingHistory" />
            <control-panel :game="game" class="control-panel" v-show="showControlPanel" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import GameView from './GameView.vue';
import { Position } from '@/bridge/model/Position';
import { computed } from 'vue';
import BiddingHistoryView from './BiddingHistoryView.vue';
import StatusPanel from './StatusPanel.vue';
import ControlPanel from './ControlPanel.vue';

const props = defineProps<{
    game: PresentationGame;
    handsVisible: Map<Position, boolean>;
}>();

const showBiddingHistory = computed(() => {
    return  (props.game.state === "cardplay" || props.game.state === "finished") &&
    (props.game).bidding;
});

const showControlPanel = computed(() => {
    return props.game.state === "cardplay";
});

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

    .control-panel {
        position: absolute;
        bottom: 0;
        right: 0;
    }
}
</style>