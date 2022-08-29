<template>
  <div id="presenter-app" ref="presenter">
  </div>
</template>

<script lang="ts">
import GameView from '@/presenter/gui/GameView';
import GameManager from '@/presenter/model/GameManager';
import { Position } from '@/presenter/model/Position';
import { runLater } from '@/presenter/utils/runLater';
import { defineComponent } from 'vue';
import $ from "jquery";



export default defineComponent({
  name: 'Presenter',
  
  data() {
    return {
      
    }
  },

  mounted() {
    this.gameView.attach(this.gameManager, this.$refs.presenter as HTMLElement);
    runLater(() => this.gameManager.startGame(Position.North));
  },
  setup() {
    const gameManager = new GameManager();
    const gameView = new GameView();
    
    $(window).on('resize', () => gameView.updatePositions());



    return {
      gameManager, gameView
    }
  },
});
</script >


<style lang="scss">


#presenter-app {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

::selection {
    color: none;
    background: none;
}


.card {
    height: 20%;
    aspect-ratio: 530/800;
    display: inline-block;
    position: absolute;

   

    &.playable {

        img {
            transition: ease-in-out 0.2s;
        }

        &:hover img {
            transform: translateY(-10%);
        }
    }

    img {
        height: 100%;
        width: 100%;
        object-fit: contain;
        
    }
}
</style>
