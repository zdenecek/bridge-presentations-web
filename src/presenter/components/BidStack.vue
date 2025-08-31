<!--
  BidStack.vue
  
  A component that displays a stack of bridge bids with support for orientation and directional animations.
  
  Features:
  - Displays multiple BidView components in a stack
  - Supports 4 orientations: Up, Right, Down, Left
  - Automatically positions bids with proper spacing
  - Provides directional animations based on orientation
  - Handles z-index stacking for proper layering
  - Responsive to container size changes
  
  Props:
  - bids: Array of Bid objects to display
  - orientation: Orientation enum for stack direction (default: Up)
  
  The component automatically calculates positioning, spacing, and animation direction
  based on the orientation, ensuring bids are properly laid out regardless of orientation.
-->

<template>
  <div class="bid-stack" ref="container">
    <BidView v-for="(bid, index) in bids" :key="index" :bid="bid" :style="{
      [positionOrigin]: bidPosition[index] + 'px',
      ...(isHorizontal(orientation) ? { width: 'auto', height: '100%' } :  { width: '100%' })
    }" :orientation="orientation" :class="['bid-animate', animationDirection]" ref="bidRefs" >
    </BidView>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { Bid } from "../../bridge/model/Bid";
import BidView from './BidView.vue';
import { useElementSize } from "@vueuse/core";
import { Orientation, isHorizontal } from "../classes/Orientation";

const props = withDefaults(defineProps<{
  bids: Bid[];
  orientation?: Orientation;
}>(), {
  orientation: Orientation.Up
});

const container = useTemplateRef<HTMLDivElement>('container');
const bidRefs = useTemplateRef<typeof BidView[]>('bidRefs');

const { width, height } = useElementSize(container);
/**
 * The size of the main axis for positioning bids based on orientation.
 * For horizontal rotations (Left/Right): uses container height
 * For vertical rotations (Up/Down): uses container width
 */
const mainAxisSize = computed(() => isHorizontal(props.orientation) ? width.value : height.value);

/**
 * The size of a bid along the main axis for spacing calculations.
 * For horizontal rotations: uses bid height
 * For vertical rotations: uses bid width
 */
const bidMainAxisSize = computed(() => isHorizontal(props.orientation) ? bidRefs.value?.[0].height : bidRefs.value?.[0].width);


/**
 * CSS property to use for positioning bids based on orientation.
 * - Up/Down: use 'left' for horizontal positioning
 * - Left/Right: use 'top' for vertical positioning
 */
const positionOrigin = computed(() => ({[Orientation.Up]: 'left',
[Orientation.Right]: 'top',
[Orientation.Down]: 'right',
[Orientation.Left]: 'bottom',
})[props.orientation]);

/**
 * Determines the animation direction for bids based on orientation.
 * Each direction flows from outside the container toward the final position:
 * - Up: bids flow down from above
 * - Right: bids flow left from the right edge
 * - Down: bids flow up from below
 * - Left: bids flow right from the left edge
 */
const animationDirection = computed(() => {
  switch (props.orientation) {
    case Orientation.Up:
      return 'flowFromTop';
    case Orientation.Right:
      return 'flowFromRight';
    case Orientation.Down:
      return 'flowFromBottom';
    case Orientation.Left:
      return 'flowFromLeft';
    default:
      return 'flowFromTop';
  }
});

/**
 * Computes the horizontal positions (in pixels) for each bid in the stack.
 * 
 * - If there are no bids, returns an empty array.
 * - If there is only one bid, it is positioned at 0px (the start).
 * - For multiple bids, calculates the spacing between them:
 *    - The available width for positioning is `usableWidth`.
 *    - The space between each bid is the smaller of 35px or the result of dividing `usableWidth` by (number of bids - 1).
 *    - Each bid is positioned at `i * space`, where `i` is its index in the array.
 *    - This ensures that bids are evenly distributed, but never spaced more than 35px apart.
 */
const bidPosition = computed(() => {
  if (props.bids.length === 0) return [];
  const space = Math.min(40, Math.max(20, mainAxisSize.value / props.bids.length));

  const bidsLen =  bidMainAxisSize.value  + space * (props.bids.length - 1);
  const start = (mainAxisSize.value - bidsLen) / 2;
  if (props.bids.length === 1) return [start];
  return [...Array(props.bids.length).keys()].map((_, i) => start + i * space);
});

</script>

<style scoped lang="scss">
.bid-stack {
  position: relative;

  .bid {
    position: absolute;
  }

  .bid:hover {   
    z-index: 100;
  }

  .bid-animate {
    animation-fill-mode: forwards;
    animation-duration: 0.6s;
  }

  .flowFromTop {
    animation-name: flowFromTop;
    transform: translateY(-20px);
  }

  .flowFromBottom {
    animation-name: flowFromBottom;
    transform: translateY(20px);
  }

  .flowFromLeft {
    animation-name: flowFromLeft;
    transform: translateX(-20px);
  }

  .flowFromRight {
    animation-name: flowFromRight;
    transform: translateX(20px);
  }
}

@keyframes flowFromTop {
  0% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes flowFromBottom {
  0% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes flowFromLeft {
  0% {
    transform: translateX(-20px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes flowFromRight {
  0% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>