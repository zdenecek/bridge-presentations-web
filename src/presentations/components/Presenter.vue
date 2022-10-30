<template>
    <div class="presenter" ref="presenter"></div>
</template>

<script lang="ts">
import GameView from "@/presenter/views/GameView";
import { Position } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { defineComponent } from "vue";
import $ from "jquery";
import { configuratorOptions } from "@/presentations/types";
import GameFactory from "@/bridge/factory/GameFactory";
import { UndoableGame } from "@/bridge/model/UndoableGame";


export default defineComponent({
    name: "Presenter",

    data() {
        return {};
    },
    methods: {
        updatePositions() {
            this.gameView.update();
        },

        startGame(options: configuratorOptions) {
            this.game = GameFactory.makeObservableGame(this.players, options.bidding);
            PlayerFactory.putHands(this.players, options.cards);
            this.gameView.attachGame(this.game, options.dummy, options.staticDummyPosition) ;

            this.$nextTick(() => this.game.start(options.firstPlayer as Position,  options.trumps));
        },
    },
    mounted() {
        $(window)
            .on("resize click", () => this.gameView.update())
            .on("keydown", (e) => {
                if (e.key === "ArrowLeft") this.gameView.toggleVisible(Position.West);
                if (e.key === "ArrowRight") this.gameView.toggleVisible(Position.East);
                if (e.key === "ArrowDown") this.gameView.toggleVisible(Position.South);
                if (e.key === "ArrowUp") this.gameView.toggleVisible(Position.North);
                if (e.key === "Z" || e.key === "z") this.game.undo();

            });

        this.gameView.attach(this.$refs.presenter as HTMLElement);
    },
    setup() {
        const players = PlayerFactory.makeObservablePlayers();
        const gameView = new GameView();
        const game = new UndoableGame(players);

        return {
            players,
            game,
            gameView,
        };
    },
});
</script>

<style lang="scss">
@import "@/presenter/assets/style/presenter.scss";
//@import '@/presenter/assets/style/debug.scss';

.presenter {
    width: 100%;
    height: 100%;
}
</style>
