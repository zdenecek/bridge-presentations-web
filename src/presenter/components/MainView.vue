<template>
   <GameView :game="game" />
</template>

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import { provide, ref, shallowRef, triggerRef, watch } from 'vue';
import GameView from './GameView.vue';

/**
 * GAME 
 * Wire game events to Vue reactive system
 */

const props = defineProps<{
  game: PresentationGame;
}>();

const gameRef = shallowRef(props.game);
watch(
  () => props.game,
  (newGame) => {
    console.log("gameRef", newGame);
    gameRef.value = newGame;
  }
);

provide("game", gameRef);

watch(
  () => props.game,
  (gm) => {
    [
      gm.cardPlayed,
      gm.trickEnded,
      gm.trickStarted,
      gm.biddingStarted,
      gm.cardplayStarted,
      gm.cardplayEnded,
      gm.gameStarted,
      gm.gameEnded,
      gm.stateChanged,
      gm.biddingEnded,
      gm.undoMade,
    ].forEach(ev => ev.sub(() => {
      triggerRef(gameRef)
    }));
  }
);

</script>

<style scoped lang="scss">
</style>