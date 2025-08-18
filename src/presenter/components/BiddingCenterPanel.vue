<template>
  <div class="bidding-center-panel" :class="{ 'bidding-center-panel-auction': auctionVisible }">
    <div class="absolute" v-if="debug">
      <button @click="auctionVisible = !auctionVisible">Toggle auction</button>

    </div>
    <div class="bidding-center-panel-container">
      
      <slot></slot>
    </div>
    <BidStack v-for="position in positions" :key="position" :position="position"
       :bids="getBidsForPosition(position)" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue';
import { Position, PositionHelper } from "../../bridge/model/Position";
import { PresentationGame } from "../../bridge/model/PresentationGame";
import { Bid } from "../../bridge/model/Bid";
import BidStack from './BidStack.vue';

const props = defineProps<{
  auctionVisible?: boolean;
}>();

const auctionVisible = ref(props.auctionVisible);
watch(() => props.auctionVisible, (newAuctionVisible) => {
  auctionVisible.value = newAuctionVisible;
});

const game = inject('game', ref<PresentationGame>());
const debug = inject('debug', ref(false));

// Computed properties
const positions = computed(() => PositionHelper.all());

const getBidsForPosition = (position: Position): Bid[] => {
  const bids = game.value?.auction?.bids
    .filter(bid => bid.position === position)
    .map(bid => bid.bid) || [];
  console.log('bids', position, bids);
  return bids;
};
</script>

<style lang="scss">
@use '../assets/style/variables' as variables;

.bidding-center-panel {
  aspect-ratio: 1;
  position: relative;
  grid-row: 2;
  grid-column: 2;

  padding: 10px;
  display: grid;

  transition: all 1s;

  align-self: center;

  &.bidding-center-panel-auction {
    gap: 3px;
    grid-template-columns: variables.$bid-card-height auto variables.$bid-card-height;
    grid-template-rows: variables.$bid-card-height auto variables.$bid-card-height;
  }

  &:not(.bidding-center-panel-auction) {
    padding: 7% 7% 7% 7%;
    grid-template-columns: 0 auto 0;
    grid-template-rows: 0 auto 0;
  }

  .bidding-center-panel-container {
    grid-column: 2;
    grid-row: 2;
    position: relative;
  }

  .bid-stack-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  height: 100%;
  transition: 300ms;

  .bid-stack {
    position: relative;
        width: 100%;
        height: 100%;
        transition: 300ms;
  }

    &-north {
      grid-row: 1;
      grid-column: 2;
      grid-column-end: 4;
    }

    &-east {
      grid-row-start: 2;
      grid-row-end: 4;
      grid-column: 3;
      flex-direction: column;
      .bid-stack {
        transform: rotate(90deg);
        transform-origin: 50% 50%;
      }
    }

    &-south {
      grid-row: 3;
      grid-column: 1;
      grid-column-end: 3;
    }

    &-west {
      grid-column: 1;
      grid-row-start: 1;
      grid-row-end: 3;
      flex-direction: column;

      .bid-stack {
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
   
      }
    }
  }
}


// .bidding-center-panel {
//   position: relative;
//   aspect-ratio: 1;
//   display: grid;

//   grid-template-columns: 0px auto 0px;
//     grid-template-rows: 0px auto 0px;

//   gap: 3px;
//   padding: 10px;
//   transition: all 300ms ease;

//   &.bidding-center-panel-auction {
//     grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
//     grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
//   }
// }


// }
.absolute {
  position: absolute;
}
</style>

<style scoped lang="scss">
.debug {


  .bid-stack-container-north {
    background-color: lightblue;
  }

  .bid-stack-container-east {
    background-color: lightgoldenrodyellow;
  }

  .bid-stack-container-south {
    background-color: lightgreen;
  }

  .bid-stack-container-west {
    background-color: lightpink;
  }
}
</style>