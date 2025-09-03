<template>
  <div class="control-panel" v-show="isVisible">
    <div class="buttons">
      <div 
        v-for="(suitCards, suit) in cardsBySuit" 
        :key="suit"
        class="suit-row"
        :class="{
          [`suit-${suit.toLowerCase()}`]: true,
          'suit-disabled': currentSuitName && currentSuitName !== suit
        }"
      
      >
        <button
          v-for="(cardInfo, index) in suitCards"
          :key="`${suit}-${index}`"
          :class="[suit.toLowerCase(), { disabled: cardInfo.played }]"
          :disabled="cardInfo.played"
          @click="handleCardClick(cardInfo.originalIndex)"
        >
          <div class="content-label">{{ cardInfo.card.toShortString() }}</div>
          <div class="hotkey-label">({{ hotkeys[cardInfo.originalIndex] }})</div>
        </button>
      </div>
    </div>

    <form class="claim-panel" @submit="handleClaimSubmit">
      <input
        ref="claimInput"
        class="claim-input"
        type="number"
        placeholder="claim (claimed tricks NS)"
        v-model="claimValue"
      />
      <input
        type="checkbox"
        style="filter: opacity(0); width: 0px;"
        ref="defocuser"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Game } from '@/bridge/model/Game';
import { PresentationPlayer } from '@/bridge/model/PresentationPlayer';
import { Suit, SuitHelper } from '@/bridge/model/Suit';
;

interface Props {
  game?: Game;
}

const props = withDefaults(defineProps<Props>(), {
  game: undefined
});

// Reactive state
const buttons = ref<Array<{
  content: string;
  classes: string[];
  disabled: boolean;
  hidden: boolean;
}>>([]);

const claimValue = ref('');
const claimInput = ref<HTMLInputElement>();
const defocuser = ref<HTMLInputElement>();
const currentPlayer = ref<PresentationPlayer>();
const currentSuitName = ref<string | undefined>(undefined);

const hotkeys = "0123456789/*-";

// Computed property to group cards by suit
const cardsBySuit = computed(() => {
  if (!currentPlayer.value) return {};
  
  const cards = currentPlayer.value.hand.cardsWithPlayInfo;
  const suitGroups: Record<string, Array<{card: any, played: boolean, originalIndex: number}>> = {
    [SuitHelper.toString(Suit.Spades)]: [],
    [SuitHelper.toString(Suit.Hearts)]: [],
    [SuitHelper.toString(Suit.Diamonds)]: [],
    [SuitHelper.toString(Suit.Clubs)]: [],
  };
  
  cards.forEach((cardInfo, index) => {
    const suitName = SuitHelper.toString(cardInfo.card.suit);
    suitGroups[suitName].push({
      card: cardInfo.card,
      played: cardInfo.played,
      originalIndex: index
    });
  });
  
  // Sort cards within each suit by value (highest first)
  Object.keys(suitGroups).forEach(suit => {
    suitGroups[suit].sort((a, b) => b.card.value - a.card.value);
  });
  
  return suitGroups;
});

// Computed properties
const isVisible = computed(() => {
  if (!props.game) return false;
  return props.game.state === 'cardplay';
});

// Initialize buttons
const initializeButtons = () => {
  buttons.value = Array.from({ length: 13 }, () => ({
    content: '',
    classes: [],
    disabled: false,
    hidden: true
  }));
};

// Event handlers
const handleClick = (index: number) => {
  if (!currentPlayer.value) return;

  const cards = currentPlayer.value.hand.cardsWithPlayInfo;
  if (cards.length > index && cards[index].played === false) {
    if (currentPlayer.value.playCard(cards[index].card)) {
      currentPlayer.value = undefined;
    }
  }
};

const handleCardClick = (originalIndex: number) => {
  handleClick(originalIndex);
};

const handleClaimSubmit = (e: Event) => {
  e.preventDefault();
  if (claimValue.value && props.game) {
    props.game.claim(parseInt(claimValue.value));
    claimValue.value = '';
    defocuser.value?.focus();
  }
};

// Keyboard event handler
const handleKeydown = (e: KeyboardEvent) => {

  if (claimInput.value?.matches(':focus')) {
    if (e.key.toLowerCase() === 'c') {
      handleClaimSubmit(e);
      e.preventDefault();
    }
    return;
  }

  // Handle hotkey buttons
  for (let i = 0; i < 13; i++) {
    if (e.key === hotkeys[i]) {
      handleClick(i);
      return;
    }
  }

  // Focus claim input with 'c' key
  if (e.key.toLowerCase() === 'c') {
    claimInput.value?.focus();
    e.preventDefault();
    claimValue.value = '';
  }
};

// Watch for game changes
watch(() => props.game, (newGame) => {
  if (!newGame) return;

  // Set up player event listeners
  Object.values(newGame.players).forEach((player) => {
    player.playRequested.sub((e) => {
      if (e.player instanceof PresentationPlayer) {
        currentPlayer.value = e.player;

        if (e.trick.suit && e.player.hand.cardsWithSuit(e.trick.suit).length > 0) {
          currentSuitName.value = SuitHelper.toString(e.trick.cards[0].card.suit);
        } else {
          currentSuitName.value = undefined;
        }
      } else {
        currentPlayer.value = undefined;
      }
    });
  });

}, { immediate: true });

// Lifecycle
onMounted(() => {
  initializeButtons();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped lang="scss">
@use '../assets/style/_variables.scss' as variables;

.control-panel {
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: 240px;

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .suit-row {
    display: flex;
    gap: 1px;
    padding: 1px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;

    &.suit-spades {
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.suit-hearts {
      border-color: rgba(248, 113, 113, 0.3);
      background: rgba(248, 113, 113, 0.05);
    }

    &.suit-diamonds {
      border-color: rgba(251, 146, 60, 0.3);
      background: rgba(251, 146, 60, 0.05);
    }

    &.suit-clubs {
      border-color: rgba(96, 165, 250, 0.3);
      background: rgba(96, 165, 250, 0.05);
    }

    &.suit-disabled {
      opacity: 0.3;
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.05);
      pointer-events: none;

      button {
        cursor: not-allowed;
      }
    }
  }

  button {
    padding: 2px 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 1.8rem;
    height: 1.3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.02);
      cursor: not-allowed;
      opacity: 0.2;
      border-color: rgba(255, 255, 255, 0.05);
    }

    .content-label {
      font-weight: 600;
    }

    .hotkey-label {
      font-size: 0.5rem;
      opacity: 0.7;
    }

    &:disabled .hotkey-label {
      opacity: 0.3;
    }
  }

  .hearts {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.4);

    &:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.1);
      border-color: rgba(248, 113, 113, 0.6);
    }
  }

  .diamonds {
    color: #fb923c;
    border-color: rgba(251, 146, 60, 0.4);

    &:hover:not(:disabled) {
      background: rgba(251, 146, 60, 0.1);
      border-color: rgba(251, 146, 60, 0.6);
    }
  }

  .spades {
    color: white;
    border-color: rgba(255, 255, 255, 0.3);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

  .clubs {
    color: #60a5fa;
    border-color: rgba(96, 165, 250, 0.4);

    &:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.1);
      border-color: rgba(96, 165, 250, 0.6);
    }
  }
}


.claim-input {
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
  }
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: variables.$primary;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &[type="number"] {
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield;
  }
}
</style>
