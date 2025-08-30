<template>
  <div ref="gameView" @click="update" :class="{ debug: debug }">
    <CardProvider :game="game">
      <div class="main-view" ref="mainView">
        <OneDimensionalHandView
          ref="handViewWest"
          :hand="game?.players[Position.West].hand"
          :position="Position.West"
          :rotation="Rotation.Left"
        ></OneDimensionalHandView>
        <div class="center-column">
          <OneDimensionalHandView
            ref="handViewNorth"
            :hand="game?.players[Position.North].hand"
            :position="Position.North"
            :rotation="Rotation.Top"
          ></OneDimensionalHandView>

          <BiddingCenterPanel
            class="bidding-center-panel"
            :auction-visible="auctionVisible"
          >
            <CenterNSEWFrame
              ref="centerFrame"
              :vulnerability="game?.vulnerability"
              class="center-frame"
            >
              <TrickView ref="trickView" class="trick-view"></TrickView>
            </CenterNSEWFrame>
          </BiddingCenterPanel>
          <OneDimensionalHandView
            ref="handViewSouth"
            :hand="game?.players[Position.South].hand"
            :position="Position.South"
            :rotation="Rotation.Top"
          ></OneDimensionalHandView>
        </div>

        <OneDimensionalHandView
          ref="handViewEast"
          :hand="game?.players[Position.East].hand"
          :position="Position.East"
          :rotation="Rotation.Right"
        ></OneDimensionalHandView>
        <DebugView></DebugView>
      </div>
      <BiddingBox
        v-show="game?.state === 'bidding'"
        @bid="biddingBoxCallback"
      ></BiddingBox>
    </CardProvider>
  </div>
</template>

<script setup lang="ts">
import { PresentationGame } from "@/bridge/model/PresentationGame";
import OneDimensionalHandView from "./OneDimensionalHandView.vue";
import { Position } from "@/bridge/model/Position";
import { Rotation } from "@/presenter/classes/Rotation";
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
} from "vue";
import TrickView from "./TrickView.vue";
import CardProvider from "./CardProvider.vue";
import DebugView from "./DebugView.vue";
import BiddingBox from "./BiddingBox.vue";
import BiddingCenterPanel from "./BiddingCenterPanel.vue";
import { Bid } from "@/bridge/model/Bid";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";

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
const auctionVisible = computed(() => {
  return gameRef.value?.state === "bidding";
});
provide("auctionVisible", auctionVisible);

watch(
  () => props.game,
  (gm) => {
    gm.cardPlayed.sub(() => {
      triggerRef(gameRef);
    });

    gm.trickEnded.sub(() => {
      triggerRef(gameRef);
    });

    gm.trickStarted.sub(() => {
      triggerRef(gameRef);
    });

    gm.biddingStarted.sub(() => {
      triggerRef(gameRef);
    });

    gm.cardplayStarted.sub(() => {
      triggerRef(gameRef);
    });

    gm.cardplayEnded.sub(() => {
      triggerRef(gameRef);
    });

    gm.gameStarted.sub(() => {
      triggerRef(gameRef);
    });

    gm.gameEnded.sub(() => {
      triggerRef(gameRef);
    });

    gm.stateChanged.sub(() => {
      triggerRef(gameRef);
    });

    gm.biddingEnded.sub(() => {
      triggerRef(gameRef);
    });

    gm.undoMade.sub(() => {
      triggerRef(gameRef);
    });
  }
);

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

      player.bidRequestCancelled.sub(() => {
        biddingBoxCallback.value = undefined;
      });

      player.bidMade.sub(() => {
        biddingBoxCallback.value = undefined;
      });
    });
  }
);

let resizeObserver: ResizeObserver | null = null;

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

const gameView = ref<HTMLDivElement>();
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
  handViewWest.value?.update?.();
  handViewNorth.value?.update?.();
  handViewSouth.value?.update?.();
  handViewEast.value?.update?.();
  trickView.value?.update?.();
}

const debug = ref(true);
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
