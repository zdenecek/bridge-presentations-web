<template>
  <div>
    <h1>Debug App</h1>
    <div>
        <bid-view :bid="new PassBid()" :orientation="Orientation.Up" :height="100" />
        <bid-view :bid="new DoubleBid()" :orientation="Orientation.Down" :height="100" />

        <bid-view :bid="new PassBid()" :orientation="Orientation.Left" :width="100" />
        <bid-view :bid="new PassBid()" :orientation="Orientation.Right" :width="100" />
    </div>
    <div class="flex flex-row">
        <bid-stack style="width: 200px; height: 100px;" :bids="bids" :orientation="Orientation.Up" />
        <bid-stack style="width: 200px; height: 100px;" :bids="bids" :orientation="Orientation.Down" />
    </div>
    <div class="flex flex-row"> 
        <bid-stack style="width: 100px; height: 300px;" :bids="bids" :orientation="Orientation.Left" />
        <bid-stack style="width: 100px; height: 300px;" :bids="bids" :orientation="Orientation.Right" />
    </div>
    <button @click="addBid">Add Bid</button>
  </div>
</template>

<script setup lang="ts">
import BidStack from '@/presenter/components/BidStack.vue';
import BidView from '@/presenter/components/BidView.vue';
import { Orientation } from '@/presenter/model/Orientation';
import { Bid, PassBid, DoubleBid } from '@/bridge/model/Bid';
import { ref } from 'vue';
import { useKeyboardShortcut } from '@/presenter/composables/useKeyboardShortcut';

const bids = ref<Bid[]>([]);

useKeyboardShortcut(' ', null, () => {
  console.log('space');
  addBid();
});

const addBid = () => {
  bids.value.push(new PassBid());
};
</script>

<style lang="scss">
.bid {
    outline: 1px solid red;
    img {
        outline: 1px dashed blue;
    }
}
   
  .bid-stack:nth-child(1) {
    background-color: lightblue;
  }

  .bid-stack:nth-child(2) {
    background-color: lightgreen;
  }

  .bid-stack:nth-child(3) {
    background-color: lightcoral;
  }

.flex-row {
    display: flex;
    flex-direction: row;
}

.flex {
    display: flex;
}
</style>