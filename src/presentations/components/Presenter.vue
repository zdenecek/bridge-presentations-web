<template>
    <MainView ref="mainView" :game="game" />
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { Position  } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import MainView from '@/presenter/components/MainView.vue';
import { registerKeyboardShortcut } from '@/presenter/utils/shortcuts';
import { PassBid } from "@/bridge/model/Bid";
import { Player } from "@/bridge/model/Player";
import { PositionHelper } from "@/bridge/model/Position";

const props = defineProps<{
    visible: boolean;
}>();

const mainView = ref<typeof MainView>();
const players = PlayerFactory.makeObservablePlayers();
const game = ref<PresentationGame>(new PresentationGame(players, PresentationGameOptions.Default));

const startGame = (options: ConfiguratorOptions) => {
    const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew, 
    options.contract, options.trumps, options.dummy, options.staticDummyPosition, options.activePositions)
    const gm = GameFactory.makeObservableGame(players, gameOpts, options.vulnerability);
    
    game.value = gm;
    PlayerFactory.putHands(players, options.cards);
    nextTick(() => game.value.start(options.firstPlayer as Position, options.trumps));
};

onMounted(() => {
    // Arrow key shortcuts
    registerKeyboardShortcut('ArrowLeft', null, (e) => {
        arrowHelper(e.ctrlKey, Position.West);
    });

    registerKeyboardShortcut('ArrowRight', null, (e) => {
        arrowHelper(e.ctrlKey, Position.East);
    });

    registerKeyboardShortcut('ArrowDown', null, (e) => {
        arrowHelper(e.ctrlKey, Position.South);
    });

    registerKeyboardShortcut('ArrowUp', null, (e) => {
        arrowHelper(e.ctrlKey, Position.North);
    });

    // Undo shortcut
    registerKeyboardShortcut('z', null, () => {
        game.value.undo();
    });

    // Pass bid shortcut
    registerKeyboardShortcut(' ', null, (e) => {
        if (game.value.state === "bidding" && game.value.currentlyRequestedPlayer) {
            game.value.tryAddBid(new PassBid(), game.value.currentlyRequestedPlayer as Player);
        }
    });

    // TODO
    const arrowHelper = (ctrl: boolean, pos: Position) => {
        if (!ctrl) {
            // gameView.toggleVisible(pos);
            return;
        }

        PositionHelper.all().forEach((p) => {
            // if (p !== gameView.dummy) gameView.toggleVisible(p, p === pos);
        });
    }
});

// Expose methods for parent component (same as original methods)
defineExpose({
    startGame
});
</script>

<style lang="scss">
.presenter {
    width: 100%;
    height: 100%;
}
</style>
