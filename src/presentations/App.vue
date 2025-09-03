<template>
  <configurator v-show="state === 'configurator'" @submit="startGame" @update:options="updateOptions"></configurator>
  <presenter ref="presenter" v-show="state === 'presenter'" :options="options"></presenter>
</template>

<script lang="ts" setup>
import Configurator from '@/presentations/components/Configurator.vue';
import { ConfiguratorOptions, getDefaultConfiguratorOptions } from './class/options';
import { ref } from 'vue';
import Presenter from '@/presentations/components/Presenter.vue';
import { useKeyboardShortcut } from '@/presenter/composables/useKeyboardShortcut';

const state = ref<'configurator' | 'presenter'>('configurator');
const presenter = ref<typeof Presenter>();

function changeState(newState?: 'configurator' | 'presenter') {
  state.value = newState ? newState : (state.value === 'configurator' ? 'presenter' : 'configurator');
}
const options = ref<ConfiguratorOptions>(getDefaultConfiguratorOptions());

function startGame(opts: ConfiguratorOptions) {
  console.log('startGame', opts);
  changeState('presenter');
  updateOptions(opts);
  presenter.value?.startGame(opts);
}

const updateOptions = (opts: ConfiguratorOptions) => {
  options.value = opts;
}

useKeyboardShortcut("q", "ctrl", () => changeState());
useKeyboardShortcut("+", null, () => startGame(options.value));
</script>

<style lang="scss">
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
