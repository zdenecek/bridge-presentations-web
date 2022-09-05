<template>
    <div class="presenter" ref="presenter"></div>
</template>

<script lang="ts">
import GameView from "@/presenter/gui/GameView";
import Game from "@/presenter/model/Game";
import { Position } from "@/presenter/model/Position";
import PlayerFactory from "@/presenter/factory/PlayerFactory";
import { defineComponent } from "vue";
import $ from "jquery";
import { configuratorOptions } from "@/types";
import GameFactory from "@/presenter/factory/GameFactory";

export default defineComponent({
    name: "Presenter",

    data() {
        return {};
    },
    methods: {
        updatePositions() {
            this.gameView.updatePositions();
        },

        startGame(options: configuratorOptions) {
            this.game = GameFactory.makeObservableGame(this.players);
            PlayerFactory.putHands(this.players, options.cards);
            this.gameView.game = this.game;
            this.$nextTick(() => this.game.start(options.firstPlayer as Position, options.bidding, options.trumps));
        },
    },
    mounted() {
        $(window)
            .on("resize click", () => this.gameView.updatePositions())
            .on("keydown", (e) => {
                if (e.key === "ArrowLeft") this.gameView.toggleVisible(Position.West);
                if (e.key === "ArrowRight") this.gameView.toggleVisible(Position.East);
                if (e.key === "ArrowDown") this.gameView.toggleVisible(Position.South);
                if (e.key === "ArrowUp") this.gameView.toggleVisible(Position.North);
            });

        this.gameView.attach(this.$refs.presenter as HTMLElement);
    },
    setup() {
        const players = PlayerFactory.makeObservablePlayers();
        const gameView = new GameView();
        const game = new Game(players);

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
