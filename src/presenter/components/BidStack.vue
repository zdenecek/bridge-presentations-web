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
    <BidView v-for="(bid, index) in bids" :key="index" :bid="bid"
      v-bind="baseBidDimensions" 
      :style="getBidStyle(index)"
      :orientation="orientation" 
      :class="['bid-animate', animationDirection]" 
      ref="bidRefs">
    </BidView>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef } from "vue";
import { Bid } from "../../bridge/model/Bid";
import BidView from './BidView.vue';
import { Orientation, isHorizontal } from "../model/Orientation";
import { useElementSize } from "../composables/useElementSize";
import { getImageRatio } from "../utils/images";

const props = withDefaults(defineProps<{
  bids: Bid[];
  orientation?: Orientation;
}>(), {
  orientation: Orientation.Up
});

const debug = inject('debug', false);

const container = useTemplateRef<HTMLDivElement>('container');
const bidRefs = useTemplateRef<typeof BidView[]>('bidRefs');

const { width, height } = useElementSize(container);

/**
 * The size of the secondary axis (perpendicular to stacking direction).
 * For Up/Down (vertical stacking): uses container height
 * For Left/Right (horizontal stacking): uses container width
 */
const secondaryAxisSize = computed(() => {
  const result = isHorizontal(props.orientation) ? height.value : width.value;
  return result > 0 ? result : 100;
});

/**
 * The size of the main axis for positioning bids based on orientation.
 * For Up/Down (vertical stacking): uses container width
 * For Left/Right (horizontal stacking): uses container height
 */
const mainAxisSize = computed(() => {
  const result = isHorizontal(props.orientation) ? width.value : height.value;
  // Fallback to reasonable defaults if container size is 0
  return result > 0 ? result : 300;
});

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

const baseBidDimensions = computed(() => {
  return isHorizontal(props.orientation)
    ? { height: secondaryAxisSize.value }
    : { width: secondaryAxisSize.value };
});

const getLastBidPrimaryAxisSize = computed(() => {

  const lastBid = props.bids[props.bids.length - 1];
  return secondaryAxisSize.value * getImageRatio(lastBid);
});
  

/**
 * Computes the positions (in pixels) for each bid in the stack along the primary axis.
 * 
 * - If there are no bids, returns an empty array.
 * - If there is only one bid, it is positioned at 0px (the start).
 * - For multiple bids, calculates the spacing between them:
 *    - The usable space is the main axis size minus one full bid size (to ensure last bid fits)
 *    - The space between each bid is the smaller of 35px or the result of dividing usable space by (number of bids - 1).
 *    - Each bid is positioned at `i * space`, where `i` is its index in the array.
 */
const bidPosition = computed(() => {
  if (props.bids.length === 0) return [];
  if (props.bids.length === 1) {
    return [(mainAxisSize.value - getLastBidPrimaryAxisSize.value) / 2];
  }


  const lastBidPrimaryAxisSize = getLastBidPrimaryAxisSize.value;
  const usableSpace = mainAxisSize.value - lastBidPrimaryAxisSize;

  const spacePerBid = Math.min(35, usableSpace / (props.bids.length - 1));

  const usedSpace = (props.bids.length - 1) * spacePerBid + lastBidPrimaryAxisSize;

  const shift = usedSpace >= mainAxisSize.value ? 0 : (mainAxisSize.value - usedSpace) / 2;

  return Array.from({ length: props.bids.length }, (_, i) => i * spacePerBid + shift);  
});

/**
 * Computes the complete style object for each bid
 */
const getBidStyle = (index: number) => {
  const position = bidPosition.value[index];
  const posOrigin = positionOrigin.value;
  
  const style = {
    [posOrigin]: position + 'px'
  };
  
  return style;
};

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

.debug {
  z-index: 9999;
  color: red;
  position: absolute;
  top: 0;
  left: 0;
}
</style>