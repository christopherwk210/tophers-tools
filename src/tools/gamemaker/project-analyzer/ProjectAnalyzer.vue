<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import { scanDirectory, fileEntryToFile, getFileTypeLines } from './filesystem-utils';
import { getPieConfig, getBarConfig } from './chart-config';
import json5 from 'json5';
import Chart from 'chart.js/auto';
import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '@/components/DropZone.vue';

// @ts-ignore
import html2canvas from '@/assets/scripts/html2canvas.esm.js';

enum State {
  WAITING_FOR_PROJECT,
  SCANNING,
  SCAN_COMPLETE
}

const { title, about } = useTool();

const chartCanvas = ref<HTMLCanvasElement>();

const state = ref<State>(State.WAITING_FOR_PROJECT);
const chartModeIsBar = ref(false);
const chart = ref<Chart<any, number[], string>>();

// Map of project folder names to proper asset type strings
const folderToAssetType = ref({
  extensions: 'Extensions',
  tilesets: 'Tile Sets',
  scripts: 'Scripts',
  fonts: 'Fonts',
  timelines: 'Timelines',
  objects: 'Objects',
  sequences: 'Sequences',
  shaders: 'Shaders',
  rooms: 'Rooms',
  sounds: 'Sounds',
  animcurves: 'Animation Curves',
  paths: 'Paths',
  notes: 'Notes',
  sprites: 'Sprites'
});

// Stat vars
const projectTitle = ref('');
const projectFile = ref('');
const totalLinesOfGMLCode = ref(0);
const totalLinesOfShaderCode = ref(0);
const totalAssets = ref(0);

// Stores total asset counts from scan
const assetCounts = ref<{ [x: string]: { type: string, count: number; } }>({});

function reset() {
  totalAssets.value = 0;
  totalLinesOfGMLCode.value = 0;
  totalLinesOfShaderCode.value = 0;
  state.value = State.WAITING_FOR_PROJECT;
}

async function generateReport() {
  const toolWindowLinks: HTMLDivElement = document.querySelector('.card-header > .controls')!;
  toolWindowLinks.style.display = 'none';

  const chartSwitch: HTMLDivElement = document.querySelector('.form-switch')!;
  chartSwitch.style.opacity = '0';

  const analyzerButtons: HTMLDivElement = document.querySelector('#analyzer-buttons')!;
  analyzerButtons.style.opacity = '0';

  const replacementHeaderMatter = document.createElement('div');
  replacementHeaderMatter.className = 'ms-auto text-white';
  replacementHeaderMatter.innerHTML = 'https://topheranselmo.com/tools/project-analyzer';
  replacementHeaderMatter.style.opacity = '0.4';
  document.querySelector('.card-header')!.appendChild(replacementHeaderMatter);

  const cardElement = document.querySelector('.card');
  const canvas: HTMLCanvasElement = await html2canvas(cardElement, { backgroundColor: '#2F2E34' });
  const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
  const link = document.createElement('a');
  link.download = `${projectTitle.value}.png`;
  link.href = image;
  link.click();

  replacementHeaderMatter.remove();
  toolWindowLinks.style.display = 'block';
  chartSwitch.style.opacity = '1';
  analyzerButtons.style.opacity = '1';
}

async function handleDrop(item: DataTransferItem) {
  // Get access to the local filesystem
  const fileSystemEntry = item.webkitGetAsEntry();
  if (!fileSystemEntry) return;
  
  // Set scanning state and read directory
  state.value = State.SCANNING;
  const result = await scanDirectory(fileSystemEntry);

  // If the item dropped wasn't a single folder then reset
  if (Object.keys(result).length !== 1) return state.value = State.WAITING_FOR_PROJECT;

  // The first item will be the containing folder, which is used as the project title
  projectTitle.value = Object.keys(result)[0];

  // Search for a .yyp file, aka make sure this is a GMS2 project
  const yypFile = Object.keys(result[projectTitle.value]).find(key => key.includes('.yyp'));
  if (!yypFile) return state.value = State.WAITING_FOR_PROJECT;

  // Save the project file name and continue to actually parsing the project for stats
  projectFile.value = yypFile;
  parseProject(result);
}

async function parseProject(map: any) {
  // Get code line totals
  await countCodeLines(map);

  // Get asset totals
  await handleYYP(map);

  // Show the stats view
  state.value = State.SCAN_COMPLETE;

  // Wait a tick before showing chart (so that the canvas is on the DOM)
  await nextTick();
  setupChart();
}

