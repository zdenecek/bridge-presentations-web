<template>
  <configurator v-show="state === 'configurator'" :onSubmit="startGame"></configurator>
  <presenter ref="presenter" v-show="state === 'presenter'" :visible="state === 'presenter'"></presenter>
</template>

<script lang="ts" setup>
import Configurator from '@/presentations/components/Configurator.vue';
import { ConfiguratorOptions } from './class/ConfiguratorOptions';
import { ref } from 'vue';
import Presenter from '@/presentations/components/Presenter.vue';
import { useKeyboardShortcut } from '@/presenter/composables/useKeyboardShortcut';

const state = ref<'configurator' | 'presenter'>('configurator');
const presenter = ref<typeof Presenter>();

function changeState(newState?: 'configurator' | 'presenter') {
  state.value = newState ? newState : (state.value === 'configurator' ? 'presenter' : 'configurator');
}
useKeyboardShortcut("q", "ctrl", () => changeState());

function startGame(options: ConfiguratorOptions) {
  changeState('presenter');
  presenter.value?.startGame(options);
}
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
