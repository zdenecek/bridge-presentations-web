<template>
  <div class="center-panel" >
    <div class="frame" :class="{ 'show-frame': showFrame }">
      <div 
        v-for="position in PositionHelper.all()" 
        :key="position"
        :class="[
          'center-frame-label',
          `center-frame-label-${position.toLowerCase()}`,
          { 'focused': focus === position },
          { 'label-vul': isVulnerable(position) },
          { 'label-nonvul': !isVulnerable(position) }
        ]"
      >
        {{ position }}
      </div>
      <slot></slot>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Position, PositionHelper } from "../../bridge/model/Position";
import { Vulnerability, VulnerabilityHelper } from "../../bridge/model/Vulnerability";
import { PresentationGame } from "../../bridge/model/PresentationGame";

const props = withDefaults(defineProps<{
  vulnerability?: Vulnerability;
  game?: PresentationGame;
  showFrame?: boolean;
}>(), {
  showFrame: true
});

const focus = ref<Position | undefined>(undefined);

const isVulnerable = (position: Position): boolean => {
  return props.vulnerability ? VulnerabilityHelper.IsVulnerable(position, props.vulnerability) : false;
};

// Watch for game changes and set up event listeners
watch(() => props.game, (newGame) => {
  if (!newGame) return;

  // Set up listeners for each player
  newGame.allPlayers.forEach((player) => {
    // Focus on player when bid is requested
    player.bidRequested.sub(() => {
      focus.value = player.position;
    });

    // Focus on player when play is requested
    player.playRequested.sub(() => {
      focus.value = player.position;
    });
  });

  // Clear focus when game ends
  newGame.gameEnded.sub(() => {
    focus.value = undefined;
  });
}, { immediate: true });

// Expose focus property for external control
defineExpose({
  focus
});
</script>

<style scoped lang="scss">
@use '../assets/style/variables' as variables;

.center-panel {

  padding: 16%;
  position: relative;

  .frame {
    position: absolute;
    top: 8%;
    left: 8%;
    right: 8%;
    bottom: 8%;
    border-radius: 2px;
    padding: 10%;
  }
 
  .frame.show-frame {
    outline: variables.$primary solid 3px;

  .center-frame-label {
    cursor: default;
    position: absolute;
    outline: solid variables.$primary 1px;
    padding: 2px 5px;
    background-color: variables.$background;
    border-radius: 2px;
    width: variables.$card-width;
    text-align: center;
    text-transform: uppercase;
    color: white;
    font-size: 2vh;
    font-weight: bold;



    &.label-nonvul {
      background-color: rgb(77, 117, 77);
    }

    &.label-vul {
      background-color: rgb(172, 21, 0);
      text-decoration: underline;
    }
    
    &.focused {
      background-color: yellow;
      color: black;
    }
  }

  .center-frame-label-north {
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  .center-frame-label-east {
    right: 0;
    top: 50%;
    transform: translateX(50%) translateY(-50%) rotate(90deg);
    transform-origin: 50% 50%;
  }

  .center-frame-label-south {
    left: 50%;
    bottom: 0;
    transform: translateX(-50%) translateY(50%);
  }

  .center-frame-label-west {
    top: 50%;
    left: 0;
    transform: translateX(-50%) translateY(-50%) rotate(270deg);
    transform-origin: 50% 50%;
  }
}
}
</style> 