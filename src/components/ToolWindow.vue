<script setup lang="ts">
const props = defineProps<{
  title: string;
  backRoute?: string;
  aboutLink?: string;
}>();
</script>

<template>
  <div class="tool-card-container" @drop="$event.preventDefault()">
    <div class="card bg-secondary">
      <div class="card-header bg-primary no-text d-flex">
        {{ props.title }}

        <div class="controls">
          <a v-if="props.aboutLink" :href="props.aboutLink" target="_blank" class="btn-link text-dark">
            <i class="bi-question-circle-fill"></i>
          </a>
          <RouterLink v-if="props.backRoute" :to="props.backRoute" class="btn-link text-dark">
            <i class="bi-arrow-left"></i>
          </RouterLink>
        </div>
      </div>
      <div class="card-body bg-secondary p-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .card-header {
    position: relative;
  }

  .controls {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
  }

  .btn-link {
    height: 100%;
    font-size: 18px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 40px;
  }

  .btn-link:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: white !important;
  }
</style>