<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';

const { title, about } = useTool();

interface Color {
  name: string;
  ansiCode: string;
  hex: string;
}

const colors: Color[] = [
  {
    name: 'Gray',
    ansiCode: '30',
    hex: '#4f545c'
  },
  {
    name: 'Red',
    ansiCode: '31',
    hex: '#dc322f'
  },
  {
    name: 'Green',
    ansiCode: '32',
    hex: '#859900'
  },
  {
    name: 'Yellow',
    ansiCode: '33',
    hex: '#b58900'
  },
  {
    name: 'Blue',
    ansiCode: '34',
    hex: '#268bd2'
  },
  {
    name: 'Pink',
    ansiCode: '35',
    hex: '#d33682'
  },
  {
    name: 'Cyan',
    ansiCode: '36',
    hex: '#2aa198'
  },
  {
    name: 'White',
    ansiCode: '37',
    hex: '#ffffff'
  }
];

const patterns: { name: string; pattern: string[] }[] = [
  {
    name: 'Rainbow',
    pattern: ['Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Pink']
  },
  {
    name: 'Rainbow Reflection',
    pattern: ['Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Pink', 'Blue', 'Cyan', 'Green', 'Yellow']
  },
  {
    name: 'ANSI Rainbow',
    pattern: ['Red', 'Green', 'Yellow', 'Blue', 'Pink', 'Cyan']
  },
  {
    name: 'Holidays',
    pattern: ['Red', 'Green']
  },
  {
    name: 'Checkers',
    pattern: ['Red', 'Gray']
  },
  {
    name: 'Barber Shop',
    pattern: ['Red', 'Blue', 'White']
  },
  {
    name: 'Dalmatian',
    pattern: ['Gray', 'White']
  },
  {
    name: 'Trans Flag',
    pattern: ['Blue', 'Pink', 'White', 'Pink']
  }
];

const colorPattern = ref<number>(0);

const userText = ref('Hello world!');

const useBold = ref(false);
const useUnderline = ref(false);
const colorModePerWord = ref(false);
const colorRep = ref(1);

const currentPattern = computed(() => patterns[colorPattern.value]);

const previewHTML = computed(() => {
  let colorIndex = 0;
  let repCounter = 0;

  if (colorModePerWord.value) {
    return userText.value.split(' ').map(word => {
      const color = currentPattern.value.pattern[colorIndex % currentPattern.value.pattern.length];
      const hex = colors.find(c => c.name === color)!.hex;

      if (colorRep.value > 1) {
        if (repCounter++ % colorRep.value === colorRep.value - 1) colorIndex++;
      } else {
        colorIndex++;
      }

      return `<span style="color: ${hex}">${word}</span>`;
    }).join(' ');
  } else {
    return userText.value.split('').map(char => {
      const color = currentPattern.value.pattern[colorIndex % currentPattern.value.pattern.length];
      const hex = colors.find(c => c.name === color)!.hex;

      if (char !== ' ') {
        if (colorRep.value > 1) {
          if (repCounter++ % colorRep.value === colorRep.value - 1) colorIndex++;
        } else {
           colorIndex++;
        }
      }

      return `<span style="color: ${hex}">${char}</span>`;
    }).join('');
  }
});

const copied = ref(false);

watch([
  () => userText.value,
  () => useBold.value,
  () => useUnderline.value,
  () => colorModePerWord.value,
  () => colorPattern.value,
  () => colorRep.value
], () => copied.value = false);

