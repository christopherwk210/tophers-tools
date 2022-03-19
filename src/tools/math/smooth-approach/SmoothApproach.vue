<style scoped>
  .ball {
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 50%;
  }
</style>

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
        <button @click="loop = !loop" class="btn mx-3" :class="loopClasses">{{loop ? 'Loop On' : 'Loop Off'}}</button>
        <button @click="resetEverything" class="btn btn-primary mx-3">Reset</button>
      </div>
      <SmoothApproachCodeSelector />
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Ref, Watch } from 'vue-property-decorator';
import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';
import SmoothApproachCodeSelector from './SmoothApproachCodeSelector.vue';

import { smoothApproach } from './smooth-approach';

@Component({
  components: {
    ToolWindow,
    SmoothApproachCodeSelector
  }
})
export default class SmoothApproach extends ToolSuper {
  fps = 60;
  threshold = 0.0005;
  speed = 0.1;
  loop = false;

  interval!: number;

  @Ref() ballTrack!: HTMLDivElement;
  ballWidth = 50;
  ballX = 0;
  ballXTarget = 0;

  resizeListener!: () => void;

  @Watch('fps')
  handleFPSUpdate() {
    if (this.fps < 1) {
      this.fps = 1;
    } else if (this.fps > 300) {
      this.fps = 300;
    }

    this.fps = Math.floor(this.fps);
    this.resetAnimation();
  }

  @Watch('threshold')
  handleThresholdUpdate() {
    if (this.threshold < 0) {
      this.threshold = 0;
    }
  }

  @Watch('speed')
  handleSpeedUpdate() {
    if (this.speed > 1) {
      this.speed = 1;
    } else if (this.speed < 0) {
      this.speed = 0;
      this.resetAnimation();
    }
  }

  mounted() {
    this.calculateTarget();
    this.resizeListener = () => {
      this.resetAnimation();
      this.calculateTarget();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  beforeDestroy() {
    this.resetAnimation();
    window.removeEventListener('resize', this.resizeListener);
  }

  calculateTarget() {
    const { width } = this.ballTrack.getBoundingClientRect();
    this.ballXTarget = width - this.ballWidth;
  }

  play() {
    this.resetAnimation();
    this.interval = setInterval(this.animate.bind(this), 1000 / this.fps)
  }

  resetEverything() {
    this.resetAnimation();
    this.resetValues();
    this.loop = false;
  }

  resetValues() {
    this.fps = 60;
    this.threshold = 0.0005;
    this.speed = 0.1;
  }

  resetAnimation() {
    clearInterval(this.interval);
    this.ballX = 0;
  }

  animate() {
    this.ballX = smoothApproach(this.ballX, this.ballXTarget, this.speed, this.threshold);
    if (this.ballX === this.ballXTarget) {
      if (this.loop) {
        this.ballX = 0;
      } else {
        clearInterval(this.interval);
      }
    }
  }

  get ballStyle() {
    return {
      transform: `translateX(${this.ballX}px)`
    }
  }

  get loopClasses() {
    return {
      'btn-outline-primary': !this.loop,
      'btn-success': this.loop,
      'active': this.loop
    }
  }
}
</script>