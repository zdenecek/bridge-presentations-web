<template>
  <configurator v-show="state === 'configurator'" :onSubmit="play"></configurator>
  <presenter ref="presenter" v-show="state === 'presenter'"></presenter>
</template>

<script lang="ts" setup>
import Configurator from '@/presentations/components/Configurator.vue';
import { ConfiguratorOptions } from './class/ConfiguratorOptions';
import { Application } from './class/Application';
import { onMounted, ref } from 'vue';
import Presenter from '@/presentations/components/Presenter.vue';

const state = ref<'configurator' | 'presenter'>('configurator');
const presenter = ref<typeof Presenter>();

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === "q" && e.ctrlKey) {
      e.preventDefault();
      changeState();
    }
  });
});


function changeState(newState?: 'configurator' | 'presenter') {
  state.value = newState ? newState : (state.value === 'configurator' ? 'presenter' : 'configurator');
  Application.state = state.value;
}

function play(options: ConfiguratorOptions) {
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
