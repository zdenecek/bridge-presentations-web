<template>
  <div :class="['bid-stack-container']" ref="container">
    <BidView v-for="(bid, index) in bids" :key="index" :bid="bid" :style="{
      [positionOrigin]: bidPosition[index] + 'px',
      zIndex: reverseZIndex ? 30 - index : index,
      ...(isHorizontal(rotation) ? { width: 'auto', height: '100%' } :  { width: '100%' })
    }" :rotation="rotation" :class="['bid-animate']" ref="bidRefs" >
    </BidView>
    <div class="debug" v-if="debug">
      {{ width }} {{ usableSize }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef } from "vue";
import { Bid } from "../../bridge/model/Bid";
import BidView from './BidView.vue';
import { useElementSize } from "@vueuse/core";
import { Orientation, isHorizontal } from "../classes/Rotation";

const props = withDefaults(defineProps<{
  bids: Bid[];
  rotation?: Orientation;
}>(), {
  rotation: Orientation.Up
});

const container = useTemplateRef<HTMLDivElement>('container');
const bidRefs = useTemplateRef<typeof BidView[]>('bidRefs');

const { width, height } = useElementSize(container);
const mainAxisSize = computed(() => isHorizontal(props.rotation) ? width.value : height.value);
const bidMainAxisSize = computed(() => isHorizontal(props.rotation) ? bidRefs.value?.[0].width : bidRefs.value?.[0].height);
const usableSize = computed(() => mainAxisSize.value - (bidMainAxisSize.value || 0));

const reverseZIndex = computed(() => props.rotation === Orientation.Left || props.rotation === Orientation.Down);

const positionOrigin = computed(() => ({[Orientation.Up]: 'left',
[Orientation.Right]: 'top',
[Orientation.Down]: 'left',
[Orientation.Left]: 'top',
})[props.rotation]);

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
  if (props.bids.length === 1) return [0];


  const minSpace = bidMainAxisSize.value ? (bidMainAxisSize.value / 2) : 35;
  const space = Math.min(minSpace, usableSize.value / (props.bids.length - 1));
  return [...Array(props.bids.length).keys()].map((_, i) => i * space);
});

const debug = inject("debug") as boolean;
</script>

<style scoped lang="scss">
.bid-stack-container {
  position: relative;

  .bid {
    position: absolute;
  }

  .bid:hover {   
    z-index: 100;
  }

  .bid-animate {
    animation-fill-mode: initial;
    animation: flowFromTop 0.6s forwards;
    transform: translateY(-20px);
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
</style>