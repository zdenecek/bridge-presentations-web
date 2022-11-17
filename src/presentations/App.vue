<template>
    <configurator v-show="state === 'configurator'" :onSubmit="play"></configurator>
    <presenter ref="presenter" v-show="state === 'presenter'"></presenter>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Presenter from  '@/presentations/components/Presenter.vue';
import Configurator from  '@/presentations/components/Configurator.vue';
import { configuratorOptions } from './types';

export default defineComponent({
  name: 'App',
  created() {
    window.addEventListener('keydown', (e) => {
      if (e.key === "M" || e.key === 'm') this.changeState();
    });
  },
  data() {
    return {
      state: 'configurator',
      
    };
  },
  methods: {
    changeState(state?: 'configurator' | 'presenter') {
      
      this.state = state? state : (this.state == 'configurator' ? 'presenter' : 'configurator');
      if(this.state == 'presenter') {
        this.$nextTick( () => (this.$refs.presenter as typeof Presenter)?.updatePositions());
      }
    },
    play(options: configuratorOptions, otherOptions: {endMessage?: string}) {
      this.changeState('presenter');
      (this.$refs.presenter as typeof Presenter).startGame(options, otherOptions);
    }

  },
  components: {
    Presenter,
    Configurator,
  }
});
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

h1, h2 {
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
