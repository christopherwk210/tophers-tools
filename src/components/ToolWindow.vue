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

        <div class="ms-auto">
          <a v-if="props.aboutLink" :href="props.aboutLink" target="_blank" class="btn-link text-dark ms-auto me-3">About</a>
          <RouterLink v-if="props.backRoute" :to="props.backRoute" class="btn-link text-dark ms-auto">Back</RouterLink>
        </div>
      </div>
      <div class="card-body bg-secondary p-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>