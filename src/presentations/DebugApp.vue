<template>
 <bid-stack :bids="bids" position="east"  id="bid-stack"/>
</template>

<script setup lang="ts" >
import BidStack from '@/presenter/components/BidStack.vue';
import { Bid, ContractBid } from '@/bridge/model/Bid';
import { provide, ref } from 'vue';
import { Suit } from '@/bridge/model/Suit';


const bids = ref<Bid[]>([]);

provide("debug", true);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    // Add a dummy bid for testing
    bids.value.push(new ContractBid(Suit.Hearts, 1));
  }
});

</script>


<style>
#bid-stack {
  width: 300px;
  height: 100px;
  background-color: red;
}
</style>