<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from './components/NavBar.vue';

// If the url is chrisanselmo.com redirect to topheranselmo.com
if (window.location.host === 'chrisanselmo.com') {
  window.location.href = window.location.href.replace('chrisanselmo.com', 'topheranselmo.com');
}

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