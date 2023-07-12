<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';

const { title, about } = useTool();

const points = ref([
  { x: 0, y: 0 },
  { x: 0, y: 0 },
]);

const slope = ref(0);
const intercept = ref(0);
const invalid = ref(false);

watch(() => points.value, () => {
  const parsedPoints = [
    Number(points.value[0].x),
    Number(points.value[0].y),
    Number(points.value[1].x),
    Number(points.value[1].y)
  ];

  invalid.value = parsedPoints.some(point => isNaN(point));

  if (!invalid.value) {
    slope.value = (parsedPoints[3] - parsedPoints[1]) / (parsedPoints[2] - parsedPoints[0]);
    intercept.value = parsedPoints[1] + ((parsedPoints[0] * slope.value) * -1);
  }
}, { deep: true });
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4 text-light">
      First point
      <div class="d-flex text-light mb-3">
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[0].x" v-focus-select>
        <span class="d-flex align-items-center ms-3 me-3">/</span>
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[0].y" v-focus-select>
      </div>
      Second point
      <div class="d-flex text-light mb-5">
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[1].x" v-focus-select>
        <span class="d-flex align-items-center ms-3 me-3">/</span>
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[1].y" v-focus-select>
      </div>
      <p class="mb-3 text-center no-text" style="opacity: 0.5">y = slope(x) + intercept</p>
      <div :class="{ invalid: invalid }">
        Slope
        <input type="text" class="form-control text-light border-light text-center bg-secondary mb-3" readonly v-model="slope" v-focus-select>
        Y Intercept
        <input type="text" class="form-control text-light border-light text-center bg-secondary" readonly v-model="intercept" v-focus-select>
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .invalid {
    opacity: 0.5;
  }
</style>