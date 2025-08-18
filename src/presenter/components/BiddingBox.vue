<template>
  <div class="bidding-box">
    <!-- Contract Bids -->
    <div
      v-for="level in 7"
      :key="'level-' + level"
      class="bidding-box-level"
    >
      <div
        v-for="suit in SuitHelper.all()"
        :key="`${level}-${suit}`"
        :class="[
          'bidding-box-bid',
          `level-${level}`,
          `suit-${SuitHelper.toString(suit).toLowerCase()}`
        ]"
        @click="handleBidClick(new ContractBid(suit, level as ContractLevel))"
      >
        <span class="level">{{ level }}</span>
        <span class="suit">{{ SuitHelper.toSymbol(suit) }}</span>
      </div>
    </div>

    <!-- Other Bids -->
    <div class="bidding-box-other">
      <div
        class="bidding-box-bid pass"
        @click="handleBidClick(new PassBid())"
      >
        Pass
      </div>
      <div
        class="bidding-box-bid double"
        @click="handleBidClick(new DoubleBid())"
      >
        X
      </div>
      <div
        class="bidding-box-bid redouble"
        @click="handleBidClick(new RedoubleBid())"
      >
        XX
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { ContractLevel } from "../../bridge/model/Contract";
import { SuitHelper } from "../../bridge/model/Suit";


const emit = defineEmits<{
  (e: 'bid', bid: Bid): void;
}>();




const handleBidClick = (bid: Bid) => {
  emit('bid', bid);
};
</script>

<style scoped lang="scss">
.bidding-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: var(--background);
  border: 2px solid var(--primary);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &-level {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  &-other {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--primary);
  }

  &-bid {
    padding: 2px 4px;
    outline: solid 1px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    height: 2.5rem;

    &:hover {
      background-color: var(--primary);
      color: var(--background);
    }

    .level {
      color: black;
      font-weight: bold;
      margin-right: 0.25rem;
    }

    &.suit-clubs {
      color: #3575af;
      background-color: lighten(#3575af, 50%);
    }

    &.suit-diamonds {
      color: #d26d2a;
      background-color: lighten(#d26d2a, 50%);
    }

    &.suit-hearts {
      color: #e90202;
      background-color: lighten(#e90202, 50%);
    }

    &.suit-spades {
      color: black;
      background-color: gainsboro;
    }

    &.suit-notrump {
      color: black;
      background-color: lightgray;
    }

    &.pass {
      grid-column: span 3;
      background-color: green;
      color: white;
    }

    &.double {
      background-color: red;
      color: white;
    }

    &.redouble {
      background-color: blue;
      color: white;
    }
  }
}
</style> 