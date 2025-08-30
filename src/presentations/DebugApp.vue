<template>
  <bid-stack :bids="bids" id="bid-stack" />
  <bid-stack :bids="bids" :orientation="Orientation.Right" id="bid-stack2" /> 
  <bid-stack :bids="bids" :orientation="Orientation.Down" id="bid-stack3" />
  <bid-stack :bids="bids" :orientation="Orientation.Left" id="bid-stack4" />
  <bid-view :bid="passBid" :rotation="rotation" id="bid-view"></bid-view>
</template>

<script setup lang="ts">
import BidStack from '@/presenter/components/BidStack.vue';
import BidView from '@/presenter/components/BidView.vue';

import { Bid, ContractBid, PassBid } from '@/bridge/model/Bid';
import { provide, ref } from 'vue';
import { Suit } from '@/bridge/model/Suit';
import { Orientation } from '@/presenter/classes/Orientation';


const passBid = new PassBid();
const bids = ref<Bid[]>([]);

const rotation = ref(Orientation.Up);

provide("debug", true);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    // Add a dummy bid for testing
    bids.value.push(new ContractBid(Suit.Hearts, 1));
    rotation.value = rotation.value === Orientation.Up ? Orientation.Left : Orientation.Up;
  }
});

</script>


<style>
#bid-view {
  width: 100px;
  background-color: green;
}


#bid-stack {
  width: 300px;
  height: 100px;
  background-color: red;
}

#bid-stack2 {
  width: 100px;
  height: 300px;
  background-color: blue;
}

#bid-stack3 {
  width: 300px;
  height: 100px;
  background-color: green;
}

#bid-stack4 {
  width: 100px;
  height: 300px;
  background-color: red;
}
</style>