<script setup lang="ts">
import { onMounted, ref, nextTick, onBeforeUnmount, computed, watch } from 'vue';
import { useTool } from '@/tools/use-tool';
import { WEQ8Runtime } from 'weq8';
import type { WEQ8Spec } from 'node_modules/weq8/dist/spec';

import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '@/components/DropZone.vue';
import gml from './gml.txt?raw';

const { title, about } = useTool();

const weqUI = ref();

const audioContext = ref<AudioContext>();
const audioSourceNode = ref<AudioBufferSourceNode>();
const runtime = ref<WEQ8Runtime>();

const audioLoaded = ref(false);
const audioPlaying = ref(false);

const eqStruct = ref({
  locut: {
    cutoff: 10,
    q: 1
  },
  loshelf: {
    freq: 50,
    q: 1,
    gain: 0
  },
  eq1: {
    freq: 145,
    q: 0.7,
    gain: 0
  },
  eq2: {
    freq: 350,
    q: 0.7,
    gain: 0
  },
  eq3: {
    freq: 770,
    q: 0.7,
    gain: 0
  },
  eq4: {
    freq: 1900,
    q: 0.7,
    gain: 0
  },
  hishelf: {
    freq: 5200,
    q: 1,
    gain: 0
  },
  hicut: {
    cutoff: 20000,
    q: 1
  }
});

const weq8Spec: WEQ8Spec = [
  { type: 'highpass12', frequency: 10, gain: 0, Q: 1, bypass: false }, // locut
  { type: 'lowshelf12', frequency: 50, gain: 0, Q: 1, bypass: false }, // loshelf
  { type: 'peaking12', frequency: 145, gain: 0, Q: 0.7, bypass: false }, // eq1
  { type: 'peaking12', frequency: 350, gain: 0, Q: 0.7, bypass: false }, // eq2
  { type: 'peaking12', frequency: 770, gain: 0, Q: 0.7, bypass: false }, // eq3
  { type: 'peaking12', frequency: 1_900, gain: 0, Q: 0.7, bypass: false }, // eq4
  { type: 'highshelf12', frequency: 5_200, gain: 0, Q: 1, bypass: false }, // hishelf
  { type: 'lowpass12', frequency: 20_000, gain: 0, Q: 1, bypass: false } //hicut
];

const updateInterval = ref();

onMounted(() => {
  audioContext.value = new AudioContext();
  audioSourceNode.value = audioContext.value.createBufferSource();
  audioSourceNode.value.loop = true;

  runtime.value = new WEQ8Runtime(audioContext.value, weq8Spec, ['highpass12', 'lowshelf12', 'peaking12', 'highshelf12', 'lowpass12']);
  audioSourceNode.value.connect(runtime.value.input);
  runtime.value.connect(audioContext.value.destination);

  updateInterval.value = setInterval(() => updateStruct(), 1000 / 24);
});

onBeforeUnmount(() => {
  audioSourceNode.value?.stop();
  audioSourceNode.value?.disconnect();
  audioContext.value?.close();

  clearInterval(updateInterval.value);
});

async function handleDrop(item: DataTransferItem) {
  if (item.kind !== 'file') return;
  if (!item.type.startsWith('audio/')) return;

  const file = item.getAsFile();
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.value!.decodeAudioData(buffer);
  audioSourceNode.value!.buffer = audioBuffer;
  audioLoaded.value = true;

  await nextTick();
  weqUI.value!.runtime = runtime.value;
  audioSourceNode.value!.start();
  audioPlaying.value = true;
}

function play() {
  audioContext.value!.resume();
  audioPlaying.value = true;
}

function pause() {
  audioContext.value!.suspend();
  audioPlaying.value = false;
}

