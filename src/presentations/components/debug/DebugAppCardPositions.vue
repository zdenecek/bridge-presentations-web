<template>
  <div>
    <h1>Debug App</h1>
    <card-provider :cards="cards" ref="cardProvider">

    </card-provider>
   
    <div>
      <label>
        <input type="checkbox" v-model="followCursor" />
        Follow cursor
      </label>
    </div>
    
    <div v-if="!followCursor">
      <input type="number" v-model="card1CoordinatesX" />
      <input type="number" v-model="card1CoordinatesY" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card } from '@/bridge/model/Card';
import { Suit } from '@/bridge/model/Suit';
import CardProvider from '@/presenter/components/CardProvider.vue';
import { Point } from '@/presenter/model/Point';
import { ref, useTemplateRef, watch, onMounted, onUnmounted } from 'vue';

const card1CoordinatesX = ref<number>(0);
const card1CoordinatesY = ref<number>(0);
const followCursor = ref<boolean>(false);

const cardProvider = useTemplateRef<InstanceType<typeof CardProvider>>('cardProvider');

const card1 = ref<Card>(new Card(Suit.Clubs, 2));
const cards = ref<Set<Card>>(new Set([
  card1.value,
]));

const updateCardPosition = (x: number, y: number) => {
  const card1View = cardProvider.value?.cardViews.get(card1.value);
  if (card1View) {
    card1View.position = new Point(x, y);
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (followCursor.value) {
    updateCardPosition(event.clientX, event.clientY);
  }
};

watch(() => [card1CoordinatesX.value, card1CoordinatesY.value], ([x, y]) => {
  if (!followCursor.value) {
    updateCardPosition(x, y);
  }
});

watch(followCursor, (isFollowing) => {
  if (isFollowing) {
    document.addEventListener('mousemove', handleMouseMove);
  } else {
    document.removeEventListener('mousemove', handleMouseMove);
  }
});

onMounted(() => {
  if (followCursor.value) {
    document.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
});

</script>