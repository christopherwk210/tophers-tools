<style scoped>
  .canvas-container {
    height: 400px;
    position: relative;
  }
</style>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <DropZone v-if="state === 0" @drop="handleDrop" />

    <div class="p-4 text-muted text-center user-select-none" style="cursor: progress" v-if="state === 1">
      Scanning project, please wait...
    </div>

    <div class="p-4 text-light" v-if="state === 2">
      <h3 class="border-bottom">{{projectTitle}}</h3>

      <h4 class="mt-4">Stats</h4>
      <ul class="text-muted">
        <li>Total assets: <span class="text-primary">{{totalAssets}}</span></li>
        <li>Total lines of GML code: <span class="text-primary">{{totalLinesOfCode}}</span></li>
        <hr>
        <li v-for="(type, typeIndex) of Object.keys(assetCounts)" :key="typeIndex">{{assetCounts[type].type}}: <span class="text-primary">{{assetCounts[type].count}}</span></li>
      </ul>

      <h4 class="mt-4">Asset Distribution</h4>
      <div class="canvas-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <button @click="reset" class="btn btn-primary d-block mx-auto mt-5">Reset</button>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator';

import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from './DropZone.vue';

import { scanDirectory, fileEntryToFile, getFileTypeLines } from './filesystem-utils';

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
  totalLinesOfCode = 0;
  totalAssets = 0;

  // Stores total asset counts from scan
  assetCounts: { [x: string]: { type: string, count: number; } } = {};

  reset() {
    this.state = State.WAITING_FOR_PROJECT;
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
    if (map[this.projectTitle].scripts) {
      this.totalLinesOfCode += await getFileTypeLines(map[this.projectTitle].scripts, '.gml');
    }
    
    if (map[this.projectTitle].objects) {
      this.totalLinesOfCode += await getFileTypeLines(map[this.projectTitle].objects, '.gml');
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

  setupChart() {
    const labels = [];
    const dataCounts = [];
    for (const assetCount of Object.values(this.assetCounts)) {
      labels.push(assetCount.type);
      dataCounts.push(assetCount.count);
    }

    new Chart(this.chartCanvas, {
      type: 'pie',
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      data: {
        labels,
        datasets: [
          {
            label: 'Asset Counts',
            data: dataCounts,
            backgroundColor: [
              '#BE4A2F',
              '#E4A672',
              '#A22633',
              '#FEAE34',
              '#63C74D',
              '#265C42',
              '#124E89',
              '#C0CBDC',
              '#5A6988',
              '#FF0044',
              '#68386C',
              '#B55088',
              '#F6757A',
              '#E8B796'
            ],
            borderWidth: 0
          }
        ]
      }
    });
  }
}
</script>