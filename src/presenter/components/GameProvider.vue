
<template>
    <slot :game="gameRef"></slot>
</template>
<!--
  GameProvider.vue

  Provides a reactive PresentationGame instance to its slot via the `game` prop.
  The slot receives a `game` ref that updates when the game changes or when
  relevant game events occur (such as card played, trick ended, etc).
-->

<script setup lang="ts">
import { PresentationGame } from '@/bridge/model/PresentationGame';
import { shallowRef, triggerRef, watch } from 'vue';



const props = defineProps<{
  game: PresentationGame;
}>();

const gameRef = shallowRef(props.game);
watch(
  () => props.game,
  (newGame) => {
    gameRef.value = newGame;
  }
);


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
