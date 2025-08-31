<template>
    <div id="presenter">
        <game-provider :game="game" v-slot="{ game }">
            <presenter-view :game="game" :handsVisible="handsVisible" />
        </game-provider>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { Position } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import PresenterView from '@/presenter/components/PresenterView.vue';
import { registerKeyboardShortcut } from '@/presenter/utils/shortcuts';
import { PassBid } from "@/bridge/model/Bid";
import { Player } from "@/bridge/model/Player";
import { PositionHelper } from "@/bridge/model/Position";
import GameProvider from '@/presenter/components/GameProvider.vue';


const props = defineProps<{
    visible: boolean;
}>();

const players = PlayerFactory.makeObservablePlayers();
const game = ref<PresentationGame>(new PresentationGame(players, PresentationGameOptions.Default));

// Hide or show hands for presentation purposes
const handsVisible = ref<Map<Position, boolean>>(new Map(
    PositionHelper.all().map((position) => [position, true])
));

const startGame = (options: ConfiguratorOptions) => {
    const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew,
        options.contract, options.trumps, options.dummy, options.staticDummyPosition, options.activePositions)
    const gm = GameFactory.makeObservableGame(players, gameOpts, options.vulnerability);

    game.value = gm;
    PlayerFactory.putHands(players, options.cards);
    nextTick(() => game.value.start(options.firstPlayer as Position, options.trumps));
};

onMounted(() => {
    // Arrow key shortcuts
    [
        { key: 'ArrowLeft', pos: Position.West },
        { key: 'ArrowRight', pos: Position.East },
        { key: 'ArrowDown', pos: Position.South },
        { key: 'ArrowUp', pos: Position.North }
    ].forEach(({ key, pos }) => {
        registerKeyboardShortcut(key, null, () => {
            if (props.visible) handsVisible.value.set(pos, !handsVisible.value.get(pos));
            console.log('handsVisible', handsVisible.value);
        });
    });

    registerKeyboardShortcut('z', null, () => {
        if (props.visible) game.value.undo();
    });

    // Pass bid shortcut
    registerKeyboardShortcut(' ', null, (e) => {
        if (game.value.state === "bidding" && game.value.currentlyRequestedPlayer) {
            game.value.tryAddBid(new PassBid(), game.value.currentlyRequestedPlayer as Player);
        }
    });
});

// Expose methods for parent component (same as original methods)
defineExpose({
    startGame
});
</script>

<style lang="scss">
#presenter {
    width: 100%;
    height: 100%;
}
</style>
