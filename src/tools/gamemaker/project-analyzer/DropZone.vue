<template>
  <div class="p-4">
    <p class="text-muted user-select-none">Note: This is an experimental tool that may not work on all browsers.</p>

    <div
      class="card text-white"
      :class="dropZoneClasses"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <div class="card-body text-center p-5 user-select-none" style="pointer-events: none">
        Drop a folder containing a .yyp file here!
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class JavaDocGen extends Vue {
  dragInside = false;

  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  handleDragEnter(event: DragEvent) {
    event.preventDefault();
    this.dragInside = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragInside = false;
  }

  async handleDrop(event: DragEvent) {
    event.preventDefault();
    this.dragInside = false;

    if (event.dataTransfer && event.dataTransfer.items.length > 0) {
      this.$emit('drop', event.dataTransfer.items[0]);
    }
  }

  get dropZoneClasses() {
    return {
      'bg-dark': !this.dragInside,
      'bg-primary': this.dragInside
    };
  }
}
</script>