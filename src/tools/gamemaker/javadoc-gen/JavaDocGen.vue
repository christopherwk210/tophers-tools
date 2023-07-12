<script setup lang="ts">
import { ref } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';

const { title, about } = useTool();

const gmlFuncRegex = /(^[A-Za-z_])([A-Za-z_0-9])*(\s?)(\()(\s*)(([A-Za-z_])([A-Za-z_0-9])*)+(((\s*)([,]?)(\s*)([A-Za-z_])([A-Za-z_0-9])*)*(\s*)(\)))/;

const gmsFunc = ref('');
const output = ref('');

const desc = '/// @description ';
const param = '/// @param ';
const arg = '/// @arg ';

const argsSwitch = ref(false);

function handleSwitchToggle(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  argsSwitch.value = checked;
  updateOutput(gmsFunc.value, argsSwitch.value);
}

function handleFuncChange(event: Event) {
  const func = (event.target as HTMLInputElement).value;
  gmsFunc.value = func;
  updateOutput(gmsFunc.value, argsSwitch.value);
}

function updateOutput(func: string, useArgs: boolean) {
  // Output string
  let javaDocStr = '';

  // Remove slashes in the front and trim
  const noSlashes = func.replace(/(^[/]+)/g, '').trim();

  // Test the regex
  if (gmlFuncRegex.test(noSlashes)) {
    const paramString = useArgs ? arg : param;

    // Get just the function name
    const funcName = noSlashes.substring(0, noSlashes.indexOf('('));

    // Get the arguments
    const args = noSlashes.substring(noSlashes.indexOf('(') + 1, noSlashes.indexOf(')')).replace(/\s/g, '').split(',');

    // Set up output string
    javaDocStr += `${desc}${funcName}\n`;

    // Add args to output
    args.forEach(arg => javaDocStr += `${paramString}${arg}\n`);

    // Display output
    output.value = javaDocStr;
  } else {
    // Reset
    output.value = '';
  }
}
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <div class="form-group form-check pb-3">
        <input type="checkbox" class="form-check-input" id="args-switch" :value="argsSwitch" @input="handleSwitchToggle($event)">
        <label class="form-check-label text-light" for="args-switch">Use <span class="text-pink">args</span> instead of <span class="text-pink">param</span></label>
      </div>
      <div class="form-group pb-3">
        <input type="text" class="form-control bg-dark text-light border-light" placeholder="my_script(arg1, arg2)" :value="gmsFunc" @input="handleFuncChange($event)">
      </div>
      <div class="form-group">
        <textarea class="form-control bg-dark text-light border-light" rows="5" readonly :value="output" v-focus-select></textarea>
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .text-pink {
    color: #e83e8c;
  }
</style>