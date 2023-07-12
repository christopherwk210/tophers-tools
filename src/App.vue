<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from './components/NavBar.vue';

onMounted(() => {
  // Prevent global file drops
  window.addEventListener('dragover', e => e.preventDefault(), false);
  window.addEventListener('drop', e => e.preventDefault(), false);
});
</script>

<template>
  <div class="app">
    <NavBar />
    <RouterView />
  </div>
</template>