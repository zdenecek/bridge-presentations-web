<template>
  <div ref="element">
    <div id="cards">
      <CardView v-for="card in cardViews.values()" :data="card" :key="card.card.toString()" :dimensions="cardDimensions"></CardView>
    </div>
    <slot :cardViews="cardViews" :cardDimensions="cardDimensions"></slot>
  </div>
</template>

<style scoped>
#cards {
  height: 0px;
  width: 0px;
}
</style>

<style lang="scss">
.debug {
  .card.playable {
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
  }

  .card.playable-dummy {
    box-shadow: 0 0 10px rgba(255, 255, 0, 0.7);
  }
}
</style>


<script setup lang="ts">
import CardView from './CardView.vue';
import { CardViewData } from './CardViewData';
import { Card } from '@/bridge/model/Card';
import { PresentationGame } from '@/bridge/model/PresentationGame';
import { PresentationPlayer } from '@/bridge/model/PresentationPlayer';
import { onMounted, onUnmounted, provide, reactive, ref, useTemplateRef, watch } from 'vue';


const props = defineProps<{
  game: PresentationGame;
}>();

const cardViews = ref<Map<Card, CardViewData>>(new Map<Card, CardViewData>());
// Reactive card dimensions - computed from CSS
const cardDimensions = reactive({
  width: 0,
  height: 0
});


const element = useTemplateRef<HTMLDivElement>('element');

// Provide card dimensions to child components
provide('cardDimensions', cardDimensions);
provide('cardViews', cardViews);

const updateCardDimensions = () => {
  if (!element.value) return;

  // Create a measuring element that uses the same CSS calculations
  const measureEl = document.createElement('div');
  measureEl.style.cssText = `
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    top: -9999px;
  `;

  // Apply the exact SCSS variable calculations
  // $card-height: calc((95vh - 2 * $padding - $margin - $top-space ) / 4.5);
  // $card-width: calc($card-height * 53 / 80);
  const cardHeight = 'calc((95vh - 2 * 10px - 10px - 6px) / 4.5)';
  const cardWidth = `calc((${cardHeight}) * 53 / 80)`;

  measureEl.style.height = cardHeight;
  measureEl.style.width = cardWidth;

  element.value.appendChild(measureEl);

  // Read computed dimensions
  const rect = measureEl.getBoundingClientRect();
  cardDimensions.width = rect.width;
  cardDimensions.height = rect.height;

  // Clean up
  element.value.removeChild(measureEl);
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  // Initial dimension calculation
  updateCardDimensions();


  // Update on window resize
  window.addEventListener('resize', updateCardDimensions);

  // Use ResizeObserver for responsive updates
  resizeObserver = new ResizeObserver(() => {
    updateCardDimensions();
  });

  if (element.value) {
    resizeObserver.observe(element.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateCardDimensions);
  resizeObserver?.disconnect();
});

// Only watch for game reference changes, not internal game state changes
watch(() => props.game, (game) => {

  cardViews.value = makeCards(game);
}, { flush: 'pre' });


function getCardView(card: Card): CardViewData {
  const cardView = cardViews.value.get(card);
  if (!cardView) {
    throw new Error("CardView not found for card: " + card.toString());
  }
  return cardView;
}

function makeCards(game?: PresentationGame): Map<Card, CardViewData> {
  const cardViews = new Map<Card, CardViewData>()
  if (!game) return cardViews;

  const trick_cards = game.tricks.flatMap((trick) => trick.cards);
  trick_cards.forEach(({ card }) => {
    cardViews.set(card, new CardViewData(card));
  });

  game.allPlayers.forEach((player) => {
    player.hand?.cards.forEach((card) => {
      cardViews.set(card, new CardViewData(card));
    });
  });


  game.allPlayers.forEach((player) => {

    player.cardPlayed.sub((e) => {
      e.player.hand.cards.forEach((card) => {
        const cardView = getCardView(card);
        cardView.playable = false;
        cardView.onclick = () => { };
      });
      const cardView = getCardView(e.card);
      cardView.playable = false;
      cardView.onclick = () => { };
    });

    player.playRequestCancelled.sub((e) => {
      e.player.hand.cards.forEach((card) => getCardView(card).playable = false);
    });

    player.playRequested.sub((e) => {
      let playables = e.player.hand.cards;
      if (e.trick.cards.length > 0) playables = playables.filter((c) => c.suit == e.trick.cards[0]?.card.suit);
      if (playables.length == 0) playables = e.player.hand.cards;

      playables.forEach((card) => {
        const cardView = getCardView(card);
        cardView.playable = true;
        cardView.dummy = game.finalContract !== "passed" && game.finalContract?.declarer === player.position;
        cardView.onclick = () => (player as PresentationPlayer).playCard(card);
      });
    });
  });

  return cardViews;
}


</script>