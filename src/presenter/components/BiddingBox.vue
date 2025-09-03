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
@use '../assets/style/_variables.scss' as variables;

.bidding-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 12px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    border-radius: 12px;
    pointer-events: none;
  }

  &-level {
    display: flex;
    gap: 4px;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  &-other {
    display: flex;
    gap: 4px;
    justify-content: center;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }
  }

  &-bid {
    padding: 4px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.8rem;
    height: 2.2rem;
    font-weight: 600;
    font-size: 0.8rem;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }

    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      
      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(-1px) scale(1.02);
    }

    .level {
      color: variables.$primary;
      font-weight: 700;
      margin-right: 0.2rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .suit {
      font-size: 1rem;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }

    &.suit-clubs {
      color: #60a5fa;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%);
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.1);

      &:hover {
        box-shadow: 0 8px 25px rgba(96, 165, 250, 0.2);
        border-color: rgba(96, 165, 250, 0.6);
      }
    }

    &.suit-diamonds {
      color: #fb923c;
      background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.05) 100%);
      border-color: rgba(251, 146, 60, 0.4);
      box-shadow: 0 0 20px rgba(251, 146, 60, 0.1);

      &:hover {
        box-shadow: 0 8px 25px rgba(251, 146, 60, 0.2);
        border-color: rgba(251, 146, 60, 0.6);
      }
    }

    &.suit-hearts {
      color: #f87171;
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(248, 113, 113, 0.05) 100%);
      border-color: rgba(248, 113, 113, 0.4);
      box-shadow: 0 0 20px rgba(248, 113, 113, 0.1);

      &:hover {
        box-shadow: 0 8px 25px rgba(248, 113, 113, 0.2);
        border-color: rgba(248, 113, 113, 0.6);
      }
    }

    &.suit-spades {
      color: variables.$primary;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);

      &:hover {
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
      }
    }

    &.suit-notrump {
      color: #9ca3af;
      background: linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(156, 163, 175, 0.05) 100%);
      border-color: rgba(156, 163, 175, 0.4);
      box-shadow: 0 0 20px rgba(156, 163, 175, 0.1);

      &:hover {
        box-shadow: 0 8px 25px rgba(156, 163, 175, 0.2);
        border-color: rgba(156, 163, 175, 0.6);
      }
    }

    &.pass {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.15);

      &:hover {
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.25);
        border-color: rgba(34, 197, 94, 0.7);
      }
    }

    &.double {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);

      &:hover {
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
        border-color: rgba(239, 68, 68, 0.7);
      }
    }

    &.redouble {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);

      &:hover {
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        border-color: rgba(59, 130, 246, 0.7);
      }
    }
  }
}
</style> 