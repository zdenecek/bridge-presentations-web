<template>
  <span  v-html="formattedText"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  text?: string;
}>(), {
  text: ''
});

// Computed property for formatted text (newlines to <br>)
const formattedText = computed(() => {
  return props.text.replaceAll("\n", "<br>");
});
</script>

