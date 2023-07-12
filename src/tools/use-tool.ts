import { ref, computed } from 'vue';
import { tools, type ToolConfig } from '@/config';
import { useRoute } from 'vue-router';

export function useTool() {
  const route = useRoute();
  const tool = ref<ToolConfig>(getToolForPath(route.path));
  const title = computed(() => tool.value.title);
  const about = computed(() => tool.value.about);

  return { tool, title, about };
}

function getToolForPath(path: string) {
  for (const key of Object.keys(tools)) {
    for (const tool of tools[key]) {
      if (tool.route === path) {
        return { ...tool };
      }
    }
  }

  return {} as ToolConfig;
}