<script setup lang="ts">
import { ref } from 'vue';
import { jsonrepair } from 'jsonrepair';

const props = defineProps<{ modelValue: string; }>();
const emit = defineEmits<{ (e: 'update:modelValue', json: string): void; }>();

const repairSuccess = ref<'none' | 'failure'>('none');

function fixMyShitPlease() {
  if (props.modelValue.trim() === '') {
    emit('update:modelValue', '{}');
    return;
  }

  try {
    let json = jsonrepair(props.modelValue);
    json = JSON.stringify(JSON.parse(json), null, 2);
    emit('update:modelValue', json);
    repairSuccess.value = 'none';
  } catch (err) {
    console.log(err)
    repairSuccess.value = 'failure';
  }
}
</script>

<template>
  <div class="text-center p-3">
    <p class="text-warning">JSON Code is invalid!</p>
    <p>Would you like me to try and fix it automatically?</p>
    <button @click="fixMyShitPlease()" class="btn btn-primary">
      <template v-if="repairSuccess === 'none'">yes please</template>
      <template v-else>:(</template>
    </button>
    <p class="mt-2 text-danger" v-if="repairSuccess === 'failure'">
      <small>
        Dang, your JSON is really messed up. I couldn't fix it :(
      </small>
    </p>
  </div>
</template>