<template>
  <div>
    <h1>Debug App</h1>
    <game-view :game="game" :vertical-card-layout="true" />
  </div>
</template>

<script setup lang="ts">
import { Position } from '@/bridge/model/Position';
import { PresentationGameOptions } from '@/bridge/model/PresentationGame';
import { Suit } from '@/bridge/model/Suit';
import { makeTestGame } from '@/presentations/class/debug';
import GameView from '@/presenter/components/GameView.vue';
import { onMounted, ref } from 'vue';


const game = ref(makeTestGame({
  ...PresentationGameOptions.Default,
  bidding: false,
  trumps: Suit.Spades
}
))
onMounted(() => {
  game.value.start(Position.North);
})

</script>