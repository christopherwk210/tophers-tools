<style>
  .IroColorPicker {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
  }
</style>

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
              <input type="text" maxlength="8" :value="gmlRaw" class="form-control bg-secondary text-light border-light" id="gml-raw" readonly="readonly" v-focus-select>
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
          <input type="text" :value="gmlRGB" class="form-control bg-secondary text-light border-light" readonly="readonly" v-focus-select>
        </div>
        <div class="form-group mb-0">
          <input type="text" :value="gmlHSV" class="form-control bg-secondary text-light border-light" readonly="readonly" v-focus-select>
        </div>
      </div>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator';
import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';
import iro from '@jaames/iro';

import {
  hexToRgb,
  parseHex,
  rgbToHsv,
  rgbToHex,
  hsvToRgb
} from './color-utils';

@Component({
  components: {
    ToolWindow
  }
})
export default class ColorPicker extends ToolSuper {
  @Ref() picker!: HTMLDivElement;

  currentColor = '#ffffff';

  hex = '#ffffff';
  gmlHex = '$ffffff';
  gmlRaw = 16777215;

  r = 255;
  g = 255;
  b = 255;

  h = 0;
  s = 0;
  v = 255;

  gmlRGBbase = 'make_colour_rgb';
  gmlHSVbase = 'make_colour_hsv';

  gmlRGB = 'make_colour_rgb(255, 255, 255);';
  gmlHSV = 'make_colour_hsv(0, 0, 255);';

  hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  mounted() {
    iro.ColorPicker(this.picker, {
      color: this.currentColor,
      width: 230
    }).on('input:change', (e: any) => {
      this.handleColorInputChange(e.hexString);
    });
  }

  /**
   * Fired whenever a color is chosen through the color picker
   * @param hex HEX color
   */
  handleColorInputChange(hex: string) {
    this.currentColor = hex;
    this.updateValues();
  }

  handleHexInput(event: InputEvent) {
    const element = event.target as HTMLInputElement;

    // Enforce # character
    if (element.value.charAt(0) !== '#') {
      element.value = `#${element.value}`;
    }

    const validHex = this.hexRegex.test(element.value);

    if (validHex) {
      this.currentColor = element.value;
      this.updateValues();
    }
  }

  handleGmlHexInput(event: InputEvent) {
    const element = event.target as HTMLInputElement;

    // Enforce $ character
    if (element.value.charAt(0) !== '$') {
      element.value = `$${element.value}`;
    }

    if (element.value.length !== 7) return;

    const parsedHex = parseHex(element.value);
    const convertedHex = `#${parsedHex.b}${parsedHex.g}${parsedHex.r}`;

    const validHex = this.hexRegex.test(convertedHex);

    if (validHex) {
      this.currentColor = convertedHex;
      this.updateValues();
    }
  }

  /**
   * Handles new R, G, or B values from text inputs
   * @param rPresent Indicates if the input event is for R
   * @param gPresent Indicates if the input event is for G
   * @param bPresent Indicates if the input event is for B
   */
  handleRGBInput(event: InputEvent, rPresent: boolean, gPresent: boolean, bPresent: boolean) {
    const element = event.target as HTMLInputElement;
    element.value = element.value.replace(/\./g, '');
    element.value = element.value.replace(/\-/g, '');

    const numberVal = Number(element.value);
    if (!isNaN(numberVal)) {
      const rgb = hexToRgb(this.hex);
      const clampedValued = Math.max(Math.min(numberVal, 255), 0);
      const r = rPresent ? clampedValued : rgb[0];
      const g = gPresent ? clampedValued : rgb[1];
      const b = bPresent ? clampedValued : rgb[2];

      this.currentColor = rgbToHex(r, g, b);
      this.updateValues();
    }
  }

  /**
   * Handles new H, S, or V values from text inputs
   * @param hPresent Indicates if the input event is for H
   * @param sPresent Indicates if the input event is for S
   * @param vPresent Indicates if the input event is for V
   */
  handleHSVInput(event: InputEvent, hPresent: boolean, sPresent: boolean, vPresent: boolean) {
    const element = event.target as HTMLInputElement;
    element.value = element.value.replace(/\./g, '');
    element.value = element.value.replace(/\-/g, '');

    const numberVal = Number(element.value);
    if (!isNaN(numberVal)) {
      const clampedValued = Math.max(Math.min(numberVal, 255), 0);

      const rgb = hsvToRgb(
        (hPresent ? clampedValued : this.h) / 255,
        (sPresent ? clampedValued : this.s) / 255,
        (vPresent ? clampedValued : this.v) / 255
      );

      this.currentColor = rgbToHex(
        Math.round(rgb[0]),
        Math.round(rgb[1]),
        Math.round(rgb[2])
        );
      this.updateValues();
    }
  }

  /**
   * Updates all color values based on the current color
   */
  updateValues() {
    this.hex = this.currentColor;

    const parsedHex = parseHex(this.hex);
    this.gmlHex = `$${parsedHex.b}${parsedHex.g}${parsedHex.r}`;
    this.gmlRaw = parseInt(parsedHex.b + parsedHex.g + parsedHex.r, 16);

    const rgb = hexToRgb(this.hex);
    this.r = rgb[0];
    this.g = rgb[1];
    this.b = rgb[2];

    const hsv = rgbToHsv(this.r, this.g, this.b);
    this.h = hsv[0];
    this.s = hsv[1];
    this.v = hsv[2];

    this.gmlHSV = `${this.gmlHSVbase}(${this.h}, ${this.s}, ${this.v})`;
    this.gmlRGB = `${this.gmlRGBbase}(${this.r}, ${this.g}, ${this.b})`;
  }
}
</script>