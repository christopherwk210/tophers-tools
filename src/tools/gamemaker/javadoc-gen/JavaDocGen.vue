<style>
  .text-pink {
    color: #e83e8c;
  }
</style>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <div class="form-group form-check pb-3">
        <input type="checkbox" class="form-check-input" id="args-switch" :value="argsSwitch" @input="handleSwitchToggle">
        <label class="form-check-label text-light" for="args-switch">Use <span class="text-pink">args</span> instead of <span class="text-pink">param</span></label>
      </div>
      <div class="form-group pb-3">
        <input type="text" class="form-control bg-dark text-light border-light" placeholder="my_script(arg1, arg2)" :value="gmsFunc" @input="handleFuncChange($event)">
      </div>
      <div class="form-group">
        <textarea class="form-control bg-dark text-light border-light" rows="5" readonly="readonly" :value="output" v-focus-select></textarea>
      </div>
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
export default class JavaDocGen extends ToolSuper {
  gmlFuncRegex = /(^[A-Za-z_])([A-Za-z_0-9])*(\s?)(\()(\s*)(([A-Za-z_])([A-Za-z_0-9])*)+(((\s*)([,]?)(\s*)([A-Za-z_])([A-Za-z_0-9])*)*(\s*)(\)))/;

  gmsFunc = '';
  output = '';

  desc = '/// @description ';
  param = '/// @param ';
  arg = '/// @arg ';

  argsSwitch = false;

  handleSwitchToggle(event: InputEvent) {
    const checked = (event.target as HTMLInputElement).checked;
    this.argsSwitch = checked;
    this.updateOutput(this.gmsFunc, this.argsSwitch);
  }

  handleFuncChange(event: InputEvent) {
    const func = (event.target as HTMLInputElement).value;
    this.gmsFunc = func;
    this.updateOutput(this.gmsFunc, this.argsSwitch);
  }

  updateOutput(func: string, useArgs: boolean) {
    // Output string
    let javaDocStr = '';

    // Remove slashes in the front and trim
    const noSlashes = func.replace(/(^[/]+)/g, '').trim();

    // Test the regex
    if (this.gmlFuncRegex.test(noSlashes)) {
      const paramString = useArgs ? this.arg : this.param;

      // Get just the function name
      const funcName = noSlashes.substring(0, noSlashes.indexOf('('));

      // Get the arguments
      const args = noSlashes.substring(noSlashes.indexOf('(') + 1, noSlashes.indexOf(')')).replace(/\s/g, '').split(',');

      // Set up output string
      javaDocStr += `${this.desc}${funcName}\n`;

      // Add args to output
      args.forEach(arg => javaDocStr += `${paramString}${arg}\n`);

      // Display output
      this.output = javaDocStr;
    } else {
      // Reset
      this.output = '';
    }
  }
}
</script>