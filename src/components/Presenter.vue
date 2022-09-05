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
#presenter-app {
    background-color: blanchedalmond ;

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
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        object-fit: fill;
    }
}

.bidding-box {
    display: inline-grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 20px;

    .bidding-box-bid {
        padding: 2px 4px;
        outline: solid 1px;
        border-radius: 4px;
        cursor: pointer;

        .level {
            color: black;
        }

        &.suit-clubs {
            color: #3575AF;
            background-color: lighten($color: #3575AF, $amount: 50%);
        }
        &.suit-diamonds {
            color: #D26D2A;
            background-color: lighten($color: #D26D2A, $amount: 50%);
        }
        &.suit-hearts {
            color: #E90202;
            background-color: lighten($color: #E90202, $amount: 50%);
        }
        &.suit-spades {
            color: black;
            background-color: gainsboro;
        }

        &.suit-notrump {
            color: black;
            background-color: lightgray;
        }
    }

    .pass {
        grid-column: span 3;
        background-color: green;
        color: white;
    }

    .double {
        background-color: red;
        color: white;
    }

    .redouble {
        background-color: blue;
        color: white;
    }
}

.bidding {
    background-color: aquamarine;
    height: 50%;
    aspect-ratio: 1;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;

}

.bid  {
    transition: ease 1s;
    height: 10vh;

    img {
        height: 100%;
    }
}
</style>
