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
      <p class="text-center" v-if="solution !== null">{{currentVariable}} = {{solution}}</p>
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
export default class CrossMultiplier extends ToolSuper {
  points = [
    {
      x: 0,
      y: 0
    },
    {
      x: 0,
      y: 'x'
    }
  ];

  solution: number | null = null;
  currentVariable = '';

  @Watch('points', { deep: true })
  handlePointUpdate() {
    this.solution = null;

    const unparsedPoints = [
      this.points[0].x,
      this.points[0].y,
      this.points[1].x,
      this.points[1].y
    ];

    const parsedPoints = [
      Number(this.points[0].x),
      Number(this.points[0].y),
      Number(this.points[1].x),
      Number(this.points[1].y)
    ];

    // Only proceed if a single value is not a number
    if (parsedPoints.filter(isNaN).length !== 1) return;

    const nanIndex = parsedPoints.findIndex(isNaN);
    const denominatorIndex = 3 - nanIndex;
    const remainingIndeces = [0, 1, 2, 3].filter(i => i !== nanIndex && i !== denominatorIndex);

    const numerator = parsedPoints[remainingIndeces[0]] * parsedPoints[remainingIndeces[1]];
    const denominator = parsedPoints[denominatorIndex];
    this.solution = numerator / denominator;
    this.currentVariable = unparsedPoints[nanIndex] as any;
  }
}
</script>