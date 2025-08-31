<template>
  <div class="bidding-history">
    <span class="header header-west">West</span>
    <span class="header header-north">North</span>
    <span class="header header-east">East</span>
    <span class="header header-south">South</span>
    <div class="separator"></div>
    
    <!-- Spacer views for dealer positioning -->
    <span 
      v-for="(_, index) in spacerCount" 
      :key="`spacer-${index}`" 
      class="spacer"
    ></span>
    
    <!-- Bid views -->
    <span 
      v-for="(bid, index) in auction?.bids" 
      :key="`bid-${index}`"
      :class="['bid-view', `bid-view-${bid.position}`]"
    >
      {{ bid.bid.toString() }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Auction } from '@/bridge/model/Auction';
import { Position, PositionHelper } from '@/bridge/model/Position';

interface Props {
  auction?: Auction;
}

const props = withDefaults(defineProps<Props>(), {
  auction: undefined
});

// Calculate how many spacer elements we need based on dealer position
const spacerCount = computed(() => {
  if (!props.auction) return 0;
  
  let pos = props.auction.dealer;
  let count = 0;
  
  while (pos !== Position.West) {
    pos = PositionHelper.nextPosition(pos, 3);
    count++;
  }
  
  return count;
});
</script>

<style scoped lang="scss">
@use '../assets/style/variables' as variables;

.bidding-history {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  grid-template-rows: min-content;
  color: variables.$primary;

  font-size: 2.4vh;

  text-align: center;
  margin-top: 1.5em;

  .separator {
    grid-column: 1 / span 4;
    height: 0;
    height: 1px;
    background-color: variables.$primary;
  }

  .header {
    padding: 2px 10px;
  }

  .header-south,
  .header-north,
  .bid-view-south,
  .bid-view-north {
    color: goldenrod;
  }

  .bid-view {
    padding-bottom: 6px;
  }
}

</style>