async function copy() {
  if (copied.value) return;

  try {
    let text = '```ansi\n';
    let colorIndex = 0;
    let repCounter = 0;

    if (colorModePerWord.value) {
      userText.value.split(' ').map(word => {
        const color = currentPattern.value.pattern[colorIndex % currentPattern.value.pattern.length];
        const ansiCode = colors.find(c => c.name === color)!.ansiCode;

        if (colorRep.value > 1) {
          if (repCounter++ % colorRep.value === colorRep.value - 1) colorIndex++;
        } else {
          colorIndex++;
        }

        if (useBold.value) text += `\x1b[1;${ansiCode}m`;
        if (useUnderline.value) text += `\x1b[4;${ansiCode}m`;
        if (!useBold.value && !useUnderline.value) text += `\x1b[0;${ansiCode}m`;

        text += `${word}\x1b[0m `;
      });
    } else {
      userText.value.split('').map(char => {
        const color = currentPattern.value.pattern[colorIndex % currentPattern.value.pattern.length];
        const ansiCode = colors.find(c => c.name === color)!.ansiCode;

        if (char !== ' ') {
          if (colorRep.value > 1) {
            if (repCounter++ % colorRep.value === colorRep.value - 1) colorIndex++;
          } else {
            colorIndex++;
          }

          if (useBold.value) text += `\x1b[1;${ansiCode}m`;
          if (useUnderline.value) text += `\x1b[4;${ansiCode}m`;
          if (!useBold.value && !useUnderline.value) text += `\x1b[0;${ansiCode}m`;
        }

        text += `${char}\x1b[0m`;
      });
    }

    text += '\n```';

    await navigator.clipboard.writeText(text);
    copied.value = true;
  } catch (e) {}
}

const copyClasses = computed(() => ({
  'btn-success': copied.value,
  'btn-primary': !copied.value
}));
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4">
      <label class="text-light">Pattern</label>
      <select class="form-select text-bg-dark" v-model="colorPattern">
        <option v-for="(pattern, index) of patterns" :value="index">{{ pattern.name }}</option>
      </select>

      <label for="color-rep" class="form-label text-light mt-3 mb-0">
        Color Repetition
        <span class="text-white-50">({{ colorRep === 1 ? 'None' : colorRep }})</span>
      </label>
      <input v-model.number="colorRep" type="range" min="1" max="10" class="form-range" id="color-rep">

      <div class="d-flex gap-4 mt-2">
        <div class="form-check form-switch d-inline-block fs-6 text-light">
          <label style="transform: translateY(2px)" class="form-check-label" for="use-underline">
            <input v-model="useUnderline" class="form-check-input" type="checkbox" role="switch" id="use-underline">
            Underline
          </label>
        </div>
  
        <div class="form-check form-switch d-inline-block fs-6 text-light">
          <label style="transform: translateY(2px)" class="form-check-label" for="use-bold">
            <input v-model="useBold" class="form-check-input" type="checkbox" role="switch" id="use-bold">
            Bold
          </label>
        </div>
  
        <div class="form-check form-switch d-inline-block fs-6 text-light">
          <label style="transform: translateY(2px)" class="form-check-label" for="chart-type">
            <input v-model="colorModePerWord" class="form-check-input" type="checkbox" role="switch" id="chart-type">
            Apply colors per word
          </label>
        </div>
      </div>

      <div class="form-group mt-3">
        <textarea rows="3" v-model="userText" type="text" class="form-control bg-dark text-light border-light"></textarea>
      </div>

      <div :class="{ 'fw-bold': useBold, 'text-decoration-underline': useUnderline }" class="card text-bg-dark mt-3 p-3">
        <pre class="m-0" v-html="previewHTML"></pre>
      </div>

      <button class="btn d-block mx-auto mt-3" :class="copyClasses" @click="copy">{{ copied ? 'Copied!' : 'Copy as formatted text' }}</button>

      <small class="mt-5 text-white-50 text-center d-block">
        This tool couldn't have been made without <a target="_blank" href="https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06">this cool guide</a>.
      </small>
    </div>
  </ToolWindow>
</template>

<style scoped>
  textarea {
    resize: vertical;
  }

  pre {
    white-space: pre-wrap;
    font-size: 0.875rem;
    line-height: 1.125rem;
    text-indent: 0;
  }
</style>