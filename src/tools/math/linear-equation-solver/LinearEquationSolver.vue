<style scoped>
  .invalid {
    opacity: 0.5;
  }
</style>

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

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';

@Component({
  components: {
    ToolWindow
  }
})
export default class LinearEquationSolver extends ToolSuper {
  points = [
    {
      x: 0,
      y: 0
    },
    {
      x: 0,
      y: 0
    }
  ];

  slope = 0;
  intercept = 0;
  invalid = false;

  @Watch('points', { deep: true })
  handlePointUpdate() {
    const parsedPoints = [
      Number(this.points[0].x),
      Number(this.points[0].y),
      Number(this.points[1].x),
      Number(this.points[1].y)
    ];

    this.invalid = parsedPoints.some(point => isNaN(point));

    if (!this.invalid) {
      this.slope = (parsedPoints[3] - parsedPoints[1]) / (parsedPoints[2] - parsedPoints[0]);
      this.intercept = parsedPoints[1] + ((parsedPoints[0] * this.slope) * -1);
    }
  }
}
</script>