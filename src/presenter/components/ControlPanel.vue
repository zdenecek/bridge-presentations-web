<template>
  <div class="control-panel" v-show="isVisible">
    <div class="buttons">
      <button
        v-for="(button, index) in buttons"
        :key="index"
        :class="button.classes"
        :disabled="button.disabled"
        :hidden="button.hidden"
        @click="handleClick(index)"
      >
        <div class="content-label">{{ button.content }}</div>
        <div class="hotkey-label">({{ hotkeys[index] }})</div>
      </button>
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
import { SuitHelper } from '@/bridge/model/Suit';
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

const hotkeys = "0123456789/*-";

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

// Update button states when player changes
const updateButtonStates = (player: PresentationPlayer) => {
  const cards = player.hand.cardsWithPlayInfo;
  
  buttons.value.forEach((button, index) => {
    if (index >= cards.length) {
      button.hidden = true;
      return;
    }

    const card = cards[index];
    button.content = card.card.toShortString();
    button.classes = [SuitHelper.toString(card.card.suit).toLowerCase()];
    button.disabled = card.played;
    button.hidden = false;
  });
};

// Watch for game changes
watch(() => props.game, (newGame) => {
  if (!newGame) return;

  // Set up player event listeners
  Object.values(newGame.players).forEach((player) => {
    player.playRequested.sub((e) => {
      if (e.player instanceof PresentationPlayer) {
        currentPlayer.value = e.player;
        // Show control panel (handled by parent)
      } else {
        currentPlayer.value = undefined;
      }
    });
  });

}, { immediate: true });

// Watch for player changes
watch(currentPlayer, (newPlayer) => {
  if (newPlayer) {
    updateButtonStates(newPlayer);
  } else {
    // Reset all buttons when no player
    buttons.value.forEach(button => {
      button.content = '';
      button.classes = [];
      button.disabled = false;
      button.hidden = true;
    });
  }
});

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


.control-panel {
  display: flex;
  flex-direction: column;

  .buttons {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  button:disabled {
    color: gray;
    background-color: white;
  }

  .hearts {
    color: red;
  }

  .diamonds {
    color: darkgoldenrod;
  }

  .spades {
    color: blue;
  }

  .clubs {
    color: green;
  }
}


.claim-input {
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
  }
  width: 100%;

  &[type="number"] {
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield;
  }
}
</style>
