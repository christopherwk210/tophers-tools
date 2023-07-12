<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';

const { title, about } = useTool();

const inputsLocked = ref(false);
const loading = ref(false);

const numerator = ref('0');
const denominator = ref('0');

const subNumerator = ref('0');
const subDenominator = ref('0');
const subRatios = ref<number[][]>([]);

const supportsWebWorkers = typeof Worker !== 'undefined';

async function submit() {
  if (inputsLocked.value) return;
  if (!checkInputsValid()) return;

  inputsLocked.value = true;
  loading.value = true;
  const result = await calculateRatios(numerator.value, denominator.value);
  loading.value = false;

  if (result) subRatios.value = result.reverse();
}

function calculateRatios(numerator: string, denominator: string): Promise<any[]> {
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

function reset() {
  if (loading.value) return;

  inputsLocked.value = false;
  subRatios.value = [];
  subNumerator.value = '0';
  subDenominator.value = '0';
}

function handleNumeratorChange(event: Event) {
  const numberValue = Number((event.target as HTMLInputElement).value);
  if (isNaN(numberValue)) return;

  const crossDivide = numberValue * Number(denominator.value);
  subDenominator.value = `${crossDivide / Number(numerator.value)}`;
}

function handleDenominatorChange(event: Event) {
  const numberValue = Number((event.target as HTMLInputElement).value);
  if (isNaN(numberValue)) return;

  const crossDivide = numberValue * Number(numerator.value);
  subNumerator.value = `${crossDivide / Number(denominator.value)}`;
}

function handleRatioSelect(ratio: number[]) {
  subNumerator.value = ratio[0] + '';
  subDenominator.value = ratio[1] + '';
}

function checkInputsValid() {
  return !loading.value &&
    numerator.value.length > 0 && denominator.value.length > 0 &&
    !isNaN(Number(numerator.value)) && !isNaN(Number(denominator.value));
}
</script>

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
              <span class="d-flex align-items-center justify-content-end">{{ ratio[0] }}</span>
              <img class="ms-auto me-auto" src="@/assets/images/ratiomatic/ratiomatic-white.png">
              <span class="d-flex align-items-center">{{ ratio[1] }}</span>
            </p>
          </a>
        </div>
      </template>
    </div>
  </ToolWindow>
</template>

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