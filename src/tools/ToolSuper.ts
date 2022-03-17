import { Component, Vue } from 'vue-property-decorator';
import { tools, ToolConfig } from '@/lib/config';

@Component
export default class ToolSuper extends Vue {
  tool!: ToolConfig;

  created() {
    for (const key of Object.keys(tools)) {
      for (const tool of tools[key]) {
        if (tool.route === this.$route.path) {
          this.tool = { ...tool };
        }
      }
    }
  }

  get title() {
    return this.tool.title;
  }

  get about() {
    return this.tool.about;
  }
}