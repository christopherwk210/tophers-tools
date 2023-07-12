<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTool } from '@/tools/use-tool';
import { IroColorPicker } from '@jaames/iro/dist/ColorPicker';
import ToolWindow from '@/components/ToolWindow.vue';
import iro from '@jaames/iro';

import {
  hexToRgb,
  parseHex,
  rgbToHsv,
  rgbToHex,
  hsvToRgb
} from './color-utils';

const { title, about } = useTool();

const currentColor = ref('#ffffff');

const hex = ref('#ffffff');
const gmlHex = ref('$ffffff');
const gmlRaw = ref(16777215);

const r = ref(255);
const g = ref(255);
const b = ref(255);

const h = ref(0);
const s = ref(0);
const v = ref(255);

const gmlRGBbase = ref('make_colour_rgb');
const gmlHSVbase = ref('make_colour_hsv');

const gmlRGB = ref('make_colour_rgb(255, 255, 255);');
const gmlHSV = ref('make_colour_hsv(0, 0, 255);');

const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const iroColorPicker = ref<IroColorPicker>();
const picker = ref<HTMLDivElement>();

onMounted(() => {
  if (!picker.value) return;

  iroColorPicker.value = iro.ColorPicker(picker.value, {
    color: currentColor.value,
    width: 230
  });

  iroColorPicker.value.on('input:change', (e: any) => {
    handleColorInputChange(e.hexString);
  });
});

/**
 * Fired whenever a color is chosen through the color picker
 * @param hex HEX color
 */
function handleColorInputChange(hex: string) {
  currentColor.value = hex;
  updateValues();
}

function handleHexInput(event: Event) {
  const element = event.target as HTMLInputElement;

  // Enforce # character
  if (element.value.charAt(0) !== '#') {
    element.value = `#${element.value}`;
  }

  const validHex = hexRegex.test(element.value);

  if (validHex) {
    currentColor.value = element.value;
    updateValues();
  }
}

function handleGmlHexInput(event: Event) {
  const element = event.target as HTMLInputElement;

  // Enforce $ character
  if (element.value.charAt(0) !== '$') {
    element.value = `$${element.value}`;
  }

  if (element.value.length !== 7) return;

  const parsedHex = parseHex(element.value);
  const convertedHex = `#${parsedHex.b}${parsedHex.g}${parsedHex.r}`;

  const validHex = hexRegex.test(convertedHex);

  if (validHex) {
    currentColor.value = convertedHex;
    updateValues();
  }
}

/**
 * Handles new R, G, or B values from text inputs
 * @param rPresent Indicates if the input event is for R
 * @param gPresent Indicates if the input event is for G
 * @param bPresent Indicates if the input event is for B
 */
function handleRGBInput(event: Event, rPresent: boolean, gPresent: boolean, bPresent: boolean) {
  const element = event.target as HTMLInputElement;
  element.value = element.value.replace(/\./g, '');
  element.value = element.value.replace(/\-/g, '');

  const numberVal = Number(element.value);
  if (!isNaN(numberVal)) {
    const rgb = hexToRgb(hex.value);
    const clampedValued = Math.max(Math.min(numberVal, 255), 0);
    const r = rPresent ? clampedValued : rgb[0];
    const g = gPresent ? clampedValued : rgb[1];
    const b = bPresent ? clampedValued : rgb[2];

    currentColor.value = rgbToHex(r, g, b);
    updateValues();
  }
}

/**
 * Handles new H, S, or V values from text inputs
 * @param hPresent Indicates if the input event is for H
 * @param sPresent Indicates if the input event is for S
 * @param vPresent Indicates if the input event is for V
 */
function handleHSVInput(event: Event, hPresent: boolean, sPresent: boolean, vPresent: boolean) {
  const element = event.target as HTMLInputElement;
  element.value = element.value.replace(/\./g, '');
  element.value = element.value.replace(/\-/g, '');

  const numberVal = Number(element.value);
  if (!isNaN(numberVal)) {
    const clampedValued = Math.max(Math.min(numberVal, 255), 0);

    const rgb = hsvToRgb(
      (hPresent ? clampedValued : h.value) / 255,
      (sPresent ? clampedValued : s.value) / 255,
      (vPresent ? clampedValued : v.value) / 255
    );

    currentColor.value = rgbToHex(
      Math.round(rgb[0]),
      Math.round(rgb[1]),
      Math.round(rgb[2])
    );
    updateValues();
  }
}

