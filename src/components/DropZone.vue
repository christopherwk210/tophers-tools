<template>
  <div
    class="card text-white"
    :class="dropZoneClasses"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="card-body text-center p-5 user-select-none" style="pointer-events: none">
      {{text}}
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DropZone extends Vue {
  @Prop() text!: string;

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
