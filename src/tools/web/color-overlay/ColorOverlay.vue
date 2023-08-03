<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Color, Solver, hexToRgb } from './util';
import { useTool } from '@/tools/use-tool';
import type { IroColorPicker } from '@jaames/iro/dist/ColorPicker';
import ToolWindow from '@/components/ToolWindow.vue';
import iro from '@jaames/iro';

const { title, about } = useTool();

const color = ref('#FF0000');
const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const lossMessage = ref('');

const realColor = ref('#FF0000');
const filter = ref('filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(5%) hue-rotate(201deg) brightness(96%) contrast(100%);');

const iroColorPicker = ref<IroColorPicker>();
const picker = ref<HTMLDivElement>();

onMounted(() => {
  if (!picker.value) return;

  iroColorPicker.value = iro.ColorPicker(picker.value, {
    color: color.value,
    width: 230
  });

  iroColorPicker.value.on('input:change', (e: any) => {
    color.value = e.hexString;
    solve();
  });
});

solve();

function handleHexInput(event: Event) {
  const element = event.target as HTMLInputElement;

  // Enforce # character
  if (element.value.charAt(0) !== '#') {
    element.value = `#${element.value}`;
  }

  const validHex = hexRegex.test(element.value);
  if (validHex) {
    color.value = element.value;
    solve();
  }
}

function solve() {
  const rgb: any = hexToRgb(color.value);
  if (!rgb || rgb.length !== 3) return;

  const colorInstance = new Color(rgb[0], rgb[1], rgb[2]);
  const solver = new Solver(colorInstance);
  const result = solver.solve();

  if (result.loss < 1) {
    lossMessage.value = 'This is a perfect result.';
  } else if (result.loss < 5) {
    lossMessage.value = 'This is close enough.';
  } else if (result.loss < 15) {
    lossMessage.value = 'The color is somewhat off.';
  } else {
    lossMessage.value = 'The color is very inaccurate... Try a different one?';
  }

  realColor.value = colorInstance.toString();
  filter.value = result.filter.replace('filter: ', 'filter: brightness(0) saturate(100%) ')
}

const copied = ref(false);

async function copy() {
  if (copied.value) return;
  await navigator.clipboard.writeText(filter.value);
  copied.value = true;
}

const copyClasses = computed(() => ({
  'btn-success': copied.value,
  'btn-primary': !copied.value
}));

const filterValue = computed(() => {
  return filter.value.replace('filter: ', '').replace(';', '');
})
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <div class="d-flex gap-5 align-items-center justify-content-center">
        <div ref="picker"></div>
        <div class="">
          <label class="text-light">Hex Color:</label>
          <input :value="color" @input="handleHexInput($event)" class="form-control bg-dark text-light" type="text">
          
          <div class="mt-3">
            <div class="d-flex justify-content-center gap-5">
              <div class="d-flex flex-column align-items-center gap-2">
                <div class="text-light">Real color:</div>
                <div class="pixel" :style="{ backgroundColor: realColor }"></div>
              </div>
              <div class="d-flex flex-column align-items-center gap-2">
                <div class="text-light">Filtered color:</div>
                <div class="pixel" :style="{ filter: filterValue }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 text-white-50 text-center">{{ lossMessage }}</div>
      
      <label class="text-light mt-5">Output:</label>
      <input readonly :value="filter" v-focus-select class="form-control bg-dark text-white-50 border-0" type="text">
      <button class="mt-2 btn d-block mx-auto" :class="copyClasses" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</button>

      <small class="mt-5 text-white-50 text-center d-block">
        The code for this feature was lovingly borrowed from <a target="_blank" href="https://codepen.io/sosuke/pen/Pjoqqp?editors=1010">https://codepen.io/sosuke/pen/Pjoqqp?editors=1010</a>, created by Barrett Sonntag. All the credit goes to them! I just wanted to make a more usable interface that also accounted for sources that aren't colored black by default (by adding <code>brightness(0) saturate(100%)</code>).
      </small>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .pixel {
    background-color: black;
    width: 50px;
    height: 50px;
  }
</style>