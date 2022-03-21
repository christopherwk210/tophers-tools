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

    <div class="p-4 text-muted text-center user-select-none" style="cursor: progress" v-if="state === 1">
      Scanning project, please wait...
    </div>

    <div class="p-4 text-light" v-if="state === 2">
      <h3 class="border-bottom">{{projectTitle}}</h3>

      <h4 class="mt-4">Stats</h4>
      <ul class="text-muted">
        <li>Total assets: <span class="text-primary">{{totalAssets}}</span></li>
        <li>Total lines of code: <span class="text-primary">{{totalLinesOfCode}}</span></li>
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
    ToolWindow
  }
})
export default class ProjectAnalyzer extends ToolSuper {
  @Ref() chartCanvas!: HTMLCanvasElement;

  dragInside = false;
  state: State = State.WAITING_FOR_PROJECT;

  projectTitle = '';
  projectFile = '';
  totalLinesOfCode = 0;
  totalAssets = 0;

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

  assetCounts: { [x: string]: { type: string, count: number; } } = {};

  reset() {
    this.state = State.WAITING_FOR_PROJECT;
  }

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

    if (event.dataTransfer) {
      if (event.dataTransfer.items.length > 0) {
        const item = event.dataTransfer.items[0];
        const fileSystemEntry = item.webkitGetAsEntry();
        if (fileSystemEntry) {
          this.state = State.SCANNING;
          const result = await this.scanProjectDirectory(fileSystemEntry);

          let found = false;
          if (Object.keys(result).length === 1) {
            this.projectTitle = Object.keys(result)[0];
            for (const key of Object.keys(result[this.projectTitle])) {
              if (key.includes('.yyp')) {
                found = true;
                this.projectFile = key;
              }
            }
          }

          if (found) this.handleDirectoryMap(result);
        }
      }
    }
  }

  async handleDirectoryMap(map: any) {
    await this.countCodeLines(map);

    const projectFile = map[this.projectTitle][this.projectFile] as FileSystemFileEntry;
    const file = await this.fileEntryToFile(projectFile);
    const fileText = await file.text();

    const parsedProject = json5.parse(fileText);
    this.handleYYP(parsedProject);

    this.state = State.SCAN_COMPLETE;
    await this.$nextTick();
    this.setupChart();
  }

  async countCodeLines(map: any) {
    if (map[this.projectTitle].scripts) {
      for (const scriptFolder of Object.values(map[this.projectTitle].scripts)) {
        let foundKey = '';
        for (const key of Object.keys(scriptFolder as any)) {
          if (key.includes('.gml')) {
            foundKey = key;
          }
        }

        if (foundKey && (scriptFolder as any)[foundKey]) {
          const fileEntry = (scriptFolder as any)[foundKey] as FileSystemFileEntry;
          const file = await this.fileEntryToFile(fileEntry);
          const gmlText = await file.text();
          this.totalLinesOfCode += gmlText.split(/\r\n|\r|\n/).length;
        }
      }
    }
  }

  async handleYYP(json: any) {
    if (!json.resources) return this.state = State.WAITING_FOR_PROJECT;

    this.totalAssets = json.resources.length;

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
            hoverOffset: 4,
            borderWidth: 0
          }
        ]
      }
    });
  }

  async scanProjectDirectory(entry: FileSystemEntry, data: any = {}) {
    if (entry && entry.isDirectory) {
      const directory = entry as FileSystemDirectoryEntry;
      const directoryReader = directory.createReader();

      data[directory.name] = {};
      const entries = await this.readDirectoryEntriesAsync(directoryReader);
      for (const entry of entries) {
        await this.scanProjectDirectory(entry, data[directory.name]);
      }
    } else {
      data[entry.name] = entry;
    }

    return data;
  }

  readDirectoryEntriesAsync(directoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    return new Promise(resolve => {
      directoryReader.readEntries(entries => {
        resolve(entries);
      });
    });
  }

  fileEntryToFile(file: FileSystemFileEntry): Promise<File> {
    return new Promise(resolve => {
      file.file(f => {
        resolve(f);
      })
    });
  }

  get dropZoneClasses() {
    return {
      'bg-dark': !this.dragInside,
      'bg-primary': this.dragInside
    };
  }
}
</script>