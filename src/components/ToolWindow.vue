<template>
  <div class="tool-card-container" ondrop="event.preventDefault()">
    <div class="card bg-secondary">
      <div class="card-header bg-primary no-text d-flex">
        {{title}}
        <div class="ms-auto">
          <a v-if="aboutLink" :href="aboutLink" target="_blank" class="btn-link text-dark ms-auto me-3">About</a>
          <router-link v-if="backRoute" :to="backRoute" class="btn-link text-dark ms-auto">Back</router-link>
        </div>
      </div>
      <div class="card-body bg-secondary p-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ToolWindow extends Vue {
  @Prop() title!: string;
  @Prop() backRoute!: string;
  @Prop() aboutLink!: string;
}
</script>