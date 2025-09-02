import { PresentationGame } from "@/bridge/model/PresentationGame";
import { triggerRef, watch, ref, Ref } from "vue";

export function useGameRef(value: PresentationGame): Ref<PresentationGame> {
  const gameRef = ref(value) as Ref<PresentationGame>;
  let unsubscribers: (() => void)[] = [];

  const setupGameListeners = (game: PresentationGame) => {
    // Clean up previous listeners
    unsubscribers.forEach((unsubscriber) => unsubscriber());
    unsubscribers = [];

    // Set up new listeners
    unsubscribers = [
      game.cardPlayed,
      game.trickEnded,
      game.trickStarted,
      game.biddingStarted,
      game.bidMade,
      game.cardplayStarted,
      game.cardplayEnded,
      game.gameStarted,
      game.gameEnded,
      game.stateChanged,
      game.biddingEnded,
      game.undoMade,
    ].map((ev) =>
      ev.sub(() => {
        triggerRef(gameRef);
      }),
    );
  };

  // Set up listeners for initial game
  setupGameListeners(value);

  watch(
    gameRef,
    (newGame, oldGame) => {
      if (oldGame === newGame) return;
      setupGameListeners(newGame as PresentationGame);
    },
    { immediate: false, deep: false },
  );

  return gameRef;
}
