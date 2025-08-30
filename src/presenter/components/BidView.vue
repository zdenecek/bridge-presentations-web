<template>
  <div :class="['bid', bidClass]" ref="element">
    <img :src="imagePath" :alt="bid.toString()"/>
  </div>
</template>

<script setup lang="ts">
import { computed,  useTemplateRef } from 'vue';
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { SuitHelper } from "../../bridge/model/Suit";
import { useElementSize } from "@vueuse/core";

const props = defineProps<{
  bid: Bid;
}>();

const element = useTemplateRef<HTMLDivElement>('element');
const { width } = useElementSize(element);


// Static image imports
const _images = import.meta.glob(
  ['@/presenter/assets/bidding-c/*.png'], 
  { eager: true }
);

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


defineExpose({
  element,
  width
});
</script>

<style scoped lang="scss">
.bid {
  display: inline-block;
  transition: ease 1s;
  height: 100px;
  width: auto;

  img {
    height: 100px;
    width: auto;
    object-fit: contain;
  }
}
</style> 