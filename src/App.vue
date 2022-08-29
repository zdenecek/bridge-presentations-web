<template>
  <presenter></presenter>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Presenter from  '@/components/Presenter.vue';	

export default defineComponent({
  name: 'App',
  components: {
    Presenter
  }
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}

body {
  height: 100vh;
  margin: 0;
}
</style>
