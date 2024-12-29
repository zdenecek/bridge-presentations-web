<template>
  <div class="presenter" ref="presenter"></div>
</template>

<script lang="ts" setup>
/**
 * This component is responsible for displaying the game.
 * 
 * Wraps the game view.
 */

import { Position, PositionHelper } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import $ from "jquery";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import GameViewFactory from "@/presenter/views/GameViewFactory";
import {
  PresentationGame,
  PresentationGameOptions,
} from "@/bridge/model/PresentationGame";
import { Application } from "../class/Application";
import { PassBid } from "@/bridge/model/Bid";
import { nextTick, onMounted, ref } from "vue";

// ref accomplishes getting the HTML element from the DOM (thanks to ref="presenter" in the template)
const presenter = ref(null as null | HTMLElement);

const players = PlayerFactory.makeObservablePlayers();
const gameView = GameViewFactory.make();
let game = new PresentationGame(players, PresentationGameOptions.Default);

function updatePositions(): void {
  gameView.update();
}

function startGame(
  options: ConfiguratorOptions,
  { endMessage }: { endMessage?: string }
): void {
  const gameOpts = new PresentationGameOptions(
    options.bidding,
    options.fake?.ns,
    options.fake?.ew,
    options.contract,
    options.trumps,
    options.activePositions
  );

  gameView.endMessage = endMessage;

  game = GameFactory.makeObservableGame(
    players,
    gameOpts,
    options.vulnerability
  );
  PlayerFactory.putHands(players, options.cards);
  gameView.attachGame(game, options.dummy, options.staticDummyPosition);

  nextTick(() => game.start(options.firstPlayer as Position, options.trumps));
}

onMounted(() => {
  $(window)
    .on("resize click", () => gameView.update())
    .on("keydown", (e) => {
      if (Application.state !== "presenter") return;

      var arrowHelper = (ctrl: boolean, pos: Position) => {
        if (!ctrl) {
          gameView.toggleVisible(pos);
          return;
        }

        PositionHelper.all().forEach((p) => {
          if (p !== gameView.dummy) gameView.toggleVisible(p, p === pos);
        });
      };

      if (e.key === "ArrowLeft") arrowHelper(e.ctrlKey, Position.West);
      if (e.key === "ArrowRight") arrowHelper(e.ctrlKey, Position.East);
      if (e.key === "ArrowDown") arrowHelper(e.ctrlKey, Position.South);
      if (e.key === "ArrowUp") arrowHelper(e.ctrlKey, Position.North);
      if (e.key === "Z" || e.key === "z") game.undo();
      if (
        e.key === " " &&
        game.state === "bidding" &&
        game.currentlyRequestedPlayer
      )
        game.tryAddBid(new PassBid(), game.currentlyRequestedPlayer);
    });

  if (presenter.value) gameView.attach(presenter.value);
});

defineExpose({ updatePositions, startGame });
</script>

<style lang="scss">
@import "@/presenter/assets/style/presenter.scss";
// @import '@/presenter/assets/style/debug.scss';

.presenter {
  width: 100%;
  height: 100%;
}
</style>
