<script setup lang="ts">
import type { Item } from './utils';

const props = defineProps<{ item: Item; parentIsArray: boolean; }>();
const emit = defineEmits<{
  (e: 'update', original: Item, updated: Item, type: 'name' | 'type' | 'value'): void;
  (e: 'action', item: Item, action: 'delete' | 'search'): void;
}>();

const types = ['array', 'boolean', 'null', 'number', 'object', 'string'];

function updateType(e: Event) {
  const target = e.target as HTMLSelectElement;
  emit('update', props.item, { ...props.item, type: target.value as any }, 'type');
}

function updateName(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update', props.item, { ...props.item, name: target.value }, 'name');
}

function updateChecked() {
  emit('update', props.item, { ...props.item, value: !props.item.value }, 'value');
}

function updateValue(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update', props.item, { ...props.item, value: target.value }, 'value');
}

function getClassForType(type: string) {
  switch (type) {
    case 'array':
      return 'text-warning';
    case 'boolean':
      return 'text-info';
    case 'null':
      return 'text-danger';
    case 'number':
      return 'text-primary';
    case 'object':
      return 'text-success';
    case 'string':
      return 'text-white-50';
  }
}
</script>

<template>
  <div class="details-row">
    <span>
      <select @input="updateType" :value="props.item.type" :class="getClassForType(props.item.type)" class="form-control bg-dark border-0">
        <option v-for="t of types" :value="t">{{ t }}</option>
      </select>
    </span>
    <span>
      <label class="text-white-50" v-if="props.parentIsArray">(array item)</label>
      <input v-else spellcheck="false" @input="updateName" :value="props.item.name" class="form-control text-light bg-dark border-0" type="text">
    </span>
    <span>
      <template v-if="props.item.type === 'string'">
        <input @input="updateValue" spellcheck="false" :value="props.item.value" class="form-control text-light bg-dark border-0" type="text">
      </template>

      <template v-if="props.item.type === 'boolean'">
        <div class="check" @click="updateChecked()">
          <i v-if="props.item.value" class="bi-check-square"></i>
          <i v-else class="bi-square"></i>
        </div>
      </template>

      <template v-if="props.item.type === 'number'">
        <input @input="updateValue" :value="props.item.value" class="form-control text-light bg-dark border-0" type="text">
      </template>
    </span>
    <span>
      <template v-if="props.item.type === 'array' || props.item.type === 'object'">
        <button @click="emit('action', props.item, 'search')" class="btn btn-primary"><i class="bi-search"></i></button>
      </template>
      <button @click="emit('action', props.item, 'delete')" class="btn btn-outline-danger"><i class="bi-trash"></i></button>
    </span>
  </div>
</template>

<style scoped>
  span {
    display: flex;
    align-items: center;
  }

  span:last-child {
    justify-content: center;
  }

  .check {
    cursor: pointer;
    font-size: 1.5em;
  }
</style>