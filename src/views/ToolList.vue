<template>
  <ToolWindow title="Tools">
    <div class="list-group list-group-flush">
      <template v-for="(entry, entryIndex) of organizedTools">
        <div :key="entryIndex" v-if="typeof entry === 'string'" class="list-group-item bg-dark text-light no-text">{{entry}}</div>
        <router-link :key="entryIndex" v-else :to="entry.route" class="list-group-item list-group-item-action bg-secondary text-light">
          <h5 class="mb-1">{{entry.title}}</h5>
          <p class="m-0">{{entry.description}}</p>
        </router-link>
      </template>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ToolWindow from '@/components/ToolWindow.vue';
import { tools, ToolConfig } from '@/lib/config';

@Component({
  components: {
    ToolWindow
  }
})
export default class ToolList extends Vue {
  organizedTools: (string | ToolConfig)[] = [];

  mounted() {
    for (const key of Object.keys(tools)) {
      this.organizedTools.push(key);
      for (const tool of tools[key]) {
        this.organizedTools.push(tool);
      }
    }
  }
}
</script>