<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import { compress } from './tinypng';
import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '@/components/DropZone.vue';

const { title, about } = useTool();

const localStorageKey = '__tt-bamboo-api-key';

const apiKey = ref(localStorage.getItem(localStorageKey) || '');

watch(
  () => apiKey.value,
  () => localStorage.setItem(localStorageKey, apiKey.value)
)

async function handleDrop(item: DataTransferItem) {
  // Get access to the local filesystem
  const fileSystemEntry = item.webkitGetAsEntry();
  if (!fileSystemEntry) return;

  console.log(item.getAsFile())
  compress(apiKey.value, item.getAsFile()!);
}
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <label class="text-light"><a target="_blank" href="https://tinypng.com/developers">TinyPNG</a> API Key:</label>
      <input v-model="apiKey" class="form-control bg-dark text-light" type="text">
      <DropZone @drop="handleDrop" text="Drop a folder containing a .yyp file here!" />
    </div>
  </ToolWindow>
</template>