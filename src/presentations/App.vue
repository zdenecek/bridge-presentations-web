<template>
  <configurator
    v-show="state === 'configurator'"
    :onSubmit="play"
  ></configurator>
  <presenter ref="presenter" v-show="state === 'presenter'"></presenter>
</template>

<script lang="ts" setup>
/**
 * This is the main component of the application.
 * It is responsible for switching between the configurator and the presenter.
 * It also listens for the Ctrl+Q key combination to switch between the two states.
 */
import Presenter from "@/presentations/components/Presenter.vue";
import Configurator from "@/presentations/components/Configurator.vue";
import { ConfiguratorOptions } from "./class/ConfiguratorOptions";
import { Application } from "./class/Application";
import { nextTick, ref } from "vue";

const state = ref("configurator" as "configurator" | "presenter");
const presenter = ref(null as null | typeof Presenter);

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "q" && e.ctrlKey) {
    e.preventDefault();
    changeState();
  }
});

function changeState(newState?: "configurator" | "presenter") {
  if (newState) state.value = newState;
  else
    state.value = state.value == "configurator" ? "presenter" : "configurator";

  if (newState === "presenter")
    nextTick(() => presenter.value?.updatePositions());

  Application.state = state.value;
}

function play(
  options: ConfiguratorOptions,
  otherOptions: { endMessage?: string }
) {
  changeState("presenter");
  presenter.value?.startGame(options, otherOptions);
}
</script>

<style lang="scss">
.body {
  background-image: url(0.png);
  background-size: cover;
  filter: opacity(20%);
}

* {
  box-sizing: border-box;
}

h1,
h2 {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

body {
  height: 100vh;
  margin: 0;
}
</style>
