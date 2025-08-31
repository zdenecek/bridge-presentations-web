<template>
  <div class="trick-view">
    <span class="absolute" v-show="debug">{{ trick }}</span>
    <div v-for="position in PositionHelper.all()" :key="position"
      :class="`trick-view-origin trick-view-origin-${position}`" :ref="el => setOriginRef(position, el)">
      <div>
        <span class="absolute" v-show="debug">{{ trick?.getCardByPosition(position)?.card.toString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick, inject, shallowRef, triggerRef } from 'vue';
import { CardViewData } from "./CardViewData";
import { Trick } from "../../bridge/model/Trick";
import { Card } from "../../bridge/model/Card";
import { Position, PositionHelper } from "../../bridge/model/Position";
import { Point } from "../classes/Point";
import { getOffset } from '../utils/offset';
import { PresentationGame } from '../../bridge/model/PresentationGame';


const cardViews = inject('cardViews', ref(new Map<Card, CardViewData>()));
const trick = shallowRef<Trick | undefined>(undefined);
const props = defineProps<{
  game?: PresentationGame;
}>();
const debug = inject('debug', false);

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

// Position cards in the trick
const positionTrick = (trick: Trick) => {
  if (!trick) return;

  trick.cards.forEach(({ card }, index) => {
    const view = cardViews.value.get(card);
    if (!view) return;

    // view.reverse = false;
    view.hidden = false;
    view.z = index + 100;
  });

  // Position cards at their respective positions
  PositionHelper.all().forEach((pos) => {
    const cardInTrick = trick.getCardByPosition(pos);
    if (!cardInTrick) return;

    const view = cardViews.value.get(cardInTrick.card);
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
    const v = cardViews.value.get(c.card);
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