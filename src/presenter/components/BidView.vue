<!--
  BidView.vue

  This component displays a single bridge bid as an image, with support for orientation and dynamic sizing.
  - The bid is rendered as an image (e.g., "1S", "Pass", "X", "XX") using preloaded PNG assets.
  - The `orientation` prop controls the orientation of the bid (up, right, down, left), and the image is rotated accordingly using CSS classes.
  - Sizing is controlled from the parent component.
  - The component exposes its DOM element and measured width/height for use by parent components (e.g., for stacking or layout).
-->

<template>
  <div :class="['bid', bidClass, rotationClass]" ref="element" :style="isHorizontal(orientation) ? {} : {
    height: width * ratio + 'px'
  }">
    <img :src="imagePath" :alt="bid.toString()" :style="isHorizontal(orientation) ? {} : {
      height: width + 'px'
    }" />
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { SuitHelper } from "../../bridge/model/Suit";
import { Orientation, isHorizontal } from '../model/Orientation';
import { useElementSize } from '../composables/useElementSize';

const props = withDefaults(defineProps<{
  bid: Bid;
  orientation?: Orientation;
}>(), {
  orientation: Orientation.Up
});

const element = useTemplateRef<HTMLDivElement>('element');
const { width, height } = useElementSize(element);

// Static image imports
const _images = import.meta.glob(
  ['@/presenter/assets/bidding-c/*.png'],
  { eager: true }
);

// ratio for the images in use.
const BIDDING_RATIO = 764 / 882;
const BIDDING_RATIO_PASS = 501 / 425;
const BIDDING_RATIO_DOUBLE = 733 / 622;
const ratio = computed(() => props.bid instanceof PassBid ? BIDDING_RATIO_PASS : (props.bid instanceof DoubleBid || props.bid instanceof RedoubleBid) ? BIDDING_RATIO_DOUBLE : BIDDING_RATIO);

const getImagePath = (bid: Bid): string => {
  if (bid instanceof ContractBid) {
    return (_images["/src/presenter/assets/bidding-c/" + `${bid.level}${SuitHelper.toLetter(bid.suit)}` + ".png"] as any).default;
  } else if (bid instanceof PassBid) {
    return (_images["/src/presenter/assets/bidding-c/pass.png"] as any).default;
  } else if (bid instanceof DoubleBid) {
    return (_images["/src/presenter/assets/bidding-c/x.png"] as any).default;
  } else if (bid instanceof RedoubleBid) {
    return (_images["/src/presenter/assets/bidding-c/xx.png"] as any).default;
  }
  throw new Error("Unknown bid type");
};

const getClass = (bid: Bid): string => {
  if (bid instanceof ContractBid) {
    return SuitHelper.toString(bid.suit).toLowerCase();
  } else if (bid instanceof PassBid) {
    return "pass";
  } else if (bid instanceof DoubleBid) {
    return "double";
  } else if (bid instanceof RedoubleBid) {
    return "redouble";
  }
  return "unknown";
};

const imagePath = computed(() => getImagePath(props.bid));
const bidClass = computed(() => getClass(props.bid));

const rotationClass = computed(() => {
  switch (props.orientation) {
    case Orientation.Right:
      return 'rotate-90';
    case Orientation.Down:
      return 'rotate-180';
    case Orientation.Left:
      return 'rotate-270';
    case Orientation.Up:
    default:
      return 'rotate-0';
  }
});


defineExpose({
  element,
  width,
  height
});
</script>

<style scoped lang="scss">
.bid {
  display: inline-block;
  transition: ease 1s;

  &.rotate-180 img,
  &.rotate-0 img {
    max-height: 100%;
    max-width: 100%;
    // for the vertical case the heigh is set manually
  }
}

.rotate-90 img {
  transform: rotate(90deg) translateY(-100%);
  transform-origin: top left;
}

.rotate-180 img {
  transform: rotate(180deg);
}

.rotate-270 img {
  transform: rotate(270deg) translateX(-100%);
  transform-origin: top left;
}
</style>