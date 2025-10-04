<!--
  BidView.vue

 A naive image view for a bid.
-->

<template>
  <div :class="['bid', bidClass]" :style="elementStyle" ref="element">
    <img :src="imagePath" :style="imageStyle" :alt="bid.toString()" />
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { SuitHelper } from "../../bridge/model/Suit";
import { getImagePath, getImageRatio } from '../utils/images';
import { isHorizontal, Orientation } from '../model/Orientation';

const props =withDefaults(defineProps<{
  bid: Bid;
  width?: number;
  height?: number;
  orientation?: Orientation;
}>(), {
  orientation: Orientation.Up
});

const element = useTemplateRef<HTMLDivElement>('element');
const elementStyle = computed(() => {
  if (props.width !== undefined && props.height !== undefined)

    return {
      width: props.width ? props.width + 'px' : undefined,
      height: props.height ? props.height + 'px' : undefined
    };

  const ratio = getImageRatio(props.bid);
  const realRation = isHorizontal(props.orientation) ? ratio : 1 / ratio;

  if (props.height !== undefined) {
    const width = props.height * realRation;
    return {
      width: width + 'px',
      height: props.height + 'px'
    };
  }
  if (props.width !== undefined) {
    const height = props.width / realRation;
    return {
      width: props.width + 'px',
      height: height + 'px'
    };
  }
  return {};
});

const imageStyle = computed(() => {
  if (props.width === undefined && props.height === undefined) return {
    maxHeight: "100%",
    maxWidth: "100%"
  }
  if(isHorizontal(props.orientation)) {
    return props.orientation === Orientation.Up ? elementStyle.value : {
      ...elementStyle.value,
      transform: "rotate(180deg)",
      transformOrigin: "50% 50%"
    }
  } else {
    const dimensions = {
      width: elementStyle.value.height,
      height: elementStyle.value.width
    }
    const rotation = props.orientation === Orientation.Right ? {
      transform: "rotate(90deg) translateY(-100%)",
      transformOrigin: "top left"
    } : {
      transform: "rotate(270deg) translateX(-100%)",
      transformOrigin: "top left"
    }
    return {
      ...dimensions,
      ...rotation
    }
  }
});


const imagePath = computed(() => getImagePath(props.bid));



const bidClass = computed(() => {
  const bid = props.bid;
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
});

defineExpose({
  element,
});
</script>

<style scoped lang="scss">
.bid {
  display: inline-block;
  transition: ease 1s;

  img {
    top: 50%;
    left: 50%;
  }
}
</style>