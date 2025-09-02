<template>
  <div ref="gameView" @click="update" :class="{ debug: debug }">
    <CardProvider :game="game" v-slot="{ cardViews, cardDimensions }">
      <div class="main-view" ref="mainView">
        <OneDimensionalHandView ref="handViewWest" :hand="game?.players[Position.West].hand" :position="Position.West"
          :rotation="Orientation.Left" :dummy="dummy === Position.West"
          :cardViews="cardViews" :cardDimensions="cardDimensions"
          :reverse="!handsVisible.get(Position.West)"></OneDimensionalHandView>
        <div class="center-column">
          <OneDimensionalHandView ref="handViewNorth" :hand="game?.players[Position.North].hand"
            :position="Position.North" :rotation="Orientation.Up" :dummy="dummy === Position.North"
            :cardViews="cardViews" :cardDimensions="cardDimensions"
            :reverse="!handsVisible.get(Position.North)"></OneDimensionalHandView>

          <BiddingCenterPanel class="bidding-center-panel" :auction-visible="auctionVisible" :game="game">
            <CenterNSEWFrame  :vulnerability="game?.vulnerability" :game="game" class="center-frame">
              <TrickView ref="trickView" v-show="!showEndText" :game="game" class="trick-view" :cardViews="cardViews"></TrickView>
              <div class="end-text" v-show="showEndText">End of game {{ waitBeforeShowingEndText.waiting }}</div>
            </CenterNSEWFrame>
          </BiddingCenterPanel>
          <OneDimensionalHandView ref="handViewSouth" :hand="game?.players[Position.South].hand"
            :position="Position.South" :rotation="Orientation.Up" :dummy="dummy === Position.South"
            :cardViews="cardViews" :cardDimensions="cardDimensions"
            :reverse="!handsVisible.get(Position.South)"></OneDimensionalHandView>
        </div>

        <OneDimensionalHandView ref="handViewEast" :hand="game?.players[Position.East].hand" :position="Position.East"
          :rotation="Orientation.Right" :dummy="dummy === Position.East"
          :cardViews="cardViews" :cardDimensions="cardDimensions"
          :reverse="!handsVisible.get(Position.East)"></OneDimensionalHandView>
        <DebugView v-if="debug" :game="game" :cardViews="cardViews"></DebugView>
      </div>
      <BiddingBox v-show="game?.state === 'bidding'" @bid="biddingBoxCallback"></BiddingBox>
    </CardProvider>
  </div>
</template>

<script setup lang="ts">
import { PresentationGame } from "@/bridge/model/PresentationGame";
import OneDimensionalHandView from "./OneDimensionalHandView.vue";
import { Position, PositionHelper } from "@/bridge/model/Position";
import { Orientation } from "@/presenter/model/Orientation";
import CenterNSEWFrame from "./CenterNSEWFrame.vue";
import {
  onMounted,
  ref,
  useTemplateRef,
  watch,
  onUnmounted,
  computed,
  inject,
} from "vue";
import TrickView from "./TrickView.vue";
import CardProvider from "./CardProvider.vue";
import DebugView from "./DebugView.vue";
import BiddingBox from "./BiddingBox.vue";
import BiddingCenterPanel from "./BiddingCenterPanel.vue";
import { Bid } from "@/bridge/model/Bid";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import { useWaitForClick } from "../composables/usewaitForClick";

const props = defineProps<{
  game: PresentationGame;
  handsVisible: Map<Position, boolean>;
}>();

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

window.addEventListener("keydown", () => {setTimeout(() => {update()}, 10)});

watch(() => props.game, (game) => {
  game.cardPlayed.sub(() => {
    update();
  });
  game.undoMade.sub(() => {
    update();
  });
}, { deep: false, immediate: true});

/** 
 * AUCTION VISIBILITY
 * After the bidding ends, wait for the user to click the screen to continue to the card play
 */
const auctionVisible = computed(() => {
  return props.game?.state === "bidding" || waitBeforeHidingAuction.waiting.value;
});

const waitBeforeHidingAuction = useWaitForClick();
watch( () => props.game, (game) => {
  game.biddingEnded.sub(() => {
    waitBeforeHidingAuction.set();
  });
  game.cardPlayed.sub(() => {
    waitBeforeHidingAuction.reset();
  });
}, { deep: false, immediate: true});

/**
 * END TEXT VISIBILITY
 */

const waitBeforeShowingEndText = useWaitForClick();

const showEndText = computed(() => 
  props.game?.state === "finished" && !waitBeforeShowingEndText.waiting.value
);

watch(() => props.game, (game) => {
  game.stateChanged.sub(() => {
    waitBeforeShowingEndText.set();
  });
}, { deep: false, immediate: true});


/**
 * DUMMY LOGIC
 */

const dummy = computed(() => {
  if (props.game?.options.dummy === "auto") {
    if (auctionVisible.value) return undefined;
    if (props.game.auction?.finalContract == "passed") return undefined;
    const declarer = props.game.auction?.finalContract?.declarer;
    if (declarer) return PositionHelper.nextPosition(declarer, 2);
  }
  else if (props.game?.options.dummy === "static" && props.game?.options.staticDummyPosition) {
    return props.game?.options.staticDummyPosition;
  }
  else if (props.game?.options.dummy === "none") {
    return undefined;
  }
  else {
    console.warn("Unknown dummy option", props.game?.options.dummy);
    return undefined;
  }
});

const debug = inject("debug", false);
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


.center-text {
  position: absolute;

  font-size: 5vh;

  top: 50%;
  right: 0;
  left: 0;

  transform: translateY(-50%);

  text-align: center;
  vertical-align: middle;
}


</style>
