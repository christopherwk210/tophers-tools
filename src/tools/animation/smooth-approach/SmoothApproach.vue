<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { smoothApproach } from './smooth-approach';
import { useTool } from '@/tools/use-tool';
import ToolWindow from '@/components/ToolWindow.vue';
import SmoothApproachCodeSelector from './SmoothApproachCodeSelector.vue';

const { title, about } = useTool();

const fps = ref(60);
const threshold = ref(0.0005);
const speed = ref(0.1);
const loop = ref(false);

const interval = ref<number>();

const ballTrack = ref<HTMLDivElement>();
const ballWidth = ref(50);
const ballX = ref(0);
const ballXTarget = ref(0);

const resizeListener = ref<() => void>();

watch(() => fps.value, () => {
  if (fps.value < 1) {
    fps.value = 1;
  } else if (fps.value > 300) {
    fps.value = 300;
  }

  fps.value = Math.floor(fps.value);
  resetAnimation();
});

watch(() => threshold.value, () => {
  if (threshold.value < 0) {
    threshold.value = 0;
  }
});

watch(() => speed.value, () => {
  if (speed.value > 1) {
    speed.value = 1;
  } else if (speed.value < 0) {
    speed.value = 0;
    resetAnimation();
  }
});

onMounted(() => {
  calculateTarget();
  resizeListener.value = () => {
    resetAnimation();
    calculateTarget();
  };
  window.addEventListener('resize', resizeListener.value);
});

onBeforeUnmount(() => {
  resetAnimation();
  if (resizeListener.value) window.removeEventListener('resize', resizeListener.value);
});

function calculateTarget() {
  if (!ballTrack.value) return;

  const { width } = ballTrack.value.getBoundingClientRect();
  ballXTarget.value = width - ballWidth.value;
}

function play() {
  resetAnimation();
  interval.value = setInterval(() => animate(), 1000 / fps.value);
}

function resetEverything() {
  resetAnimation();
  resetValues();
  loop.value = false;
}

function resetValues() {
  fps.value = 60;
  threshold.value = 0.0005;
  speed.value = 0.1;
}

function resetAnimation() {
  clearInterval(interval.value);
  ballX.value = 0;
}

function animate() {
  ballX.value = smoothApproach(ballX.value, ballXTarget.value, speed.value, threshold.value);

  if (ballX.value === ballXTarget.value) {
    if (loop.value) {
      ballX.value = 0;
    } else {
      clearInterval(interval.value);
    }
  }
}

const ballStyle = computed(() => ({
  transform: `translateX(${ballX.value}px)`
}));

const loopClasses = computed(() => ({
  'btn-success': loop.value,
  'active': loop.value,
  'btn-outline-primary': !loop.value
}));
</script>

<template>
  <ToolWindow :title="title" :aboutLink="about" backRoute="/">
    <div class="p-4 text-light">
      <div ref="ballTrack" class="ball-track position-relative pb-3">
        <div class="ball" :style="ballStyle"></div>
      </div>

      <div class="container p-0">
        <div class="row">
          <div class="col-sm-4 mb-3">
            <label>FPS:</label>
            <input v-model.number="fps" type="text" class="form-control bg-dark text-light border-light">
          </div>
          <div class="col-sm-4 mb-3">
            <label>Threshold:</label>
            <input v-model.number="threshold" type="text" class="form-control bg-dark text-light border-light">
          </div>
          <div class="col-sm-4 mb-3">
            <label>Speed:</label>
            <input v-model.number="speed" type="text" class="form-control bg-dark text-light border-light">
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <button @click="play" class="btn btn-primary mx-3">Play</button>
        <button @click="loop = !loop" class="btn mx-3" :class="loopClasses">{{ loop ? 'Loop On' : 'Loop Off' }}</button>
        <button @click="resetEverything" class="btn btn-primary mx-3">Reset</button>
      </div>
      <SmoothApproachCodeSelector />
    </div>
  </ToolWindow>
</template>

<style scoped>
  .ball {
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 50%;
  }
</style>