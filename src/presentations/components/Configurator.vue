<template>
    <div id="configurator">
        <div id="configurator-tabs"></div>
        <div id="configurator-content">
            <div class="tab" ref="tabCards">
                <h2>Cards and play</h2>
                <div class="vertical">
                    <button tabindex="-1" @click="clear">Clear cards</button>
                    <button tabindex="-1" @click="save">Save</button>
                    <input type='file' accept=".deal" @change='e => load(e)' ref="loadform" hidden />
                    <button tabindex="-1" @click="loadClicked">Load</button>
                </div>
                <div class="fields">
                    <template v-for="(label, pos) in positions" :key="pos">
                        <label :for="pos">{{ label }}</label>
                        <input :id="pos" type="text" v-model="options.cards[pos]" />
                        <div class="error-list"
                             v-if="showCardInputErrors && cardErrors.has(pos as Position) && cardErrors.get(pos as Position)?.length">
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
                    <label for="include-auction">Auction</label>
                    <input type="checkbox" class="checkbox" id="include-auction" v-model="options.bidding" />
                    <template v-if="!options.bidding">
                        <label for="specify-contract">Contract</label>
                        <div class="contract-field">
                            <input type="checkbox" class="checkbox" id="specify-contract" v-model="specifyContract" />
                            <input type="text" v-model="contractInput" v-show="specifyContract" placeholder="4SxE" />
                            <span v-show="specifyContract"> {{ contract }}</span>
                        </div>
                    </template>


                    <label for="trumps" v-show="!options.bidding && !specifyContract">{{ "Trumps" }}</label>
                    <select id="trumps" v-model="options.trumps" v-show="!options.bidding && !specifyContract">
                        <option :value="suit" v-for="(label, suit) in suits" :key="suit">{{ label }}</option>
                    </select>
                    <label for="dummy-choice" v-show="!options.bidding">{{ "Dummy" }}</label>
                    <div class="dummy-choice" v-show="!options.bidding">
                        <select id="trumps" v-model="options.dummy" v-show="!options.bidding">
                            <option value="auto" selected>Show after lead</option>
                            <option value="static">Static</option>
                            <option value="none">None</option>
                        </select>
                        <select
                                id="trumps2"
                                v-model="options.staticDummyPosition"
                                v-show="!options.bidding && options.dummy === 'static' && !specifyContract">
                            <option :value="pos" v-for="(label, pos) in positions" :key="pos">{{ label }}</option>
                        </select>
                    </div>
                    <template v-if="options.bidding || (options.dummy !== 'auto' || !specifyContract)">
                        <div class="error" v-show="'firstPlayer' in errors"> {{ errors.firstPlayer }}</div>
                        <label for="first">{{
                            options.bidding ? "Dealer" : "First to play"
                        }}</label>
                        <select id="first" v-model="options.firstPlayer">
                            <option :value="pos" v-for="(label, pos) in positions" :key="pos">{{ label }}</option>
                        </select>
                    </template>
                    <label for="fake-tricks">Fake trick count</label>
                    <div class="fake-tricks-field">
                        <input type="checkbox" class="checkbox" id="fake-tricks" v-model="fakeTricks" />
                        <div v-show="fakeTricks">
                            <label for="fake-ns">NS:</label>
                            <input type="text" id="fake-ns" v-model.number="options.fake.ns" v-show="fakeTricks" />
                            <label for="fake-ew">EW:</label>
                            <input type="text" id="fake-ew" v-model.number="options.fake.ew" v-show="fakeTricks" />
                        </div>
                    </div>
                    <label for="fake-auction" v-show="options.bidding">Fake auction</label>
                    <input type="checkbox" class="checkbox" id="fake-auction" v-model="fakeAuction"
                           v-show="options.bidding" disabled title="Not supported" />
                    <label>Active positions</label>
                    <div class="flex">
                        <div>
                            <div v-for="(label, position) in positions" :key="'inp' + position">
                                <input type="checkbox" :value="position" :name="position"
                                       v-model="options.activePositions" />
                                <label :for="position">{{ label }}</label>
                            </div>
                        </div>
                        <div class="active-positions-buttons">
                            <button @click="setActiveNS">NS</button>
                            <button @click="setActiveEW">EW</button>
                            <button @click="setActiveAll">All</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab">
                <h2>Controls</h2>

                <div id="controls-tab">
                    <div class="key">+</div>
                    <div>Start game</div>
                    <div class="keys"><span class="key">Ctrl</span>+<span class="key">Q</span></div>
                    <div>Toggle this menu</div>
                    <div class="keys">
                        <span class="key">
                            <arrow direction="up" />
                        </span>
                        <span class="key">
                            <arrow direction="left" />
                        </span>
                        <span class="key">
                            <arrow direction="down" />
                        </span>
                        <span class="key">
                            <arrow direction="right" />
                        </span>
                    </div>
                    <div>Toggle visibility for a hand</div>
                    <div class="keys">
                        <span class="key">Ctrl</span>
                        +
                        <div class="key-grid">
                            <span class="key">
                                <arrow direction="up" />
                            </span>
                            <span class="key">
                                <arrow direction="left" />
                            </span>
                            <span class="key">
                                <arrow direction="down" />
                            </span>
                            <span class="key">
                                <arrow direction="right" />
                            </span>
                        </div>
                    </div>
                    <div>Show one hand, hide others, does not affect dummy</div>
                    <div class="key">Z</div>
                    <div>Undo</div>
                    <div class="keys">
                        <div><span class="key">0</span>-<span class="key">9</span></div><span class="key">/</span><span
                              class="key">*</span><span class="key">-</span>
                    </div>
                    <div>Play card</div>
                    <div class="key">C</div>
                    <div>Claim (first focus then submit, <br>enter claimed tricks for NS)</div>
                    <div class="key">Spacebar</div>
                    <div>Pass (in auction)</div>

                </div>
            </div>
            <div class="tab">
                <h2>Graphics</h2>
                <div class="fields">
                    <label for="message">End text</label>
                    <input type="text" id="message" v-model="endText" />
                </div>
            </div>
        </div>
        <div id="configurator-buttons">
            <button @click="submit">Play</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Suit } from "@/bridge/model/Suit";
