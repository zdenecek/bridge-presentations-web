<template>
        <presenter-view :game="game" :handsVisible="handsVisible" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Position } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import PresenterView from '@/presenter/components/PresenterView.vue';
import { useKeyboardShortcut } from '@/presenter/composables/useKeyboardShortcut';
import { PassBid } from "@/bridge/model/Bid";
import { Player } from "@/bridge/model/Player";
import { PositionHelper } from "@/bridge/model/Position";
import { useGameRef } from '@/presenter/composables/useGameRef';


const players = PlayerFactory.makeObservablePlayers();
const game = useGameRef(new PresentationGame(players, PresentationGameOptions.Default));


const startGame = (options: ConfiguratorOptions) => {
    const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew,
        options.contract, options.trumps, options.dummy, options.staticDummyPosition, options.activePositions)
    const gm = GameFactory.makeObservableGame(players, gameOpts, options.vulnerability);

    game.value = gm;
    PlayerFactory.putHands(players, options.cards);
    setTimeout(() => game.value.start(options.firstPlayer as Position, options.trumps));
};

defineExpose({
    startGame
});


// Hide or show hands for presentation purposes
const handsVisible = ref<Map<Position, boolean>>(new Map(
    PositionHelper.all().map((position) => [position, true])
));
[
    { key: 'ArrowLeft', pos: Position.West },
    { key: 'ArrowRight', pos: Position.East },
    { key: 'ArrowDown', pos: Position.South },
    { key: 'ArrowUp', pos: Position.North }
].forEach(({ key, pos }) => {
    useKeyboardShortcut(key, null, () =>
        handsVisible.value.set(pos, !handsVisible.value.get(pos))
    );
});


useKeyboardShortcut('z', null, () =>
    game.value.undo()
);

// Pass bid shortcut
useKeyboardShortcut(' ', null, () => {
    if (game.value.state === "bidding" && game.value.currentlyRequestedPlayer) {
        game.value.tryAddBid(new PassBid(), game.value.currentlyRequestedPlayer as Player);
    }
});

</script>
