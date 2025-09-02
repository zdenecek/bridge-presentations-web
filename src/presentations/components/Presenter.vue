<template>
    <div class="presenter-view">
        <game-view :game="game" :handsVisible="handsVisible" class="game-view"
            :endMessage="options.uiOptions.endMessage" />
        <div class="side-panel">
            <status-panel :game="game" />
            <bidding-history-view :auction="game?.auction" v-show="showBiddingHistory" />
            <control-panel :game="game" class="control-panel" v-show="showControlPanel" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Position } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import { useKeyboardShortcut } from '@/presenter/composables/useKeyboardShortcut';
import { PassBid } from "@/bridge/model/Bid";
import { Player } from "@/bridge/model/Player";
import { PositionHelper } from "@/bridge/model/Position";
import { useGameRef } from '@/presenter/composables/useGameRef';

import GameView from '@/presenter/components/GameView.vue';
import BiddingHistoryView from '@/presenter/components/BiddingHistoryView.vue';
import StatusPanel from '@/presenter/components/StatusPanel.vue';
import ControlPanel from '@/presenter/components/ControlPanel.vue';

const players = PlayerFactory.makeObservablePlayers();
const game = useGameRef(new PresentationGame(players, PresentationGameOptions.Default));

const props = defineProps<{
    options: ConfiguratorOptions;
}>();

defineExpose({
    startGame() {
        const options = props.options;
        const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew,
            options.contract, options.trumps, options.dummy, options.staticDummyPosition, options.activePositions)
        const gm = GameFactory.makeObservableGame(players, gameOpts, options.vulnerability);

        game.value = gm;
        PlayerFactory.putHands(players, options.cards);
        setTimeout(() => game.value.start(options.firstPlayer as Position, options.trumps));
    }
});


// Hide or show hands for presentation purposes
const handsVisible = ref<Map<Position, boolean>>(new Map(
    PositionHelper.all().map((position) => [position, true])
));
[
    { key: 'ArrowLeft', pos: Position.West },
    { key: 'ArrowRight', pos: Position.East },
    { key: 'ArrowDown', pos: Position.South },
    { key: 'ArrowUp', pos: Position.North }
].forEach(({ key, pos }) => {
    useKeyboardShortcut(key, null, () =>
        handsVisible.value.set(pos, !handsVisible.value.get(pos))
    );
});


useKeyboardShortcut('z', null, () =>
    game.value.undo()
);

// Pass bid shortcut
useKeyboardShortcut(' ', null, () => {
    if (game.value.state === "bidding" && game.value.currentlyRequestedPlayer) {
        game.value.tryAddBid(new PassBid(), game.value.currentlyRequestedPlayer as Player);
    }
});



const showBiddingHistory = computed(() => {
    return (game.value.state === "cardplay" || game.value.state === "finished") &&
        game.value.bidding;
});

const showControlPanel = computed(() => {
    return game.value.state === "cardplay";
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