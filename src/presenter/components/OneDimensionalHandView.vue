<template>
  <div class="v-one-dimensional-hand-view" :class="`hand-${position}`" 
  :style="componentStyle"
  ref="root">
  <template v-if="debug">
    <div class="debug-item">
      <div class="debug-item-value">Offset: {{ _offset }}</div>
      <div class="debug-item-value">Height: {{ _height }}</div>
      <div class="debug-item-value">Width: {{ _width }}</div>
      <button @click="() => {_debug_dummy = !_debug_dummy; update(); }">Dummy</button>
    </div>
  </template>
  </div>
</template>


<script setup lang="ts">
import { watch, computed, nextTick, useTemplateRef, inject, ref, onMounted, onUnmounted } from 'vue';
import { sortCards, sortCardsByPrioritizedSuit, sortSuits } from "@/bridge/utils/CardSorter";
import { Card } from "../../bridge/model/Card";
import { Hand } from "../../bridge/model/Hand";
import { Position } from "../../bridge/model/Position";
import { Suit } from "../../bridge/model/Suit";
import { Orientation, isHorizontal } from "../classes/Orientation";
import { Vector } from "../classes/Vector";
import { Point } from "../classes/Point";
import { getOffset } from '../utils/offset';
import { CardViewData } from './CardViewData';

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
}>(), {
  rotation: Orientation.Up,
  dummy: false,
  reverse: false,
});

const cardViews = inject('cardViews', ref(new Map<Card, CardViewData>()));

// Inject card dimensions from parent
const cardDimensions = inject('cardDimensions', { width: 100, height: 150 });
const debug = inject('debug', false);

const componentStyle = computed(() => {
  if (props.rotation === Orientation.Up || props.rotation === Orientation.Down) {
    return {
      height: cardDimensions.height + 'px',
      minHeight: cardDimensions.height + 'px',
      maxHeight: cardDimensions.height + 'px'
    };
  }
  return {
    width: cardDimensions.height + 'px',
    minWidth: cardDimensions.height + 'px',
    maxWidth: cardDimensions.height + 'px'
  };
});

const _offset = ref(Point.Origin);
const _width = ref(0);
const _height = ref(0);
const _debug_dummy = ref(false);

const update = (): void => {
    nextTick(() => {
      _offset.value = getStart();
      _width.value = getWidth();
      _height.value = getHeight();
      
      if (!props.hand) return;
      
      if (props.dummy) {
        updateDummy();
      } else {
        updateNonDummy();
      }
    });
};


// Computed properties for runtime-calculated defaults using injected dimensions
const effectiveMaximumCardOffset = computed(() => {
  return props.maximumCardOffset ?? cardDimensions.width / 4;
});

const effectiveDummySuitOffset = computed(() => {
  return props.dummySuitOffset ?? cardDimensions.width * 0.05;
});

const effectiveDummyCardOffset = computed(() => {
  return props.dummyCardOffset ?? cardDimensions.width / 4.5;
});

const root = useTemplateRef<HTMLDivElement>('root');

const getWidth = () => {
  return root.value?.clientWidth ?? 0;
};
const getHeight = () => {
  return root.value?.clientHeight ?? 0;
};


function getStart(): Point {
  if (!root.value) return Point.Origin;
  const c = getOffset(root.value);
  return new Point(c.left, c.top);
}

// Computed properties
const primaryDimension = computed((): "x" | "y" => {
  return isHorizontal(props.rotation) ? "x" : "y";
});

function getPrimaryDimensionSize(): number {
  return isHorizontal(props.rotation) ? getWidth() : getHeight();
}

// Helper methods
const make1DVector = (size: number, perpendicular = false): Vector => {
  return isHorizontal(props.rotation) === perpendicular 
    ? new Vector(0, size) 
    : new Vector(size, 0);
};

const getCardOffsetVector = (): Vector => {
  const remainingSpace = getPrimaryDimensionSize() - cardDimensions.width;
  let cardOffset = 0;
  if (props.hand && props.hand.cards.length > 1) {
    cardOffset = Math.min(remainingSpace / props.hand.cards.length, effectiveMaximumCardOffset.value);
  }
  return make1DVector(cardOffset);
};

