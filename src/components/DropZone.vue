<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ text: string; }>();
const emit = defineEmits<{ drop: [item: DataTransferItem] }>();

const dragInside = ref(false);

function handleDragOver(event: DragEvent) {
  event.preventDefault();
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault();
  dragInside.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  dragInside.value = false;
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragInside.value = false;

  if (event.dataTransfer && event.dataTransfer.items.length > 0) {
    emit('drop', event.dataTransfer.items[0]);
  }
}

const dropZoneClasses = computed(() => ({
  'bg-primary': dragInside.value,
  'bg-dark': !dragInside.value
}));
</script>

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
      {{ props.text }}
    </div>
  </div>
</template>