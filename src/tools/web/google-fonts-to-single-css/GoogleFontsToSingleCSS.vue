<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';
import { googleFontLinkToSingleCSS } from './gf-to-css';

const { title, about } = useTool();
const link = ref('');
const loading = ref(false);
const copied = ref(false);

async function gimmeCSS() {
  if (copied.value) return;

  if (!link.value || !link.value.startsWith('http') || !link.value.includes('fonts.googleapis.com')) {
    alert('You have to put a valid Google Fonts link!');
    return;
  }

  loading.value = true;
  const { success, value } = await googleFontLinkToSingleCSS(link.value);
  if (success) {
    const blob = new Blob([value], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-fonts.css';
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  } else {
    alert(value);
  }

  loading.value = false;
}

watch(() => link.value, () => copied.value = false);

// const copyClasses = computed(() => ({
//   'btn-success': copied.value,
//   'btn-primary': !copied.value
// }));
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4 text-light">
      <div class="text-light mb-3">
        <label>Link:</label>
        <input
          type="text"
          class="form-control text-light border-light bg-dark"
          v-model="link"
          v-focus-select>
        <small><code>e.g. https://fonts.googleapis.com/css2?family=...&display=swap</code></small>
      </div>

      <div class="d-flex justify-content-center">
        <button @click="gimmeCSS" :disabled="loading" class="btn btn-primary text-light">{{ loading ? 'Generating...' : 'Gimme CSS' }}</button>
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .cursor-pointer * {
    cursor: pointer !important;
  }

  .list-group {
    border: 1px solid white;
    max-height: 300px;
    overflow: auto;
  }

  .d-grid {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
  }
</style>