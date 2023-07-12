<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';

const { title, about } = useTool();

const points = ref([
  { x: 0, y: 0 },
  { x: 0, y: 'x' },
]);

const solution = ref<number | null>(null);
const currentVariable = ref('');

watch(() => points.value, () => {
  solution.value = null;

  const unparsedPoints = [
    points.value[0].x,
    points.value[0].y,
    points.value[1].x,
    points.value[1].y
  ];

  const parsedPoints = [
    Number(points.value[0].x),
    Number(points.value[0].y),
    Number(points.value[1].x),
    Number(points.value[1].y)
  ];

  // Only proceed if a single value is not a number
  if (parsedPoints.filter(isNaN).length !== 1) return;

  const nanIndex = parsedPoints.findIndex(isNaN);
  const denominatorIndex = 3 - nanIndex;
  const remainingIndeces = [0, 1, 2, 3].filter(i => i !== nanIndex && i !== denominatorIndex);

  const numerator = parsedPoints[remainingIndeces[0]] * parsedPoints[remainingIndeces[1]];
  const denominator = parsedPoints[denominatorIndex];
  solution.value = numerator / denominator;
  currentVariable.value = unparsedPoints[nanIndex] as any;
}, { deep: true });
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4 text-light">
      Fraction one
      <div class="d-flex text-light mb-3">
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[0].x" v-focus-select>
        <span class="d-flex align-items-center ms-3 me-3">/</span>
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[0].y" v-focus-select>
      </div>
      Fraction two
      <div class="d-flex text-light mb-5">
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[1].x" v-focus-select>
        <span class="d-flex align-items-center ms-3 me-3">/</span>
        <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="points[1].y" v-focus-select>
      </div>
      
      <p v-if="solution === null" class="mb-3 text-center no-text" style="opacity: 0.5">Enter three numbers, and one unknown variable using any letter or letters</p>
      <p class="text-center" v-if="solution !== null">{{ currentVariable }} = {{ solution }}</p>
    </div>
  </ToolWindow>
</template>