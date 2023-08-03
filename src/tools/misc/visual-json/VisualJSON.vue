<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import { useTool } from '@/tools/use-tool';
import { getItemsFromPath, resolvePath, mutatePath, renameObjKey, type Item } from './utils';

import ToolWindow from '@/components/ToolWindow.vue';
import DetailsRow from './DetailsRow.vue';
import InvalidJSON from './InvalidJSON.vue';

const { title, about } = useTool();

const tabs = ['Visual', 'Code'];
const currentTab = ref(0);
const path = ref('/');

const parent = ref({});

const json = ref<string>(JSON.stringify({
  sampleText: 'hello world',
  sampleNumber: 100,
  sampleBool: true,
  empty: null,
  obj: {
    value1: 10,
    value2: 20,
    value3: {
      hello: 'world'
    }
  },
  list: [true, false, null]
}, null, 2));

watch(() => path.value, () => {
  parent.value = resolvePath(parsedObject.value, path.value);
});

const parentIsArray = computed(() => {
  return Array.isArray(parent.value);
});

const jsonIsValid = computed(() => {
  try {
    JSON.parse(json.value);
    return true;
  } catch (e) {
    return false;
  }
});

const currentItems = computed(() => {
  return getItemsFromPath(parsedObject.value, path.value);
});

const parsedObject = computed(() => {
  try {
    return JSON.parse(json.value);
  } catch (e) {
    return {};
  }
});

function handleUpdate(original: Item, updated: Item, change: 'name' | 'type' | 'value') {
  const obj = parsedObject.value;
  const target = resolvePath(obj, path.value);
  
  if (change === 'name') {
    if (target[updated.name]) return;

    const result = renameObjKey(target, original.name, updated.name);
    const mutatedObj = mutatePath(obj, path.value, result);

    json.value = JSON.stringify(mutatedObj, null, 2);
    return;
  } else if (change === 'value') {
    target[updated.name] = updated.value;
  } else if (change === 'type') {
    switch (updated.type) {
      case 'array':
        target[updated.name] = [];
        break;
      case 'boolean':
        target[updated.name] = false;
        break;
      case 'null':
        target[updated.name] = null;
        break;
      case 'number':
        target[updated.name] = 0;
        break;
      case 'object':
        target[updated.name] = {};
        break;
      case 'string':
        target[updated.name] = '';
        break;
    }
  }

  json.value = JSON.stringify(obj, null, 2);
}

function handleAction(item: Item, action: 'delete' | 'search') {
  if (action === 'delete') {
    const obj = parsedObject.value;
    const target = resolvePath(obj, path.value);
    delete target[item.name];

    json.value = JSON.stringify(obj, null, 2);
  } else if (action === 'search') {
    if (path.value === '/') {
      path.value = `/${item.name}`;
    } else {
      path.value = `${path.value}/${item.name}`;
    }
  }
}

function goUpOneLevel() {
  if (path.value === '/') return path.value = '/';
  path.value = path.value.split('/').slice(0, -1).join('/');
  if (path.value === '') path.value = '/';
}
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="pt-2 text-light">
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="(tab, tabIndex) of tabs">
          <a class="nav-link" :class="{ active: tabIndex === currentTab }" href="#" @click.prevent="currentTab = tabIndex">{{ tab }}</a>
        </li>
      </ul>

      <div class="tab-content" v-if="currentTab === 0">
        <InvalidJSON v-model="json" v-if="!jsonIsValid" />

        <template v-else>
          <div class="d-flex">
            <!-- <i class="btn-link cursor-pointer"><i class="bi-arrow-left"></i></i>
            <i class="btn-link cursor-pointer"><i class="bi-arrow-right"></i></i> -->
            <i @click="goUpOneLevel()" class="btn-link cursor-pointer"><i class="bi-arrow-up"></i></i>
            <!-- <div></div> -->
            <input :value="path" class="form-control text-light bg-dark border-0" type="text">
          </div>
          <div class="details flex-grow-1">
            <div class="details-row header-row">
              <span>Type</span>
              <span>Name</span>
              <span>Value</span>
              <span>Actions</span>
            </div>

            <DetailsRow @action="handleAction" @update="handleUpdate" v-for="item of currentItems" :item="item" :parentIsArray="parentIsArray" />
          </div>
        </template>
      </div>

      <div class="tab-content" v-if="currentTab === 1">
        <VAceEditor
          v-model:value="json"
          theme="github_dark"
          lang="json"
          :options="{
            useWorker: true,
            fontSize: '16px'
          }"
          style="height: 600px"
        />
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .tab-content {
    height: 600px;
    display: flex;
    flex-direction: column;
  }

  textarea {
    resize: none;
    width: 100%;
    flex: 1;
  }

  .btn-link {
    height: 100%;
    font-size: 18px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    flex-shrink: 0;
  }

  .btn-link:hover {
    background-color: rgba(0, 0, 0, 0.2);
    color: white !important;
  }

  input {
    outline: none !important;
    box-shadow: none !important;
  }

  .details {
    overflow: auto;
  }

  .details-row, :deep(.details-row) {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 10fr 30fr 50fr 10fr;
    padding: 0.25rem 0.5rem;
    user-select: none;
    gap: 1rem;
  }

  .header-row {
    user-select: none;
    opacity: 0.5;
  }
</style>