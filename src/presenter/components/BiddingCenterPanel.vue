<template>
  <div class="bidding-center-panel" :class="{ 'bidding-center-panel-auction': auctionVisible }">
    <div class="absolute" v-if="debug">
      <button @click="auctionVisible = !auctionVisible">Toggle auction</button>
    </div>
    <div class="bidding-center-panel-container">
      <slot></slot>
    </div>
    <BidStack v-for="position in positions" :key="position" :class="'bid-stack-'+ position "
      :orientation="getOrientation(position)"
       :bids="getBidsForPosition(position)" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue';
import { Position, PositionHelper } from "../../bridge/model/Position";
import { PresentationGame } from "../../bridge/model/PresentationGame";
import { Bid } from "../../bridge/model/Bid";
import BidStack from './BidStack.vue';
import { Orientation } from '../model/Orientation';

const props = defineProps<{
  auctionVisible?: boolean;
  game?: PresentationGame;
}>();

const auctionVisible = ref(props.auctionVisible);
watch(() => props.auctionVisible, (newAuctionVisible) => {
  auctionVisible.value = newAuctionVisible;
});

const debug = inject('debug', false);
const positions = computed(() => PositionHelper.all());

const getBidsForPosition = (position: Position): Bid[] => {
  const bids = props.game?.auction?.bids
    .filter(bid => bid.position === position)
    .map(bid => bid.bid) || [];
  return bids;
};

/**
 * Maps bridge positions to orientations for proper bid stack display.
 * Each position gets an orientation that matches the visual layout:
 * - North: Up (bids flow down from top)
 * - East: Right (bids flow left from right edge)
 * - South: Down (bids flow up from bottom)
 * - West: Left (bids flow right from left edge)
 */
const getOrientation = (position: Position): Orientation => {
  switch (position) {
    case Position.North:
      return Orientation.Up;
    case Position.East:
      return Orientation.Right;
    case Position.South:
      return Orientation.Up;
    case Position.West:
      return Orientation.Left;
    default:
      return Orientation.Up;
  }
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

  .bid-stack {


    &-north {
      grid-row: 1;
      grid-column: 2;
    }

    &-east {
      grid-row: 2 ;
      grid-column: 3;
    }

    &-south {
      grid-row: 3;
      grid-column: 2;
    }

    &-west {
      grid-column: 1;
      grid-row: 2;
   
    }
  }
}

.absolute {
  position: absolute;
}
</style>

<style scoped lang="scss">
.debug {

  .bid-stack-north {
    background-color: lightblue;
  }

  .bid-stack-east {
    background-color: lightgoldenrodyellow;
  }

  .bid-stack-south {
    background-color: lightgreen;
  }

  .bid-stack-west {
    background-color: lightpink;
  }
}
</style>