import { CardsInputValidator } from "../class/CardsInputValidator";
import { Position, PositionHelper } from "@/bridge/model/Position";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import { downloadObjectAsJson, loadJson, FileEventTarget } from "@/presentations/class/utils";
import { Contract, NonPassedContract } from "@/bridge/model/Contract";
import { DummyOptions } from "@/presenter/views/GameView";
import { validateConfiguratorOptions } from "@/presentations/class/ConfiguratorOptions";
import Arrow from "@/presentations/components/Arrow.vue";

export default defineComponent({
    components: {
        Arrow
    },
    name: "Presenter",
    props: {
        onSubmit: {
            type: Function,
            required: true,
        },
    },
    created() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "+") this.submit();
        });
    },
    methods: {
        submit() {
            if (!this.options.bidding && this.specifyContract && !this.options.contract) return;
            this.onSubmit(this.options, { endMessage: this.endText.length > 0 ? this.endText : undefined });
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
        load(event: Event) {
            (this.$refs.loadform as HTMLElement).blur();
            loadJson(event.target as FileEventTarget).then(a => {
                if (!a) return;
                this.options = a
                this.fakeTricks = a.fake?.ns > 0 || a.fake?.ew > 0;
                this.specifyContract = a.contract !== undefined;
                this.fakeAuction = a.bidding;
                if (this.options.contract && this.options.contract !== "passed")
                    this.options.contract = new NonPassedContract(this.options.contract.suit, this.options.contract.level, this.options.contract.declarer, this.options.contract.dbl);
            });
        },
        loadClicked() {
            (this.$refs.loadform as HTMLElement).click();
        },
        parseContract(value: string) {
            const c = NonPassedContract.fromString(value);
            if (c) this.options.contract = c;
        },
        setActiveNS() {
            this.options.activePositions = [Position.North, Position.South]
        },
        setActiveEW() {
            this.options.activePositions = [Position.East, Position.West]
        },
        setActiveAll() {
            this.options.activePositions = [Position.North, Position.South, Position.East, Position.West]
        },
    },

    data() {
        return {
            contractInput: "",
            specifyContract: true,
            fakeTricks: false,
            fakeAuction: false,
            endText: "Well done!",

            options: {
                cards: {
                    north: "",
                    south: "",
                    east: "",
                    west: "",
                },
                fake: { ns: 0, ew: 0 },
                firstPlayer: "west" as Position,
                bidding: true,
                contract: undefined as Contract | undefined,
                trumps: Suit.Notrump as Suit | undefined,
                dummy: "auto" as DummyOptions | undefined,
                staticDummyPosition: "north" as Position | undefined,
                vulnerability: Vulnerability.None,
                activePositions: PositionHelper.all(),
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
    watch: {
        contractInput(value: string) {
            this.parseContract(value);
        },
        "options.bidding"(value: boolean) {
            if (value) this.specifyContract = false;
        },
        specifyContract(value: boolean) {
            if (!value) this.options.contract = undefined;
            else this.parseContract(this.contractInput);
        }
    },
    computed: {
        contract() {
            return this.options.contract && this.options.contract !== "passed" ? NonPassedContract.toString(this.options.contract) : "";
        },
        cardErrors() {
            return CardsInputValidator.validate(new Map<Position, string>(Object.entries(this.options.cards) as unknown as Iterable<readonly [Position, string]>));
        },
        showCardInputErrors() {
            return Object.values(this.options.cards).map(s => s.length).every(a => a > 10);
        },
        errors() {
            return validateConfiguratorOptions(this.options);
        }
    },
});
</script>

<style lang="scss">
.flex {
    display: flex;
    gap: 1em;
    align-items: center;
}



#configurator {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    padding: 10px;
    flex-direction: column;
    gap: 10px;
}

.key-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
}

.error-list {

    max-height: 80px;
    overflow-y: scroll;

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
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow: auto;

    .tab {
        display: flex;
        flex-direction: column;
        background-color: lightcyan;
        border-radius: 10px;
        padding: 20px 10px;
        gap: 20px;
        overflow-y: auto;
    }

    .fields {
        display: grid;
        grid-template-columns: 2fr 3fr;
        gap: 10px;

        .error {
            grid-column: 1 / span 2;
            color: red;
            font-size: 0.8em;
            text-align: right;
        }

        .checkbox {
            justify-self: start;
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

    .contract-field {
        display: flex;
        gap: 4px;
        align-items: center;

        input[type=text] {
            width: 50px;
        }
    }

    .fake-tricks-field {
        display: flex;
        gap: 4px;
        align-items: center;

        div {
            display: flex;
            gap: 4px;
            align-items: center;
            justify-content: center;
        }

        input[type=text] {
            width: 30px;
        }
    }

    .active-positions-buttons {
        display: flex;
        flex-direction: column;
        gap: 4px;

        button {
            min-width: 40px;
        }
    }

    #controls-tab {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: baseline;


        div {
            text-align: left;
            margin: auto 0;
        }

        .key {
            border: solid gray 1px;
            background-color: lightgray;
            padding: 2px 6px;
            border-radius: 5px;
            display: inline;
            user-select: none;
            justify-self: center;
        }

        .keys {
            display: flex;
            gap: 6px;
            align-items: center;
            justify-content: center;
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
