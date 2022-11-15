<template>
    <div id="configurator">
        <div id="configurator-tabs"></div>
        <div id="configurator-content">
            <div class="tab" ref="tabCards">
                <h2>Cards and play</h2>
                <div class="vertical">
                    <button tabindex="-1" @click="clear">Clear cards</button>
                    <button tabindex="-1" @click="save">Save</button>
                    <input type='file' @change='e => load(e)' ref="loadform" hidden/>
                    <button tabindex="-1" @click="loadClicked">Load</button>
                </div>
                <div class="fields">
                    <template v-for="(label, pos) in positions" :key="pos">
                        <label :for="pos">{{ label }}</label>
                        <input :id="pos" type="text" v-model="options.cards[pos]" />
                        <div class="error-list" v-if="showErrors && cardErrors.has(pos as Position)">
                            <div v-for="err in cardErrors.get(pos as Position)" :key="err">
                                {{ err }}
                            </div>
                        </div>
                    </template>
                </div>

                <div class="fields">
                    <label for="first">Vulnerability</label>
                    <select id="first" v-model="options.vulnerability">
                        <option :value="vul" v-for="(label, vul) in vulnerabilities" :key="vul">{{ label }}</option>
                    </select>
                    <label for="enable-bidding">Enable bidding</label>
                    <input type="checkbox" class="checkbox" id="enable-bidding" v-model="options.bidding" />

                    <label for="first">{{ options.bidding ? "Dealer" : "First to play" }}</label>
                    <select id="first" v-model="options.firstPlayer">
                        <option :value="pos" v-for="(label, pos) in positions" :key="pos">{{ label }}</option>
                    </select>
                    <label for="trumps" v-show="!options.bidding">{{ "Trumps" }}</label>
                    <select id="trumps" v-model="options.trumps" v-show="!options.bidding">
                        <option :value="suit" v-for="(label, suit) in suits" :key="suit">{{ label }}</option>
                    </select>
                    <label for="trumps" v-show="!options.bidding">{{ "Dummy" }}</label>
                    <div class="dummy-choice">
                        <select id="trumps" v-model="options.dummy" v-show="!options.bidding">
                            <option value="auto" selected>Show after lead</option>
                            <option value="static">Static</option>
                            <option value="none">None</option>
                        </select>
                        <select
                                id="trumps"
                                v-model="options.staticDummyPosition"
                                v-show="!options.bidding && options.dummy === 'static'">
                            <option :value="pos" v-for="(label, pos) in positions" :key="pos">{{ label }}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="tab">
                <h2>Controls</h2>

                <div id="controls-tab">
                    <div class="key">S</div>
                    <div>Start game</div>
                    <div class="key">M</div>
                    <div>Toggle this menu</div>
                    <div>
                        <span class="key">&larr;</span>
                        ,
                        <span class="key">&uarr;</span>
                        ,
                        <span class="key">&darr;</span>
                        ,
                        <span class="key">&rarr;</span>
                    </div>
                    <div>Toggle visibility for a hand</div>
                    <div class="key">Z</div>
                    <div>Undo</div>
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
import { Suit } from "@/bridge/model/Suit";
import { CardsInputValidator } from "../class/CardsInputValidator";
import { Position } from "@/bridge/model/Position";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import { downloadObjectAsJson, loadJson } from "@/presentations/class/utils";


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
            if (e.key.toLowerCase() === "s") this.submit();
        });
    },
    methods: {
        submit() {
            this.onSubmit(this.options);
        },
        clear() {
            this.options.cards = {
                north: "",
                east: "",
                west: "",
                south: "",
            };
        },
        save() {
            const name = prompt("Enter file name");
            if (name) downloadObjectAsJson(this.options, name + ".deal");
        },
        load(event: any) {
            loadJson(event).then(a => this.options = a);
            (this.$refs.loadform as HTMLElement).blur();  
        },
        loadClicked() {
            (this.$refs.loadform as HTMLElement).click();
        }
    },

    data() {
        return {
            options: {
                cards: {
                    north: "",
                    south: "",
                    east: "",
                    west: "",
                },
                firstPlayer: "west",
                bidding: true,
                trumps: Suit.Notrump,
                dummy: "auto",
                staticDummyPosition: "north",
                vulnerability: Vulnerability.None,
            },

            positions: {
                [Position.North]: "North",
                [Position.East]: "East",
                [Position.South]: "South",
                [Position.West]: "West",
            },

            vulnerabilities: {
                [Vulnerability.Both]: "Both",
                [Vulnerability.None]: "None",
                [Vulnerability.NS]: "NS",
                [Vulnerability.EW]: "EW",
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
    computed: {
        cardErrors() {
            return CardsInputValidator.validate(new Map<Position, string>(Object.entries(this.options.cards) as any));
        },
        showErrors() {
            return Object.values(this.options.cards).map(s => s.length).every(a => a > 10);
        }
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

.error-list {

    grid-column: 1 / 3;

    div {
        padding: 0 10px;
        text-align: right;
    }

    font-size: 0.8em;
    color: red;
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

        .span {
            grid-column: span 2;
        }
    }

    .vertical {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .dummy-choice {
        display: flex;
        gap: 10px;

        select {
            flex-grow: 1;
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

    button {
        padding: 5px 30px;
        font-size: 1.2rem;
    }
}
</style>
