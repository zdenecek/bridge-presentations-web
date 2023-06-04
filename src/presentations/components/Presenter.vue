<template>
    <div class="presenter" ref="presenter"></div>
</template>

<script lang="ts">
import { Position, PositionHelper } from "@/bridge/model/Position";
import PlayerFactory from "@/bridge/factory/PlayerFactory";
import { defineComponent } from "vue";
import $ from "jquery";
import { ConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import GameFactory from "@/bridge/factory/GameFactory";
import GameViewFactory from "@/presenter/views/GameViewFactory";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import { Application } from "../class/Application";
import { PassBid } from "@/bridge/model/Bid";


export default defineComponent({
    name: "Presenter",

    data() {
        return {};
    },
    methods: {
        updatePositions() {
            this.gameView.update();
        },

        startGame(options: ConfiguratorOptions, { endMessage }: { endMessage?: string }) {
            const gameOpts = new PresentationGameOptions(options.bidding, options.fake?.ns, options.fake?.ew, options.contract, options.trumps, options.activePositions)

            this.gameView.endMessage = endMessage;

            this.game = GameFactory.makeObservableGame(this.players, gameOpts, options.vulnerability);
            PlayerFactory.putHands(this.players, options.cards);
            this.gameView.attachGame(this.game, options.dummy, options.staticDummyPosition);

            this.$nextTick(() => this.game.start(options.firstPlayer as Position, options.trumps));
        },
    },
    mounted() {
        $(window)
            .on("resize click", () => this.gameView.update())
            .on("keydown", (e) => {
                if (Application.state !== 'presenter') return;

                var arrowHelper = (ctrl: boolean, pos: Position) => {
                    if (!ctrl) {
                        this.gameView.toggleVisible(pos);
                        return;
                    }

                    PositionHelper.all().forEach((p) => {
                        if (p !== this.gameView.dummy) this.gameView.toggleVisible(p, p === pos);
                    });
                }

                if (e.key === "ArrowLeft") arrowHelper(e.ctrlKey, Position.West);
                if (e.key === "ArrowRight") arrowHelper(e.ctrlKey, Position.East);
                if (e.key === "ArrowDown") arrowHelper(e.ctrlKey, Position.South);
                if (e.key === "ArrowUp") arrowHelper(e.ctrlKey, Position.North);
                if (e.key === "Z" || e.key === "z") this.game.undo();
                if (e.key === " " && this.game.state === "bidding" && this.game.currentlyRequestedPlayer) this.game.tryAddBid(new PassBid(), this.game.currentlyRequestedPlayer);

            });

        this.gameView.attach(this.$refs.presenter as HTMLElement);
    },
    setup() {
        const players = PlayerFactory.makeObservablePlayers();
        const gameView = GameViewFactory.make();
        const game = new PresentationGame(players, PresentationGameOptions.Default);

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
// @import '@/presenter/assets/style/debug.scss';

.presenter {
    width: 100%;
    height: 100%;
}
</style>
