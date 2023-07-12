<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { tools, type ToolConfig } from '@/config';
import ToolWindow from '@/components/ToolWindow.vue';

const organizedTools = ref<(string | ToolConfig)[]>([]);

onMounted(() => {
  for (const key of Object.keys(tools).sort()) {
    organizedTools.value.push(key);

    for (const tool of tools[key].sort((a, b) => (a.title > b.title) ? 1 : -1)) {
      organizedTools.value.push(tool);
    }
  }
})
</script>

<template>
  <ToolWindow title="Tools">
    <div class="list-group list-group-flush">
      <template v-for="entry of organizedTools">
        <template v-if="typeof entry === 'string'">
          <div class="list-group-item bg-dark text-light no-text user-select-none">{{ entry }}</div>
        </template>

        <template v-else>
          <RouterLink v-if="entry.route" :to="entry.route" class="list-group-item list-group-item-action bg-secondary text-light user-select-none">
            <h5 class="mb-1">{{entry.title}}</h5>
            <p class="m-0" style="opacity: 0.4">{{entry.description}}</p>
          </RouterLink>
  
          <a v-if="entry.url" :href="entry.url" class="list-group-item list-group-item-action bg-secondary text-light user-select-none">
            <h5 class="mb-1">{{entry.title}}</h5>
            <p class="m-0" style="opacity: 0.4">{{entry.description}}</p>
          </a>
        </template>
      </template>
    </div>
  </ToolWindow>
</template>