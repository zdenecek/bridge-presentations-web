<template>
  <div ref="gameView" @click="update" :class="{ debug: debug }">
    <CardProvider :game="game">
      <div class="main-view" ref="mainView">
        <OneDimensionalHandView ref="handViewWest" :hand="game?.players[Position.West].hand" :position="Position.West"
          :rotation="Orientation.Left" :dummy="dummy === Position.West"></OneDimensionalHandView>
        <div class="center-column">
          <OneDimensionalHandView ref="handViewNorth" :hand="game?.players[Position.North].hand"
            :position="Position.North" :rotation="Orientation.Up" :dummy="dummy === Position.North"></OneDimensionalHandView>

          <BiddingCenterPanel class="bidding-center-panel" :auction-visible="auctionVisible">
            <CenterNSEWFrame ref="centerFrame" :vulnerability="game?.vulnerability" class="center-frame">
              <TrickView ref="trickView" class="trick-view"></TrickView>
            </CenterNSEWFrame>
          </BiddingCenterPanel>
          <OneDimensionalHandView ref="handViewSouth" :hand="game?.players[Position.South].hand"
            :position="Position.South" :rotation="Orientation.Up" :dummy="dummy === Position.South"></OneDimensionalHandView>
        </div>

        <OneDimensionalHandView ref="handViewEast" :hand="game?.players[Position.East].hand" :position="Position.East"
          :rotation="Orientation.Right" :dummy="dummy === Position.East"></OneDimensionalHandView>
        <DebugView v-if="debug"></DebugView>
      </div>
      <BiddingBox v-show="game?.state === 'bidding'" @bid="biddingBoxCallback"></BiddingBox>
    </CardProvider>
  </div>
</template>

<script setup lang="ts">
import { PresentationGame } from "@/bridge/model/PresentationGame";
import OneDimensionalHandView from "./OneDimensionalHandView.vue";
import { Position, PositionHelper } from "@/bridge/model/Position";
import { Orientation } from "@/presenter/classes/Orientation";
import CenterNSEWFrame from "./CenterNSEWFrame.vue";
import {
  onMounted,
  ref,
  useTemplateRef,
  watch,
  provide,
  triggerRef,
  onUnmounted,
  computed,
  nextTick,
} from "vue";
import TrickView from "./TrickView.vue";
import CardProvider from "./CardProvider.vue";
import DebugView from "./DebugView.vue";
import BiddingBox from "./BiddingBox.vue";
import BiddingCenterPanel from "./BiddingCenterPanel.vue";
import { Bid } from "@/bridge/model/Bid";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";

/**
 * GAME 
 * Wire game events to Vue reactive system
 */

const props = defineProps<{
  game: PresentationGame;
}>();

const gameRef = ref(props.game);
watch(
  () => props.game,
  (newGame) => {
    console.log("gameRef", newGame);
    gameRef.value = newGame;
  }
);

provide("game", gameRef);

watch(
  () => props.game,
  (gm) => {
    [
      gm.cardPlayed,
      gm.trickEnded,
      gm.trickStarted,
      gm.biddingStarted,
      gm.cardplayStarted,
      gm.cardplayEnded,
      gm.gameStarted,
      gm.gameEnded,
      gm.stateChanged,
      gm.biddingEnded,
      gm.undoMade,
    ].forEach(ev => ev.sub(() => {
      triggerRef(gameRef)
    }));
  }
);

/** 
 * BIDDING BOX
 */

const biddingBoxCallback = ref<((bid: Bid) => void) | undefined>(undefined);
watch(
  () => props.game,
  (game) => {
    // wire bidding box
    if (!game) return;

    game.allPlayers.forEach((player) => {
      player.bidRequested.sub(() => {
        biddingBoxCallback.value = (bid) =>
          (player as PresentationPlayer).bid(bid);
      });

      player.bidRequestCancelled.sub(() => 
        biddingBoxCallback.value = undefined
      );

      player.bidMade.sub(() => 
        biddingBoxCallback.value = undefined
      );
    });
  }
);

