<template>
  <div 
    ref="element"
    class="card"
    :class="{ 
      'playable': data.playable && !data.dummy, 
      'playable-dummy': data.playable && data.dummy,
      'reverse': data.reverse,
      'hidden': data.hidden
    }"

    :style="cardStyle"
    @click="handleClick"
  >
    <img class="front" :src="frontImageSrc" />
    <img class="back" :src="backImageSrc" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef, watch } from 'vue';
import { Card, CardValue, CardValueHelper } from "../../bridge/model/Card";
import { SuitHelper } from "../../bridge/model/Suit";
import { Orientation } from "../classes/Orientation";
import { CardViewData } from './CardViewData';

// Props
const props = defineProps<{
  data: CardViewData;
  dimensions: { width: number; height: number };
}>();

const element = useTemplateRef<HTMLDivElement>('element');

// Static image loading (same as original)
const _images = import.meta.glob(['@/presenter/assets/cards/*.png'], { eager: true });

const getImagePath = (filename: string): string => {
  return (_images["/src/presenter/assets/cards/" + filename + ".png"] as any).default as string;
};

const getCardImageFilename = (card: Card): string => {
  if (card.value === CardValue.Other) return "O";
  const s = SuitHelper.toString(card.suit).charAt(0).toUpperCase();
  const v = card.value <= 9 && card.value >= 2 
    ? card.value.toString() 
    : CardValueHelper.toString(card.value).charAt(0).toUpperCase();
  return `${s}-${v}`;
};

// Computed properties
const frontImageSrc = computed(() => getImagePath(getCardImageFilename(props.data.card)));
const backImageSrc = computed(() => getImagePath("back"));

// Inject card dimensions from parent

// Rotation transforms (same as original)
const rotationTransforms = {
  [Orientation.Left]: "rotate(-90deg) translateX(-100%)",
  [Orientation.Right]: "rotate(90deg) translateY(-100%)",
  [Orientation.Down]: "rotate(180deg)",
  [Orientation.Up]: "",
};

const transform = computed(() => `${props.data.position.asTransform()} ${rotationTransforms[props.data.rotation]}`);

watch(transform, (newTransform) => {
  if (element.value) {
    element.value.style.transform = newTransform;
  }
});

// Computed style with position and rotation
const cardStyle = computed(() => ({
  width: `${props.dimensions.width}px`,
  height: `${props.dimensions.height}px`,
  zIndex: props.data.z
}));

// Click handler
const handleClick = () => {
  if (!props.data.reverse && props.data.playable) {
    props.data.onclick();
  }
};

</script>

<style scoped lang="scss">
@use "@/presenter/assets/style/variables" as variables;

.card {
  position: absolute;
  cursor: default;
  transition: transform .2s ease;
}

.card img {
  width: 100%;
  height: 100%;
  display: block;
}

/* Don't remove the card from the DOM, just hide it for animation in hide-unhide situations */
.card.hidden {
  visibility: collapse;
}

.card.hidden .back, .card.hidden .front {
  display: none;
}

.card .back {
  display: none;
}

.card.reverse .front {
  display: none;
}

.card.reverse .back {
  display: block;
}

.card.playable:not(.reverse) {
  cursor: pointer;
}

.card.playable-dummy:not(.reverse) {
  cursor: pointer;
}

.card.playable:hover {
  transform: scale(1.05);
  z-index: 1000;
}


.card {
    height: variables.$card-height;
    aspect-ratio: 530/800;
    display: inline-block;
    position: absolute;
    transition: transform ease 1s;
    top: 0;
    left: 0;
    transform-origin: 0 0;


    &.playable img,
    &.playable-dummy img {
        transition: ease-in-out 0.2s;
    }

    &.playable:hover:not(.reverse) img {
        transform: translateY(-10%);
    }

    &.playable-dummy:hover:not(.reverse) img {
        transform: translateX(-10%);
    }

    &:not(.reverse) img.front {
        z-index: 1;
        display: initial;
    }

    &.reverse img.back {
        z-index: 1;
        display: initial;
    }

    img {
        z-index: -1;
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        object-fit: fill;
    }
}

</style> 