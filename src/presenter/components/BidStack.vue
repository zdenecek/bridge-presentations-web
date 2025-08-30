<template>
  <div :class="['bid-stack-container']" ref="container">
    <BidView
      v-for="(bid, index) in bids"
      :key="index"
      :bid="bid"
      :style="{ left: bidPosition[index] + 'px' }"
      ref="bidRefs"
    />

    <div class="debug" v-if="debug">
      {{ width }} {{ usableWidth }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef } from "vue";
import { Bid } from "../../bridge/model/Bid";
import BidView from './BidView.vue';
import { useElementSize } from "@vueuse/core";

const props = defineProps<{
  bids: Bid[];
}>();

const container = useTemplateRef<HTMLDivElement>('container');
const bidRefs = useTemplateRef<typeof BidView[]>('bidRefs');

const { width } = useElementSize(container);
const usableWidth = computed(() => width.value - ( bidRefs.value?.[0].width || 0));

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

  const space = Math.min(35, usableWidth.value / (props.bids.length - 1));
  return [...Array(props.bids.length).keys()].map((_, i) => i * space);
});

const debug = inject("debug") as boolean;
</script>

<style scoped lang="scss">
.bid-stack-container {
  position: relative;

  .bid {
    position: absolute;
    min-height: 100%;
  }
}

</style>