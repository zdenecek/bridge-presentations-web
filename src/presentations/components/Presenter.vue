<template>
    <GameView v-if="game" ref="gameView" :game="game" />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, shallowRef, triggerRef } from 'vue';
import { Position, PositionHelper } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import $ from "jquery";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import { Application } from "../class/Application";
import { PassBid } from "@/bridge/model/Bid";
import { Player } from '@/bridge/model/Player';
import GameView from '@/presenter/components/GameView.vue';

// Setup - same as original setup() function

const gameView = ref<typeof GameView>();
const players = PlayerFactory.makeObservablePlayers();
const game = ref<PresentationGame>(new PresentationGame(players, PresentationGameOptions.Default));

// Methods - exactly the same as original methods
const updatePositions = () => {
};

const startGame = (options: ConfiguratorOptions, { endMessage }: { endMessage?: string }) => {
    const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew, options.contract, options.trumps, options.activePositions)


    const gm = GameFactory.makeObservableGame(players, gameOpts, options.vulnerability);
    game.value = gm;
    PlayerFactory.putHands(players, options.cards);
    
    
    nextTick(() => game.value.start(options.firstPlayer as Position, options.trumps));
};

// // Mounted - exactly the same as original mounted()
// onMounted(() => {
//     $(window)
//         .on("keydown", (e) => {
//             if (Application.state !== 'presenter') return;

//             var arrowHelper = (ctrl: boolean, pos: Position) => {
//                 if (!ctrl) {
//                     // gameView.toggleVisible(pos);
//                     return;
//                 }

//                 PositionHelper.all().forEach((p) => {
//                     // if (p !== gameView.dummy) gameView.toggleVisible(p, p === pos);
//                 });
//             }

//             if (e.key === "ArrowLeft") arrowHelper(e.ctrlKey, Position.West);
//             if (e.key === "ArrowRight") arrowHelper(e.ctrlKey, Position.East);
//             if (e.key === "ArrowDown") arrowHelper(e.ctrlKey, Position.South);
//             if (e.key === "ArrowUp") arrowHelper(e.ctrlKey, Position.North);
//             if (e.key === "Z" || e.key === "z") game.value.undo();
//             if (e.key === " " && game.value.state === "bidding" && game.value.currentlyRequestedPlayer) game.value.tryAddBid(new PassBid(), game.value.currentlyRequestedPlayer as Player);

//         });
// });

// Expose methods for parent component (same as original methods)
defineExpose({
    updatePositions,
    startGame
});
</script>

<style lang="scss">
// @import "@/presenter/assets/style/presenter.scss";
// @import '@/presenter/assets/style/debug.scss';

.presenter {
    width: 100%;
    height: 100%;
}
</style>
