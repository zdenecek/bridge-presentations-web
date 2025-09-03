<template>
  <div class="status-panel" v-show="isVisible">
    <div class="t-label-tricks">Tricks</div>
    <div class="t-label-contract">Contract</div>
    
    <div class="trick-count-panel">
      <div class="c-tricks-ns c-tricks">
        <div class="t-label">NS</div>
        <div class="t-count">{{ nsTrickCount }}</div>
      </div>
      <div class="c-tricks-ew c-tricks">
        <div class="t-label">EW</div>
        <div class="t-count">{{ ewTrickCount }}</div>
      </div>
    </div>
    
    <div class="t-contract">{{ contractText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Side } from '@/bridge/model/Position';
import { SuitHelper } from '@/bridge/model/Suit';
import { PresentationGame } from '@/bridge/model/PresentationGame';


const props = defineProps<{
  game: PresentationGame;
}>();

// Computed properties for reactive data
const nsTrickCount = computed(() => {
  return props.game?.trickCount(Side.NS)?.toString() || '0';
});

const ewTrickCount = computed(() => {
  return props.game?.trickCount(Side.EW)?.toString() || '0';
});

const contractText = computed(() => {
  if (!props.game) return '';
  
  if (props.game.finalContract) {
    return props.game.finalContract.toString();
  } else if (props.game.trumps) {
    return SuitHelper.toString(props.game.trumps);
  } else {
    return 'Passed';
  }
});

const isVisible = computed(() => {
  return props.game.state === "cardplay" || props.game.state === "finished";
});
</script>

<style scoped lang="scss">
@use '../assets/style/variables' as variables;

.status-panel {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: variables.$primary;

  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  column-gap: 10px;

  padding-top: 50px;

  div,
  span {
    padding: 4px 14px;
  }

  .trick-count-panel {
    display: grid;
    grid-template-columns: 1fr 20px 1fr;
  }

  .c-tricks {
    display: flex;
    flex-direction: column;
    grid-row: 2;

    padding: 0;

    outline: solid 1px variables.$primary;
    outline-offset: -1px;

    .t-label {
      background-color: variables.$primary;
      color: variables.$secondary;
    }
    &.c-tricks-ns {
      grid-column: 1;
    }

    &.c-tricks-ew {
      grid-column: 3;
    }

    .t-count {
      grid-column: 1;
      grid-row: 3;
    }
  }

  .t-contract {
    padding-left: 30px;
    padding-right: 30px;
    outline: solid 1px variables.$primary;
    outline-offset: -1px;
  }
}
</style>
