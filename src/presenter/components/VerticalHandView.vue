<template>
  <div class="vertical-hand-view" :class="`hand-${position}`" 
  :style="componentStyle"
  ref="root">
  <template v-if="debug">
    <div class="debug-item">
      <div class="debug-item-value">Height: {{ height }}</div>
      <div class="debug-item-value">Width: {{ width }}</div>
    </div>
  </template>
  </div>
</template>


<script setup lang="ts">
import { watch, computed, nextTick, useTemplateRef, inject, onMounted, onUnmounted } from 'vue';
import { Card } from "../../bridge/model/Card";
import { Hand } from "../../bridge/model/Hand";
import { Position } from "../../bridge/model/Position";
import { Suit } from "../../bridge/model/Suit";
import { Orientation, isHorizontal } from "../model/Orientation";
import { Point } from "../model/Point";
import { CardViewData } from './CardViewData';
import { useElementSize } from '../composables/useElementSize';
import { getElementOffset } from '../utils/offset';

// Props
const props = withDefaults(defineProps<{
  hand?: Hand;
  position: Position;
  rotation?: Orientation;
  dummy?: boolean;
  reverse?: boolean;
  prioritizedSuit?: Suit;
  maximumCardOffset?: number;
  dummySuitOffset?: number;
  dummyCardOffset?: number;
  cardViews: Map<Card, CardViewData>;
  cardDimensions: { width: number; height: number };
}>(), {
  rotation: Orientation.Up,
  dummy: false,
  reverse: false,
});


const debug = inject('debug', false);

const componentStyle = computed(() => {
  if (props.rotation === Orientation.Up || props.rotation === Orientation.Down) {
    return {
      height: props.cardDimensions.height + 'px',
      minHeight: props.cardDimensions.height + 'px',
      maxHeight: props.cardDimensions.height + 'px'
    };
  }
  return {
    width: props.cardDimensions.height + 'px',
    minWidth: props.cardDimensions.height + 'px',
    maxWidth: props.cardDimensions.height + 'px'
  };
});

const root = useTemplateRef<HTMLDivElement>('root');
const {width, height} = useElementSize(root);

const update = (): void => {
    nextTick(() => {
      
      if (!props.hand) return;
      
      if (isHorizontal(props.rotation)) {
        console.warn("Dummy not supported for vertical hand view");
      }
      else if (props.reverse) {
        updateReverseCards();
      } else {
        updateCards();
      }
    });
};



const getCardsBySuit = (): Record<Suit, Array<Card>> => {
  if (!props.hand) return {} as Record<Suit, Card[]>;
  return props.hand.cards.reduce((groups, card) => {
    (groups[card.suit] ||= []).push(card);
    return groups;
  }, {} as Record<Suit, Card[]>);
};

const updateReverseCards = (): void => {
  const yOffset = (height.value - props.cardDimensions.height) / 2;
  const xOffset = props.rotation === Orientation.Left ? width.value - props.cardDimensions.width : 0;
  const position = getElementOffset(root.value).moveBy(xOffset, yOffset);

  for (const card of props.hand?.cards ?? []) {
    const view = props.cardViews.get(card);
    if (!view) continue;
    view.position = position;
    view.reverse = true;
    view.hidden = false;
    view.rotation = Orientation.Up;
  }
}

// Update methods
const updateCards = (): void => {
  const space = (height.value - props.cardDimensions.height) / 3;
  const cards = getCardsBySuit();
  
  const isRight = props.rotation === Orientation.Right;


  const origin = getElementOffset(root.value);
  let currentY = origin.y;
  const startX = isRight ? origin.x : origin.x + width.value - props.cardDimensions.width;
  for (const [suitIndex, suit] of [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs].entries()) {
    const cardsInSuit = cards[suit] ?? [];
    let currentX = startX;
    let verticalSpace = cardsInSuit.length < 6  ? props.cardDimensions.width * 0.3  : 
    props.cardDimensions.width * 0.2;
    if (!isRight) verticalSpace = -verticalSpace;


    for (const [index, card] of cardsInSuit.entries()) {
      const view = props.cardViews.get(card);
      if (!view) continue;
      view.position = new Point(currentX, currentY);
      view.reverse = false;
      view.hidden = false;
      view.rotation = Orientation.Up;
      view.z = index + suitIndex * 10;
      currentX += verticalSpace;
    }
    currentY += space;
  }

};

let layoutObserver: ResizeObserver | null = null;

onMounted(() => {
  // Wait for initial layout
  requestAnimationFrame(() => {
    update();
  });
  
  // Watch for layout changes
  if (root.value) {
    layoutObserver = new ResizeObserver(() => {
      update();
    });
    layoutObserver.observe(root.value);
  }
});

onUnmounted(() => {
  layoutObserver?.disconnect();
});


// Watchers - automatically update when any relevant prop changes
watch(() => props.hand, (newHand) => {
  if (newHand) {
    update();
  }
}, { immediate: true });

watch(() => [
  props.dummy, 
  props.reverse, 
  props.prioritizedSuit, 
  props.rotation, 
  props.maximumCardOffset,
  props.dummySuitOffset,
  props.dummyCardOffset
], () => {
  update();
}, { deep: false });

watch(() => props.cardViews, () => {
  update();
}, { deep: false });

// Simple expose for external update calls
defineExpose({
  update
});
</script>

<style scoped>
.one-dimensional-hand-view {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style> 