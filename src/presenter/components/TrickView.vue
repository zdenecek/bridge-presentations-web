<template>
  <div class="trick-view" ref="element">
    <span class="absolute" v-show="debug">{{ trick }}</span>
    <div v-for="position in PositionHelper.all()" :key="position"
      :class="`trick-view-origin trick-view-origin-${position}`" :ref="el => setOriginRef(position, el)">
      <div>
        <span class="absolute" v-show="debug">{{ cardsByPosition?.[position]?.card.toString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick, inject, shallowRef, triggerRef, computed, useTemplateRef, onMounted, onUnmounted } from 'vue';
import { CardViewData } from "./CardViewData";
import { CardInTrick, Trick } from "../../bridge/model/Trick";
import { Card } from "../../bridge/model/Card";
import { Position, PositionHelper } from "../../bridge/model/Position";
import { Point } from "../model/Point";
import { getOffset } from '../utils/offset';
import { PresentationGame } from '../../bridge/model/PresentationGame';
import { debounce } from 'lodash';


const trick = shallowRef<Trick | undefined>(undefined);
const element = useTemplateRef<HTMLDivElement>('element');

const props = defineProps<{
  game?: PresentationGame;
  cardViews: Map<Card, CardViewData>;
}>();
const debug = inject('debug', false);

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {

  const debouncedUpdate = debounce(() => {
    console.log('ResizeObserver update');
    update();
  }, 50);

  resizeObserver = new ResizeObserver(() => {
    console.log('resizeObserver');
    debouncedUpdate();
  });

  if (element.value) {
    resizeObserver.observe(element.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

// Update method for external calls
const update = () => {
  trick.value = props.game?.currentTrick;
  triggerRef(trick);
  nextTick(() => {
    if (trick.value) {
      positionTrick(trick.value);
    }
  });
};


watch(() => props.game, (newGame) => {

  newGame?.cardPlayed.sub(update);
  newGame?.trickCountChanged.sub(update);

}, { immediate: true, deep: false });


const originElements = ref<Map<Position, HTMLElement>>(new Map());

// Method to set origin element refs
const setOriginRef = (position: Position, el: any) => {
  if (el && el instanceof HTMLElement) {
    originElements.value.set(position, el.firstElementChild as HTMLElement);
  }
};

const cardsByPosition = computed(() => {
  if (!trick.value) return {} as Record<Position, CardInTrick>;
  return getCardsByPosition(trick.value);
});

function getCardsByPosition(trick: Trick): Record<Position, CardInTrick> {
  return trick.cards.reduce((acc, card) => {
    acc[card.player] = card;
    return acc;
  }, {} as Record<Position, CardInTrick>);
}

// Position cards in the trick
const positionTrick = (trick: Trick) => {
  if (!trick) return;

  trick.cards.forEach(({ card }, index) => {
    const view = props.cardViews.get(card);
    if (!view) return;

    // view.reverse = false;
    view.hidden = false;
    view.z = index + 100;
  });


  const cardsByPosition = getCardsByPosition(trick);
  // Position cards at their respective positions
  PositionHelper.all().forEach((pos) => {
    const cardInTrick = cardsByPosition[pos];
    if (!cardInTrick) return;

    const view = props.cardViews.get(cardInTrick.card);
    if (!view) return;

    const originEl = originElements.value.get(pos);
    if (!originEl) {
      console.warn(`Origin element missing for position ${pos} in trick view!`);
      return;
    }

    // Get the position from the origin element
    const offset = getOffset(originEl);
    view.position = new Point(offset.left, offset.top);
  });
};

// Detach current trick (hide all cards)
const detachTrick = (trick: Trick) => {
  if (!trick) return;

  trick.cards.forEach((c) => {
    const v = props.cardViews.get(c.card);
    if (v) v.hidden = true;
  });
};


// Watch for trick changes
watch(() => trick.value, (newTrick, oldTrick) => {
  // Detach old trick
  if (oldTrick) {
    detachTrick(oldTrick);
  }

  // Attach new trick
  if (newTrick) {
    nextTick(() => {
      positionTrick(newTrick);
    });
  }
}, { immediate: true, deep: true });


// Expose update method
defineExpose({
  update,
});
</script>

<style scoped lang="scss">
@use '../assets/style/variables' as variables;

.trick-view {
  aspect-ratio: 1;
  position: relative;
}

.trick-view-origin {
  position: absolute;
}

.trick-view-origin-north {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.trick-view-origin-south {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.trick-view-origin-east {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.trick-view-origin-west {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}



.trick-view {
  position: relative;
}

.trick-view-origin {
  position: absolute;
}

.trick-view-origin-north {
  width: 100%;

  div {
    margin: 0 auto;
    height: variables.$card-height;
    width: variables.$card-width;
  }
}

.trick-view-origin-east {
  height: 100%;
  right: 0;
  display: flex;
  align-items: center;

  div {
    width: variables.$card-height;
    height: variables.$card-width;
  }
}

.trick-view-origin-south {
  width: 100%;
  bottom: 0;

  div {
    margin: 0 auto;
    height: variables.$card-height;
    width: variables.$card-width;
  }
}

.trick-view-origin-west {
  height: 100%;
  display: flex;
  align-items: center;

  div {
    width: variables.$card-height;
    height: variables.$card-width;
  }
}

.debug {

  .trick-view-origin-north div {
    background-color: lightblue;
  }

  .trick-view-origin-east div {
    background-color: lightgoldenrodyellow;
  }

  .trick-view-origin-south div {
    background-color: lightgreen;
  }

  .trick-view-origin-west div {
    background-color: lightpink;
  }
}

.absolute {
  position: absolute;
}
</style>