const getCardsBySuit = (): Record<Suit, Array<Card>> => {
  if (!props.hand) return {} as Record<Suit, Card[]>;
  return props.hand.cards.reduce((groups, card) => {
    (groups[card.suit] ||= []).push(card);
    return groups;
  }, {} as Record<Suit, Card[]>);
};

const getHandSuits = (): Array<Suit> => {
  if (!props.hand) return new Array<Suit>();
  const suits = Object.keys(getCardsBySuit()).map((suit) => parseInt(suit)) as Suit[];
  return sortSuits(suits, props.prioritizedSuit);
};

// Update methods
const updateNonDummy = (): void => {
  const start = getStart();
  if (!props.hand || !start) return;


  const offsetVector = getCardOffsetVector();

  const primarySize = cardDimensions.width + offsetVector[primaryDimension.value] * (props.hand.cards.length - 1);


  const center = start.moveBy(make1DVector(getPrimaryDimensionSize() / 2));
  let currentPosition = center.moveBy(make1DVector(-primarySize / 2));

  const cards = [...props.hand.cards];
  const reverseZIndex = props.rotation === Orientation.Left;

  if (props.prioritizedSuit) {
    sortCardsByPrioritizedSuit(cards, props.prioritizedSuit);
  } else {
    sortCards(cards);
    // patch for Milan: West is sorted other way around
    if (props.position === Position.West) cards.reverse();
  }

  cards.forEach((card, index) => {
    const view = cardViews.value.get(card);
    if (!view) return;
    view.reverse = props.reverse;
    view.position = currentPosition;
    view.z = reverseZIndex ? cards.length - index : index;
    currentPosition = currentPosition.moveBy(offsetVector);
  });
};

const updateDummy = (): void => {

  const start = getStart();
  if (!props.hand || !start) return;

  const suits = getHandSuits();
  const suitCount = suits.length;
  const primarySize = (cardDimensions.width + effectiveDummySuitOffset.value) * suitCount - effectiveDummySuitOffset.value;

  const center = start.moveBy(make1DVector(getPrimaryDimensionSize() / 2));
  let currentPosition = center.moveBy(make1DVector(-primarySize / 2));

  const suitOffset = make1DVector(effectiveDummySuitOffset.value + cardDimensions.width);
  let c = effectiveDummyCardOffset.value;
  if (props.rotation == Orientation.Right || props.rotation == Orientation.Down) c *= -1;

  const cardOffset = make1DVector(c, true);
  const cardsBySuit = getCardsBySuit();

  for (const [suitIndex, suit] of suits.entries()) {
    let currentSuitPos = currentPosition.copy();
    let index = 0;
    for (const card of cardsBySuit[suit]) {
      const view = cardViews.value.get(card);
      if (!view) return;
      view.position = currentSuitPos;
      view.reverse = false;

      view.z = index + suitIndex * 10;
      currentSuitPos = currentSuitPos.moveBy(cardOffset);
      index++;
    }
    currentPosition = currentPosition.moveBy(suitOffset);
  }
};

let layoutObserver: ResizeObserver | null = null;

onMounted(() => {
  // Wait for initial layout
  requestAnimationFrame(() => {
    update();
    if (props.hand) {
      setupCardRotations(props.hand);
    }
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

// Setup card rotations when hand changes
const setupCardRotations = (hand: Hand) => {
  hand.cards.forEach((card) => {
    const view = cardViews.value.get(card);
    if (!view) return;
    view.rotation = props.rotation;
  });

  hand.cardAdded.sub((e: any) => {
    const view = cardViews.value.get(e.card);
    if (!view) return;
    view.rotation = props.rotation;
  });
};

// Watchers - automatically update when any relevant prop changes
watch(() => props.hand, (newHand) => {
  if (newHand) {
    setupCardRotations(newHand);
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

watch(() => cardViews, () => {
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