/**
 * RESIZE OBSERVER
 */
let resizeObserver: ResizeObserver | null = null;
const gameView = ref<HTMLDivElement>();

onMounted(() => {
  // Update on window resize
  window.addEventListener("resize", update);

  // Use ResizeObserver for responsive updates
  resizeObserver = new ResizeObserver(() => {
    update();
  });

  if (gameView.value) {
    resizeObserver.observe(gameView.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", update);
  resizeObserver?.disconnect();
});

/**
 * MANUAL UI UPDATE
 */
const trickView = useTemplateRef<typeof TrickView>("trickView");
const centerFrame = useTemplateRef<typeof CenterNSEWFrame>("centerFrame");
const handViewWest =
  useTemplateRef<typeof OneDimensionalHandView>("handViewWest");
const handViewNorth =
  useTemplateRef<typeof OneDimensionalHandView>("handViewNorth");
const handViewSouth =
  useTemplateRef<typeof OneDimensionalHandView>("handViewSouth");
const handViewEast =
  useTemplateRef<typeof OneDimensionalHandView>("handViewEast");

function update() {
  console.log("update");
  handViewWest.value?.update?.();
  handViewNorth.value?.update?.();
  handViewSouth.value?.update?.();
  handViewEast.value?.update?.();
  trickView.value?.update?.();
}

window.addEventListener("keydown", () => {setTimeout(() => {update()}, 10)});

/** 
 * AUCTION VISIBILITY
 * After the bidding ends, wait for the user to click the screen to continue to the card play
 */
const auctionVisible = computed(() => {
  return gameRef.value?.state === "bidding" || waitForClick.value;
});

const waitForClick = ref(false);
watch(gameRef, (game) => {
  game.biddingEnded.sub(() => {
    console.log("bidding ended");
    waitForClick.value = true;
  });
  game.cardPlayed.sub(() => {
    waitForClick.value = false;
  });
});

function handleClick() {
  waitForClick.value = false;
}
onMounted(() => {
  window.addEventListener("click", handleClick);
});
onUnmounted(() => {
  window.removeEventListener("click", handleClick);
});

provide("auctionVisible", auctionVisible);

/**
 * DUMMY LOGIC
 */

const dummy = computed(() => {
  if (gameRef.value?.options.dummy === "auto") {
    if (auctionVisible.value) return undefined;
    if (gameRef.value.auction?.finalContract == "passed") return undefined;
    const declarer = gameRef.value.auction?.finalContract?.declarer;
    if (declarer) return PositionHelper.nextPosition(declarer, 2);
  }
  else if (gameRef.value?.options.dummy === "static" && gameRef.value?.options.staticDummyPosition) {
    return gameRef.value?.options.staticDummyPosition;
  }
  else if (gameRef.value?.options.dummy === "none") {
    return undefined;
  }
  else {
    console.warn("Unknown dummy option", gameRef.value?.options.dummy);
    return undefined;
  }
});

/**
 * DEBUG
 */

const debug = ref(false);
provide("debug", debug);
</script>

<style lang="scss">
@use "../assets/style/variables" as variables;

.main-view {
  padding: variables.$margin;
  padding-top: variables.$top-space;
  max-height: 100vh;
  aspect-ratio: 1;
  background-color: black;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;

  .center-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .bidding-center-panel {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .trick-view {
    width: 100%;
    aspect-ratio: 1;
  }

  .center-frame {
    min-height: 0;
    aspect-ratio: 1;
    display: grid;
    overflow: hidden;
  }
}

.debug {
  .hand-north {
    background-color: lightblue;
  }

  .hand-east {
    background-color: lightgoldenrodyellow;
  }

  .hand-south {
    background-color: lightgreen;
  }

  .hand-west {
    background-color: lightpink;
  }
}
</style>
