import { PresentationGame } from '@/bridge/model/PresentationGame';
import { customRef } from 'vue';

export function useGameRef(value: PresentationGame) {

  return customRef((track: () => void, trigger: () => void) => {
    let unsubscribers = [] as (() => void)[];
    return {
      get() {
        track();
        return value;
      },
      set(newGame: PresentationGame) {
        unsubscribers.forEach(unsubscriber => unsubscriber());
        value = newGame;
        unsubscribers = [
          newGame.cardPlayed,
          newGame.trickEnded,
          newGame.trickStarted,
          newGame.biddingStarted,
          newGame.cardplayStarted,
          newGame.cardplayEnded,
          newGame.gameStarted,
          newGame.gameEnded,
          newGame.stateChanged,
          newGame.biddingEnded,
          newGame.undoMade,
        ].map(ev => ev.sub(() => {
          trigger();
        }));
        trigger();
      }
    };
  });
}