/**
 * Updates all color values based on the current color
 */
function updateValues() {
  if (!iroColorPicker.value) return;

  hex.value = currentColor.value;

  const parsedHex = parseHex(hex.value);
  gmlHex.value = `$${parsedHex.b}${parsedHex.g}${parsedHex.r}`;
  gmlRaw.value = parseInt(parsedHex.b + parsedHex.g + parsedHex.r, 16);

  const rgb = hexToRgb(hex.value);
  r.value = rgb[0];
  g.value = rgb[1];
  b.value = rgb[2];

  const hsv = rgbToHsv(r.value, g.value, b.value);
  h.value = hsv[0];
  s.value = hsv[1];
  v.value = hsv[2];

  gmlHSV.value = `${gmlHSVbase.value}(${h.value}, ${s.value}, ${v.value})`;
  gmlRGB.value = `${gmlRGBbase.value}(${r.value}, ${g.value}, ${b.value})`;

  iroColorPicker.value.color.set(hex.value);
}
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <div class="d-block d-md-flex">
        <div ref="picker"></div>
        <div class="d-flex justify-content-between flex-grow-1 text-light">

          <!-- HEX Values -->
          <div class="flex-grow-1 ps-3">
            <div class="form-group">
              <label for="hex">HEX</label>
              <input type="text" maxlength="7" :value="hex" @input="handleHexInput($event)" class="form-control bg-dark text-light border-light" id="hex" v-focus-select>
            </div>
            <div class="form-group">
              <label for="gml-hex">GML HEX</label>
              <input type="text" maxlength="7" :value="gmlHex" @input="handleGmlHexInput($event)" class="form-control bg-dark text-light border-light" id="gml-hex" v-focus-select>
            </div>
            <div class="form-group">
              <label for="gml-raw">GML RAW</label>
              <input type="text" maxlength="8" :value="gmlRaw" class="form-control bg-secondary text-light border-light" id="gml-raw" readonly v-focus-select>
            </div>
          </div>

          <!-- RGB -->
          <div class="flex-grow-1 ps-3">
            <div class="form-group">
              <label for="r">R</label>
              <input type="text" maxlength="3" :value="r" @input="handleRGBInput($event, true, false, false)" class="form-control bg-dark text-light border-light" id="r" v-focus-select>
            </div>
            <div class="form-group">
              <label for="g">G</label>
              <input type="text" maxlength="3" :value="g" @input="handleRGBInput($event, false, true, false)" class="form-control bg-dark text-light border-light" id="g" v-focus-select>
            </div>
            <div class="form-group">
              <label for="b">B</label>
              <input type="text" maxlength="3" :value="b" @input="handleRGBInput($event, false, false, true)" class="form-control bg-dark text-light border-light" id="b" v-focus-select>
            </div>
          </div>

          <!-- HSV -->
          <div class="flex-grow-1 ps-3">
            <div class="form-group">
              <label for="h">H</label>
              <input type="text" maxlength="3" :value="h" @input="handleHSVInput($event, true, false, false)" class="form-control bg-dark text-light border-light" id="h" v-focus-select>
            </div>
            <div class="form-group">
              <label for="s">S</label>
              <input type="text" maxlength="3" :value="s" @input="handleHSVInput($event, false, true, false)" class="form-control bg-dark text-light border-light" id="s" v-focus-select>
            </div>
            <div class="form-group">
              <label for="v">V</label>
              <input type="text" maxlength="3" :value="v" @input="handleHSVInput($event, false, false, true)" class="form-control bg-dark text-light border-light" id="v" v-focus-select>
            </div>
          </div>
        </div>
      </div>

      <div class="d-block mt-4">
        <div class="form-group">
          <input type="text" :value="gmlRGB" class="form-control bg-secondary text-light border-light" readonly v-focus-select>
        </div>
        <div class="form-group mb-0">
          <input type="text" :value="gmlHSV" class="form-control bg-secondary text-light border-light" readonly v-focus-select>
        </div>
      </div>
    </div>
  </ToolWindow>
</template>

<style>
  .IroColorPicker {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
  }
</style>