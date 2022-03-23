<style scoped>
  .canvas-container {
    height: 400px;
    position: relative;
  }
</style>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4" v-if="state === 0">
      <p class="text-muted user-select-none">Note: This is an experimental tool that may not work on all browsers.</p>
      <DropZone @drop="handleDrop" text="Drop a folder containing a .yyp file here!" />
    </div>

    <div class="p-4 text-muted text-center user-select-none" style="cursor: progress" v-if="state === 1">
      Scanning project, please wait...
    </div>

    <div class="p-4 text-light" v-if="state === 2">
      <h3 class="border-bottom">{{projectTitle}}</h3>

      <h4 class="mt-4">Stats</h4>
      <ul class="text-muted">
        <li>Total assets: <span class="text-primary">{{totalAssets}}</span></li>
        <li>Total lines of GML code: <span class="text-primary">{{totalLinesOfGMLCode}}</span></li>
        <li>Total lines of shader code: <span class="text-primary">{{totalLinesOfShaderCode}}</span></li>
        <hr>
        <li v-for="(type, typeIndex) of Object.keys(assetCounts)" :key="typeIndex">{{assetCounts[type].type}}: <span class="text-primary">{{assetCounts[type].count}}</span></li>
      </ul>

      <h4 class="mt-4 d-flex">
        Asset Distribution

        <div class="form-check form-switch d-inline-block ms-auto fs-6">
          <input v-model="chartModeIsBar" class="form-check-input" type="checkbox" role="switch" id="chart-type">
          <label style="transform: translateY(2px)" class="form-check-label" for="chart-type">{{chartModeIsBar ? 'Bar chart' : 'Pie chart'}}</label>
        </div>
      </h4>
      <div class="canvas-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <div id="analyzer-buttons" class="d-flex justify-content-center mt-5">
        <button @click="reset" class="btn btn-primary mx-3">Reset</button>
        <button @click="generateReport" class="btn btn-primary mx-3">Generate Report</button>
      </div>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Ref, Watch } from 'vue-property-decorator';

import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '../../../components/DropZone.vue';

import { scanDirectory, fileEntryToFile, getFileTypeLines } from './filesystem-utils';
import { getPieConfig, getBarConfig } from './chart-config';

const html2canvas = require('@/assets/scripts/html2canvas.esm').default;

import json5 from 'json5';
import IChart from 'chart.js/auto';
const Chart: typeof IChart = require('chart.js/auto').default;

enum State {
  WAITING_FOR_PROJECT,
  SCANNING,
  SCAN_COMPLETE
}

@Component({
  components: {
    ToolWindow,
    DropZone
  }
})
export default class ProjectAnalyzer extends ToolSuper {
  @Ref() chartCanvas!: HTMLCanvasElement;

  state: State = State.WAITING_FOR_PROJECT;
  chartModeIsBar = true;
  chart!: IChart<any, number[], string>;

  // Map of project folder names to proper asset type strings
  folderToAssetType = {
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
  };

  // Stat vars
  projectTitle = '';
  projectFile = '';
  totalLinesOfGMLCode = 0;
  totalLinesOfShaderCode = 0;
  totalAssets = 0;

  // Stores total asset counts from scan
  assetCounts: { [x: string]: { type: string, count: number; } } = {};

  reset() {
    this.totalAssets = 0;
    this.totalLinesOfGMLCode = 0;
    this.totalLinesOfShaderCode = 0;
    this.state = State.WAITING_FOR_PROJECT;
  }

  async generateReport() {
    const toolWindowLinks: HTMLDivElement = document.querySelector('.card-header > .ms-auto')!;
    toolWindowLinks.style.display = 'none';

    const chartSwitch: HTMLDivElement = document.querySelector('.form-switch')!;
    chartSwitch.style.opacity = '0';

    const analyzerButtons: HTMLDivElement = document.querySelector('#analyzer-buttons')!;
    analyzerButtons.style.opacity = '0';

    const replacementHeaderMatter = document.createElement('div');
    replacementHeaderMatter.className = 'ms-auto text-white';
    replacementHeaderMatter.innerHTML = 'https://chrisanselmo.com/tools/#/project-analyzer';
    replacementHeaderMatter.style.opacity = '0.4';
    document.querySelector('.card-header')!.appendChild(replacementHeaderMatter);

    const cardElement = document.querySelector('.card');
    const canvas: HTMLCanvasElement = await html2canvas(cardElement, { backgroundColor: '#2F2E34' });
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.download = `${this.projectTitle}.png`;
    link.href = image;
    link.click();

    replacementHeaderMatter.remove();
    toolWindowLinks.style.display = 'block';
    chartSwitch.style.opacity = '1';
    analyzerButtons.style.opacity = '1';
  }