async function countCodeLines(map: any) {
  // GML
  if (map[projectTitle.value].scripts) {
    totalLinesOfGMLCode.value += await getFileTypeLines(map[projectTitle.value].scripts, '.gml');
  }
  
  if (map[projectTitle.value].objects) {
    totalLinesOfGMLCode.value += await getFileTypeLines(map[projectTitle.value].objects, '.gml');
  }

  if (map[projectTitle.value].rooms) {
    totalLinesOfGMLCode.value += await getFileTypeLines(map[projectTitle.value].rooms, '.gml');
  }

  // Shaders
  if (map[projectTitle.value].shaders) {
    totalLinesOfShaderCode.value += await getFileTypeLines(map[projectTitle.value].shaders, '.fsh');
    totalLinesOfShaderCode.value += await getFileTypeLines(map[projectTitle.value].shaders, '.vsh');
  }
}

async function handleYYP(map: any) {
  // Read the .yyp file
  const yprojectFile = map[projectTitle.value][projectFile.value] as FileSystemFileEntry;
  const file = await fileEntryToFile(yprojectFile);
  const fileText = await file.text();

  // Parse the json with json5 which is forgiving of the invalid syntax that yyp files have
  const json = json5.parse(fileText);
  if (!json.resources) return state.value = State.WAITING_FOR_PROJECT;

  totalAssets.value = json.resources.length;

  // Loop through all the resources to cound the assets
  for (const resource of json.resources)  {
    const assetType: any = resource.id.path.split('/')[0];

    if (assetCounts.value[assetType]) {
      assetCounts.value[assetType].count++;
    } else {
      assetCounts.value[assetType] = {
        type: (folderToAssetType.value as any)[assetType as any] as string,
        count: 1
      };
    }
  }
}

watch(() => chartModeIsBar.value, () => setupChart(chart.value));

async function setupChart(existingChart?: Chart<any, number[], string>) {
  await nextTick();
  if (!chartCanvas.value) return;
  if (existingChart) existingChart.destroy();

  const labels = [];
  const dataCounts = [];
  for (const assetCount of Object.values(assetCounts.value)) {
    labels.push(assetCount.type);
    dataCounts.push(assetCount.count);
  }
  
  const config = chartModeIsBar.value ? getBarConfig(labels, dataCounts) : getPieConfig(labels, dataCounts);
  chart.value = new Chart(chartCanvas.value, config);
}
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4" v-if="state === 0">
      <p class="text-white-50 user-select-none">Note: This is an experimental tool that may not work on all browsers.</p>
      <DropZone @drop="handleDrop" text="Drop a folder containing a .yyp file here!" />
    </div>

    <div class="p-4 text-white-50 text-center user-select-none" style="cursor: progress" v-if="state === 1">
      Scanning project, please wait...
    </div>

    <div class="p-4 text-light" v-if="state === 2">
      <h3 class="border-bottom">{{projectTitle}}</h3>

      <h4 class="mt-4">Stats</h4>
      <ul class="text-white-50">
        <li>Total assets: <span class="text-primary">{{totalAssets}}</span></li>
        <li>Total lines of GML code: <span class="text-primary">{{totalLinesOfGMLCode}}</span></li>
        <li>Total lines of shader code: <span class="text-primary">{{totalLinesOfShaderCode}}</span></li>
        <hr>
        <li v-for="(type, typeIndex) of Object.keys(assetCounts)" :key="typeIndex">{{assetCounts[type].type}}: <span class="text-primary">{{assetCounts[type].count}}</span></li>
      </ul>

      <h4 class="mt-4 d-flex">
        Asset Distribution

        <div class="form-check form-switch d-inline-block ms-auto fs-6">
          <label style="transform: translateY(2px)" class="form-check-label" for="chart-type">
            <input v-model="chartModeIsBar" class="form-check-input" type="checkbox" role="switch" id="chart-type">
            {{ chartModeIsBar ? 'Bar chart' : 'Pie chart' }}
          </label>
        </div>
      </h4>
      <div class="canvas-container">
        <canvas :key="+chartModeIsBar" ref="chartCanvas"></canvas>
      </div>
      
      <div id="analyzer-buttons" class="d-flex justify-content-center mt-5">
        <button @click="reset" class="btn btn-primary mx-3">Reset</button>
        <button @click="generateReport" class="btn btn-primary mx-3">Generate Report</button>
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .canvas-container {
    height: 400px;
    position: relative;
  }
</style>