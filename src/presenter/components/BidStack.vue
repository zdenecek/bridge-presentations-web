<template>
  <div :class="['bid-stack-container', `bid-stack-container-${position}`]" ref="container">
    ...

    <BidView
        v-for="(bid, index) in bids"
        :key="index" :bid="bid"
      />
    ...

  </div>
</template>

<script setup lang="ts">
import { Bid } from "../../bridge/model/Bid";
import { Position } from "../../bridge/model/Position";
import BidView from './BidView.vue';

const props = defineProps<{
  position: Position;
  bids: Bid[];
}>();

</script>