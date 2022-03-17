<style scoped>
  .cursor-pointer * {
    cursor: pointer !important;
  }

  .list-group {
    border: 1px solid white;
    max-height: 300px;
    overflow: auto;
  }

  .d-grid {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
  }
</style>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4 text-light">
      <template v-if="!supportsWebWorkers">
        Your browser doesn't support this tool!
      </template>

      <template v-if="supportsWebWorkers">
        <div class="d-flex text-light mb-3">
          <input
            type="text"
            class="form-control text-light border-light text-center"
            @keydown.enter="submit()"
            :class="{ 'bg-dark': !inputsLocked, 'bg-secondary': inputsLocked }"
            :readonly="inputsLocked"
            v-model="numerator"
            v-focus-select>
          <span class="d-flex align-items-center ms-3 me-3">/</span>
          <input
            type="text"
            class="form-control text-light border-light text-center"
            @keydown.enter="submit()"
            :class="{ 'bg-dark': !inputsLocked, 'bg-secondary': inputsLocked }"
            :readonly="inputsLocked"
            v-model="denominator"
            v-focus-select>
        </div>

        <div class="d-flex justify-content-center" :class="{ 'mb-5': inputsLocked && !loading }">
          <button :disabled="!checkInputsValid()" class="btn btn-primary text-light" @click="inputsLocked ? reset() : submit()">{{inputsLocked ? 'reset' : 'submit'}}</button>
        </div>

        <div class="d-flex text-light mb-3" v-if="inputsLocked && !loading">
          <input @input="handleNumeratorChange" :value="subNumerator" type="text" class="form-control text-light border-light text-center bg-dark" v-focus-select>
          <span class="d-flex align-items-center ms-3 me-3">/</span>
          <input @input="handleDenominatorChange" :value="subDenominator" type="text" class="form-control text-light border-light text-center bg-dark" v-focus-select>
        </div>

        <div class="list-group" v-if="inputsLocked && !loading">
          <a v-for="(ratio, ratioIndex) of subRatios" @click="handleRatioSelect(ratio)" :key="ratioIndex" class="list-group-item list-group-item-action bg-dark text-light cursor-pointer">
            <p class="m-0 no-text d-grid">
              <span class="d-flex align-items-center justify-content-end">{{ratio[0]}}</span>
              <img class="ms-auto me-auto" src="@/assets/images/ratiomatic/ratiomatic-white.png">
              <span class="d-flex align-items-center">{{ratio[1]}}</span>
            </p>
          </a>
        </div>
      </template>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';

@Component({
  components: {
    ToolWindow
  }
})
export default class LinearEquationSolver extends ToolSuper {
  inputsLocked = false;
  loading = false;

  numerator = '0';
  denominator = '0';

  subNumerator = '0';
  subDenominator = '0';
  subRatios: number[] = [];

  supportsWebWorkers = !!window.Worker;

  async submit() {
    if (this.inputsLocked) return;
    if (!this.checkInputsValid()) return;

    this.inputsLocked = true;
    this.loading = true;
    const result = await this.calculateRatios(this.numerator, this.denominator);
    this.loading = false;

    if (result) {
      this.subRatios = result.reverse();
    } else {
      return;
    }
  }

  calculateRatios(numerator: string, denominator: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./ratio-math.worker.js', { type: 'module' });
      let terminated = false;

      worker.onmessage = e => {
        if (terminated) return;
        worker.terminate();
        resolve(e.data);
      };

      // Add a 5 second timeout to prevent hangs
      setTimeout(() => {
        terminated = true;
        worker.terminate();
        resolve([]);
      }, 5000);

      worker.postMessage([numerator, denominator]);
    });
  }

  reset() {
    if (this.loading) return;

    this.inputsLocked = false;
    this.subRatios = [];
    this.subNumerator = '0';
    this.subDenominator = '0';
  }

  handleNumeratorChange(event: InputEvent) {
    const numberValue = Number((event.target as HTMLInputElement).value);
    if (isNaN(numberValue)) return;

    const crossDivide = numberValue * Number(this.denominator);
    this.subDenominator = `${crossDivide / Number(this.numerator)}`;
  }

  handleDenominatorChange(event: InputEvent) {
    const numberValue = Number((event.target as HTMLInputElement).value);
    if (isNaN(numberValue)) return;

    const crossDivide = numberValue * Number(this.numerator);
    this.subNumerator = `${crossDivide / Number(this.denominator)}`;
  }

  handleRatioSelect(ratio: number[]) {
    this.subNumerator = ratio[0] + '';
    this.subDenominator = ratio[1] + '';
  }

  checkInputsValid() {
    return !this.loading &&
      this.numerator.length > 0 && this.denominator.length > 0 &&
      !isNaN(Number(this.numerator)) && !isNaN(Number(this.denominator));
  }
}
</script>