  async handleDrop(item: DataTransferItem) {
    // Get access to the local filesystem
    const fileSystemEntry = item.webkitGetAsEntry();
    if (!fileSystemEntry) return;
    
    // Set scanning state and read directory
    this.state = State.SCANNING;
    const result = await scanDirectory(fileSystemEntry);

    // If the item dropped wasn't a single folder then reset
    if (Object.keys(result).length !== 1) return this.state = State.WAITING_FOR_PROJECT;

    // The first item will be the containing folder, which is used as the project title
    this.projectTitle = Object.keys(result)[0];

    // Search for a .yyp file, aka make sure this is a GMS2 project
    const yypFile = Object.keys(result[this.projectTitle]).find(key => key.includes('.yyp'));
    if (!yypFile) return this.state = State.WAITING_FOR_PROJECT;

    // Save the project file name and continue to actually parsing the project for stats
    this.projectFile = yypFile;
    this.parseProject(result);
  }

  async parseProject(map: any) {
    // Get code line totals
    await this.countCodeLines(map);

    // Get asset totals
    await this.handleYYP(map);

    // Show the stats view
    this.state = State.SCAN_COMPLETE;

    // Wait a tick before showing chart (so that the canvas is on the DOM)
    await this.$nextTick();
    this.setupChart();
  }

  async countCodeLines(map: any) {
    // GML
    if (map[this.projectTitle].scripts) {
      this.totalLinesOfGMLCode += await getFileTypeLines(map[this.projectTitle].scripts, '.gml');
    }
    
    if (map[this.projectTitle].objects) {
      this.totalLinesOfGMLCode += await getFileTypeLines(map[this.projectTitle].objects, '.gml');
    }

    if (map[this.projectTitle].rooms) {
      this.totalLinesOfGMLCode += await getFileTypeLines(map[this.projectTitle].rooms, '.gml');
    }

    // Shaders
    if (map[this.projectTitle].shaders) {
      this.totalLinesOfShaderCode += await getFileTypeLines(map[this.projectTitle].shaders, '.fsh');
      this.totalLinesOfShaderCode += await getFileTypeLines(map[this.projectTitle].shaders, '.vsh');
    }
  }

  async handleYYP(map: any) {
    // Read the .yyp file
    const projectFile = map[this.projectTitle][this.projectFile] as FileSystemFileEntry;
    const file = await fileEntryToFile(projectFile);
    const fileText = await file.text();

    // Parse the json with json5 which is forgiving of the invalid syntax that yyp files have
    const json = json5.parse(fileText);
    if (!json.resources) return this.state = State.WAITING_FOR_PROJECT;

    this.totalAssets = json.resources.length;

    // Loop through all the resources to cound the assets
    for (const resource of json.resources)  {
      const assetType: any = resource.id.path.split('/')[0];

      if (this.assetCounts[assetType]) {
        this.assetCounts[assetType].count++;
      } else {
        this.assetCounts[assetType] = {
          type: (this.folderToAssetType as any)[assetType as any] as string,
          count: 1
        };
      }
    }
  }

  @Watch('chartModeIsBar')
  handleChartTypeChange() {
    this.setupChart(this.chart);
  }

  setupChart(existingChart?: IChart<any, number[], string>) {
    if (existingChart) existingChart.destroy();

    const labels = [];
    const dataCounts = [];
    for (const assetCount of Object.values(this.assetCounts)) {
      labels.push(assetCount.type);
      dataCounts.push(assetCount.count);
    }

    const config = this.chartModeIsBar ? getBarConfig(labels, dataCounts) : getPieConfig(labels, dataCounts);
    this.chart = new Chart(this.chartCanvas, config);
  }
}
</script>
