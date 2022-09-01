<template>
    <div id="configurator">
        <div id="configurator-tabs"></div>
        <div id="configurator-content">
            <div class="tab" ref="tabCards">
                <h2>Cards and play</h2>
                <div class="fields">
                    <template v-for="(label, pos) in positions" :key="pos">
                        <label :for="pos">{{ label }}</label>
                        <input :id="pos" type="text" v-model="options.cards[pos]" />
                    </template>
                </div>
                <div class="fields">
                    <label for="enable-bidding">Enable bidding</label>
                    <input type="checkbox"  class="checkbox" id="enable-bidding" v-model="options.bidding" />

                    <label for="first">{{ options.bidding ? "Dealer" : "First to play" }}</label>
                    <select id="first" v-model="options.firstPlayer">
                        <option :value="pos" v-for="(label, pos) in positions" :key="pos">{{ label }}</option>
                    </select>
                    <label for="trumps" v-show="!options.bidding">{{ "Trumps" }}</label>
                    <select id="trumps" v-model="options.trumps" v-show="!options.bidding">
                        <option :value="suit" v-for="(label, suit) in suits" :key="suit">{{ label }}</option>
                    </select>
                </div>
            </div>
            <div class="tab">
                <h2>Controls</h2>

                <div id="controls-tab">
                    <div class="key">Enter</div>
                    <div>Start game</div>
                    <div class="key">Ctrl+M</div>
                    <div>Toggle this menu</div>
                    <div><span class="key">&larr;</span>, <span class="key">&uarr;</span>, <span class="key">&darr;</span>, <span class="key">&rarr;</span></div>
                    <div>Toggle visibility for a hand</div>
                </div>
            </div>
        </div>
        <div id="configurator-buttons">
            <button @click="onSubmit(options)">Play</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Suit } from "@/presenter/model/Suit";
export default defineComponent({
    name: "Presenter",
    props: {
        onSubmit: {
            type: Function,
            required: true,
        },
    },
    created() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.submit();
        });
    },
    methods: {
        submit() {
            this.onSubmit(this.options);
        },
    },
    data() {
        return {
            options: {
                cards: {
                    north: "QT96 Q97 K8 AK8",
                    south: "AKJ87 753 A7 643",
                    east: "542 82 QJT532 T7",
                    west: "3 AKJT 964 QJ952",
                },
                firstPlayer: "north",
                bidding: false,
                trumps: Suit.Notrump,
            },

            positions: {
                north: "North",
                east: "East",
                south: "South",
                west: "West",
            },

            suits: {
                [Suit.Spades]: "♠",
                [Suit.Hearts]: "♥",
                [Suit.Diamonds]: "♦",
                [Suit.Clubs]: "♣",
                [Suit.Notrump]: "NT",
            },
        };
    },
});
</script>

<style lang="scss">
#configurator {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    padding: 10px;
    flex-direction: column;
}

button {
    padding: 5px 30px;
    font-size: 1.2rem;
}

#configurator-tabs {
    display: flex;
}

#configurator-content {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .tab {
        display: flex;
        flex-direction: column;
        background-color: lightcyan;
        border-radius: 10px;
        padding: 20px 10px;
        gap: 20px;
    }


    .fields {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 10px;

        .checkbox {
            align-self: center;
        }

        label {
            text-align: right;
        }
    }

    #controls-tab {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;

        div {
            text-align: left;
            margin: auto 0;
        }
        
        .key {
            margin: auto;
            border: solid gray 1px;
            background-color: lightgray;
            padding: 2px 4px;
            border-radius: 5px;
            display: inline;
            user-select: none;
        }
    }
}

#configurator-buttons {
    display: flex;
    justify-content: flex-end;
}
</style>
