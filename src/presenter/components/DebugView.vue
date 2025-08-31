<template>
    <div class="debug-panel">
        <div class="debug-header">Debug</div>
        <div class="debug-content">
            <div class="debug-item">
                <div class="debug-item-label">Card Views:</div>
                <div class="debug-item-value">{{ cardViews.size }}</div>

            </div>
            <div class="debug-item">
                <div class="debug-item-label">Bids:</div>
                <div class="debug-item-value">{{ game?.auction?.bids.length }}</div>

            </div>

            <div class="debug-item">
                <div class="debug-item-label">Visible cards:</div>
                <div class="debug-item-value">{{ visibleCards.length }}</div>
            </div>
            <div class="debug-item">
                <div class="debug-item-label">Game state:</div>
                <div class="debug-item-value">{{ game?.state }}</div>
                
            </div>
            <div class="debug-item">
                <div class="debug-item-label">On turn:</div>
                <div class="debug-item-value">{{ game?.currentlyRequestedPlayer?.position }}</div>
                
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CardViewData } from './CardViewData';
import { Card } from '@/bridge/model/Card';
import { PresentationGame } from '@/bridge/model/PresentationGame';
import { inject, ref, computed } from 'vue';

const props = defineProps<{
  game?: PresentationGame;
  cardViews: Map<Card, CardViewData>;
}>();

const visibleCards = computed(() => {
    return [...props.cardViews.values()].filter((cardView) => !cardView.hidden);
});
</script>

<style scoped>
.debug-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #00ff00;
    border: 1px solid #00ff00;
    border-radius: 4px;
    padding: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    min-width: 200px;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.debug-header {
    font-weight: bold;
    border-bottom: 1px solid #00ff00;
    margin-bottom: 6px;
    padding-bottom: 4px;
}

.debug-item {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
}

.debug-item-label {
    margin-right: 10px;
}

.debug-item-value {
    font-weight: bold;
}
</style>