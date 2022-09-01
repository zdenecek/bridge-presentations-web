Game
<template>
    <div id="presenter-app" ref="presenter"></div>
</template>

<script lang="ts">
import GameView from "@/presenter/gui/GameView";
import Game from "@/presenter/model/Game";
import { Position } from "@/presenter/model/Position";
import PlayerFactory from "@/presenter/factory/PlayerFactory";
import { defineComponent } from "vue";
import $ from "jquery";
import { configuratorOptions } from "@/types";

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
            this.game = new Game(this.players);
            PlayerFactory.putHands(this.players, options.cards);
            this.gameView.game = this.game;
            this.$nextTick(() => this.game.start(options.firstPlayer as Position, options.bidding));
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
        const players = PlayerFactory.makePlayers();
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
#presenter-app {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    ::selection {
        color: none;
        background: none;
    }
}

.card {
    height: 20%;
    aspect-ratio: 530/800;
    display: inline-block;
    position: absolute;

    &.playable {
        img {
            transition: ease-in-out 0.2s;
        }

        &:hover img {
            transform: translateY(-10%);
        }
    }

    &:not(.reverse) img.front {
        z-index: 1;
        display: initial;

    }

    &.reverse img.back {
        z-index: 0;
        display: initial;
    }

    img {
        z-index: -1;
        display: none;
        position: absolute;
        top:0;
        left: 0;
        height: 100%;
        width: 100%;
        object-fit: fill; 
    }
}
</style>
