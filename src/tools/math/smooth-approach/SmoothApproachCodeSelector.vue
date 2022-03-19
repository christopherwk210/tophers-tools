<template>
  <div class="mt-5">
    <ul class="nav nav-tabs">
      <li
        class="nav-item"
        v-for="(tab, tabIndex) of tabs"
        :key="tabIndex"
      >
        <a class="nav-link" :class="{ active: tabIndex === currentTab }" href="#" @click.prevent="currentTab = tabIndex">{{tab.label}}</a>
      </li>
    </ul>
    <code><pre class="p-3" v-text="tabs[currentTab].code"></pre></code>
    <button class="btn d-block mx-auto" :class="copyClasses" @click="copy">{{copied ? 'Copied!' : 'Copy'}}</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { smoothApproachLangs } from './smooth-approach';

@Component
export default class SmoothApproachCodeSelector extends Vue {
  tabs = [
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
  ];

  currentTab = 0;

  copied = false;

  @Watch('currentTab')
  handleTabChange() {
    this.copied = false;
  }

  async copy() {
    if (this.copied) return;
    await navigator.clipboard.writeText(this.tabs[this.currentTab].code);
    this.copied = true;
  }

  get copyClasses() {
    return {
      'btn-primary': !this.copied,
      'btn-success': this.copied
    };
  }
}
</script>