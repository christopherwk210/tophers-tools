<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useTool } from '@/tools/use-tool';
import lottie, { type AnimationItem } from 'lottie-web';

import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '@/components/DropZone.vue';

const { title, about } = useTool();

const currentLottie = ref(false);
const animation = ref<AnimationItem>();
const isPaused = ref(false);

const totalFrames = ref(0);
const currentFrame = ref(0);

const loopStart = ref(0);
const loopEnd = ref(0);

const animationFrame = ref(0);

const lottieContainer = ref<HTMLDivElement>();

onMounted(() => tick());
onBeforeUnmount(() => cancelAnimationFrame(animationFrame.value));

watch(() => loopStart.value, () => {
  if (!animation.value) return;

  animation.value.pause();
  isPaused.value = true;

  animation.value.goToAndStop(parseInt(loopStart.value as any), true);
});

watch(() => loopEnd.value, () => {
  if (!animation.value) return;

  animation.value.pause();
  isPaused.value = true;

  animation.value.goToAndStop(parseInt(loopEnd.value as any), true);
});

function tick() {
  if (animation.value) {
    if (animation.value.currentFrame >= loopEnd.value) {
      playFromLoopPoint();
    }

    currentFrame.value = animation.value.currentFrame;
  }

  animationFrame.value = requestAnimationFrame(tick);
}

function playFromLoopPoint() {
  if (!animation.value) return;

  animation.value.goToAndPlay(loopStart.value, true);
  isPaused.value = false;
}

async function handleDrop(item: DataTransferItem) {
  if (item.kind === 'file' && item.type === 'application/json') {
    const file = item.getAsFile();
    
    if (file) {
      const text = await file.text();
      try {
        currentLottie.value = JSON.parse(text);
        await nextTick() // Wait for DOM to insert lottie container
        loadLottie();
      } catch (e) {}
    }
  }
}

function reset() {
  animation.value = undefined;
  currentLottie.value = false;
  isPaused.value = false;

  totalFrames.value = 0;
  currentFrame.value = 0;

  loopStart.value = 0;
  loopEnd.value = 0;
}

function togglePlayback() {
  if (!animation.value) return;

  if (animation.value.isPaused) {
    animation.value.play();
    isPaused.value = false;
  } else {
    animation.value.pause();
    isPaused.value = true;
  }
}

async function loadLottie() {
  if (!lottieContainer.value) return;

  animation.value = lottie.loadAnimation({
    container: lottieContainer.value,
    loop: false,
    autoplay: false,
    animationData: currentLottie.value
  });

  totalFrames.value = animation.value.totalFrames - 1;
  loopStart.value = 0;
  loopEnd.value = totalFrames.value;
  isPaused.value = false;

  await nextTick();
  animation.value.goToAndPlay(0);

  animation.value.addEventListener('complete', () => {
    if (animation.value) animation.value.goToAndPlay(loopStart.value, true);
  });
}

const currentFrameRounded = computed(() => Math.round(currentFrame.value));
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div v-if="!currentLottie" class="p-4">
      <DropZone @drop="handleDrop" text="Drop a lottie .json file here!" />
    </div>

    <div v-if="currentLottie" class="p-4">
      <div ref="lottieContainer" class="lottie-container"></div>
      <input type="range" @pointerup="playFromLoopPoint" class="range-start form-range" min="0" :max="totalFrames" step="1" v-model="loopStart">
      <input type="range" class="form-range pe-none" min="0" :max="totalFrames" step="1" :value="currentFrame">
      <input type="range" @pointerup="playFromLoopPoint" class="range-end form-range" min="0" :max="totalFrames" step="1" v-model="loopEnd">

      <p class="text-center text-light"><span class="text-white-50 user-select-none">Loop start frame:</span> {{loopStart}}</p>
      <p class="text-center text-light"><span class="text-white-50 user-select-none">Current frame:</span> {{currentFrameRounded}}</p>
      <p class="text-center text-light"><span class="text-white-50 user-select-none">Loop end frame:</span> {{loopEnd}}</p>

      <div class="d-flex justify-content-center">
        <button @click="togglePlayback" class="btn btn-primary mx-3">{{isPaused ? 'Play' : 'Pause'}}</button>
        <button @click="reset" class="btn btn-primary mx-3">Reset</button>
      </div>
    </div>
  </ToolWindow>
</template>

<style scoped>
  .lottie-container {
    height: 300px;
  }

  .form-range.pe-none {
    filter: invert(1) hue-rotate(180deg);
  }

  .range-start {
    filter: hue-rotate(280deg);
  }

  .range-end {
    filter: hue-rotate(150deg);
  }
</style>