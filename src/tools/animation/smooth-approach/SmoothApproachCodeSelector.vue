<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { smoothApproachLangs } from './smooth-approach';

const tabs = ref([
  {
    label: 'TypeScript',
    code: smoothApproachLangs.typescript
  },
  {
    label: 'JavaScript',
    code: smoothApproachLangs.javascript
  },
  {
    label: 'GML',
    code: smoothApproachLangs.gml
  }
]);

const currentTab = ref(0);
const copied = ref(false);

watch(() => currentTab.value, () => copied.value = false);

async function copy() {
  if (copied.value) return;
  await navigator.clipboard.writeText(tabs.value[currentTab.value].code);
  copied.value = true;
}

const copyClasses = computed(() => ({
  'btn-success': copied.value,
  'btn-primary': !copied.value
}));
</script>

<template>
  <div class="mt-5">
    <ul class="nav nav-tabs">
      <li class="nav-item" v-for="(tab, tabIndex) of tabs">
        <a class="nav-link" :class="{ active: tabIndex === currentTab }" href="#" @click.prevent="currentTab = tabIndex">{{ tab.label }}</a>
      </li>
    </ul>
    <code><pre class="p-3" v-text="tabs[currentTab].code"></pre></code>
    <button class="btn d-block mx-auto" :class="copyClasses" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</button>
  </div>
</template>