function updateStruct() {
  if (!runtime.value || !(runtime.value as any).filterbank) return;

  (runtime.value as any).filterbank.forEach((filter: any, index: number) => {
    const filterNode: BiquadFilterNode = filter.filters[0];

    switch (index) {
      case 0: // locut (highpass12)
        eqStruct.value.locut.cutoff = filterNode.frequency.value;
        eqStruct.value.locut.q = filterNode.Q.value;
        break;
      case 1: // loshelf (lowshelf12)
        eqStruct.value.loshelf.freq = filterNode.frequency.value;
        eqStruct.value.loshelf.q = filterNode.Q.value;
        eqStruct.value.loshelf.gain = filterNode.gain.value;
        break;
      case 2: // eq1 (peaking12)
        eqStruct.value.eq1.freq = filterNode.frequency.value;
        eqStruct.value.eq1.q = filterNode.Q.value;
        eqStruct.value.eq1.gain = filterNode.gain.value;
        break;
      case 3: // eq2 (peaking12)
        eqStruct.value.eq2.freq = filterNode.frequency.value;
        eqStruct.value.eq2.q = filterNode.Q.value;
        eqStruct.value.eq2.gain = filterNode.gain.value;
        break;
      case 4: // eq3 (peaking12)
        eqStruct.value.eq3.freq = filterNode.frequency.value;
        eqStruct.value.eq3.q = filterNode.Q.value;
        eqStruct.value.eq3.gain = filterNode.gain.value;
        break;
      case 5: // eq4 (peaking12)
        eqStruct.value.eq4.freq = filterNode.frequency.value;
        eqStruct.value.eq4.q = filterNode.Q.value;
        eqStruct.value.eq4.gain = filterNode.gain.value;
        break;
      case 6: // hishelf (highshelf12)
        eqStruct.value.hishelf.freq = filterNode.frequency.value;
        eqStruct.value.hishelf.q = filterNode.Q.value;
        eqStruct.value.hishelf.gain = filterNode.gain.value;
        break;
      case 7: // hicut (lowpass12)
        eqStruct.value.hicut.cutoff = filterNode.frequency.value;
        eqStruct.value.hicut.q = filterNode.Q.value;
        break;
    }
  });
}

const copied = ref(false);

const gmlCode = computed(() => {
  return gml
    .replace(/LOCUT_CUTOFF/g, eqStruct.value.locut.cutoff.toFixed(2))
    .replace(/LOCUT_Q/g, eqStruct.value.locut.q.toFixed(2))

    .replace(/LOSHELF_FREQ/g, eqStruct.value.loshelf.freq.toFixed(2))
    .replace(/LOSHELF_Q/g, eqStruct.value.loshelf.q.toFixed(2))
    .replace(/LOSHELF_GAIN/g, eqStruct.value.loshelf.gain.toFixed(2))

    .replace(/EQ1_FREQ/g, eqStruct.value.eq1.freq.toFixed(2))
    .replace(/EQ1_Q/g, eqStruct.value.eq1.q.toFixed(2))
    .replace(/EQ1_GAIN/g, eqStruct.value.eq1.gain.toFixed(2))

    .replace(/EQ2_FREQ/g, eqStruct.value.eq2.freq.toFixed(2))
    .replace(/EQ2_Q/g, eqStruct.value.eq2.q.toFixed(2))
    .replace(/EQ2_GAIN/g, eqStruct.value.eq2.gain.toFixed(2))

    .replace(/EQ3_FREQ/g, eqStruct.value.eq3.freq.toFixed(2))
    .replace(/EQ3_Q/g, eqStruct.value.eq3.q.toFixed(2))
    .replace(/EQ3_GAIN/g, eqStruct.value.eq3.gain.toFixed(2))

    .replace(/EQ4_FREQ/g, eqStruct.value.eq4.freq.toFixed(2))
    .replace(/EQ4_Q/g, eqStruct.value.eq4.q.toFixed(2))
    .replace(/EQ4_GAIN/g, eqStruct.value.eq4.gain.toFixed(2))

    .replace(/HISHELF_FREQ/g, eqStruct.value.hishelf.freq.toFixed(2))
    .replace(/HISHELF_Q/g, eqStruct.value.hishelf.q.toFixed(2))
    .replace(/HISHELF_GAIN/g, eqStruct.value.hishelf.gain.toFixed(2))

    .replace(/HICUT_CUTOFF/g, eqStruct.value.hicut.cutoff.toFixed(2))
    .replace(/HICUT_Q/g, eqStruct.value.hicut.q.toFixed(2));
});

watch(() => gmlCode.value, () => copied.value = false);

async function copy() {
  if (copied.value) return;
  await navigator.clipboard.writeText(gmlCode.value);
  copied.value = true;
}

const copyClasses = computed(() => ({
  'btn-success': copied.value,
  'btn-primary': !copied.value
}));
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div v-if="!audioLoaded" class="p-4">
      <DropZone @drop="handleDrop" text="Drop an audio file here!" />
    </div>

    <div v-else class="p-4">
      <weq8-ui ref="weqUI" />

      <div class="controls text-light">
        <i v-if="audioPlaying" @click="pause" class="bi-pause-fill"></i>
        <i v-else @click="play" class="bi-play-fill"></i>
      </div>

      <button class="btn d-block mx-auto" :class="copyClasses" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</button>
      <div class="code-card card mt-3 bg-dark">
        <code><pre class="p-3" v-text="gmlCode"></pre></code>
      </div>
    </div>
  </ToolWindow>
</template>

<style>
  .controls {
    font-size: 48px;
    text-align: center;
  }

  [class^="bi-"] {
    cursor: pointer;
  }

  .code-card {
    max-height: 300px;
    overflow: auto;
  }
</style>