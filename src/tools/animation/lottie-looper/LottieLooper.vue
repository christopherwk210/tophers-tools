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

      <p class="text-center text-light"><span class="text-muted user-select-none">Loop start frame:</span> {{loopStart}}</p>
      <p class="text-center text-light"><span class="text-muted user-select-none">Current frame:</span> {{currentFrameRounded}}</p>
      <p class="text-center text-light"><span class="text-muted user-select-none">Loop end frame:</span> {{loopEnd}}</p>

      <div class="d-flex justify-content-center">
        <button @click="togglePlayback" class="btn btn-primary mx-3">{{isPaused ? 'Play' : 'Pause'}}</button>
        <button @click="reset" class="btn btn-primary mx-3">Reset</button>
      </div>
    </div>
  </ToolWindow>
</template>

<script lang="ts">
import { Component, Ref, Watch } from 'vue-property-decorator';
import ToolSuper from '@/tools/ToolSuper';
import ToolWindow from '@/components/ToolWindow.vue';
import DropZone from '@/components/DropZone.vue';

import lottie, { AnimationItem } from 'lottie-web';

@Component({
  components: {
    ToolWindow,
    DropZone
  }
})
export default class LottieLooper extends ToolSuper {
  currentLottie: any = false;
  animation!: AnimationItem;
  isPaused = false;

  totalFrames = 0;
  currentFrame = 0;

  loopStart = 0;
  loopEnd = 0;

  animationFrame!: number;

  @Ref() lottieContainer!: HTMLDivElement;

  mounted() {
    this.tick();
  }

  beforeDestroy() {
    cancelAnimationFrame(this.animationFrame);
  }

  @Watch('loopStart')
  handleLoopStartChanged() {
    if (this.animation) {
      this.animation.pause();
      this.isPaused = true;
  
      this.animation.goToAndStop(parseInt(this.loopStart as any), true);
    }
  }

  @Watch('loopEnd')
  handleLoopEndChanged() {
    if (this.animation) {
      this.animation.pause();
      this.isPaused = true;
  
      this.animation.goToAndStop(parseInt(this.loopEnd as any) - 0.1, true);
    }
  }

  tick() {
    if (this.animation) {
      if (this.animation.currentFrame >= this.loopEnd) {
        this.playFromLoopPoint();
      }
      this.currentFrame = this.animation.currentFrame;
    }

    this.animationFrame = requestAnimationFrame(this.tick.bind(this));
  }

  playFromLoopPoint() {
    if (this.animation) {
      this.animation.goToAndPlay(this.loopStart, true);
      this.isPaused = false;
    }
  }

  async handleDrop(item: DataTransferItem) {
    if (item.kind === 'file' && item.type === 'application/json') {
      const file = item.getAsFile();
      
      if (file) {
        const text = await file.text();
        try {
          this.currentLottie = JSON.parse(text);
          await this.$nextTick(); // Wait for DOM to insert lottie container
          this.loadLottie();
        } catch (e) {}
      }
    }
  }

  reset() {
    this.animation = undefined as any;
    this.currentLottie = false;
    this.isPaused = false;

    this.totalFrames = 0;
    this.currentFrame = 0;

    this.loopStart = 0;
    this.loopEnd = 0;
  }

  togglePlayback() {
    if (this.animation) {
      if (this.animation.isPaused) {
        this.animation.play();
        this.isPaused = false;
      } else {
        this.animation.pause();
        this.isPaused = true;
      }
    }
  }

  async loadLottie() {
    this.animation = lottie.loadAnimation({
      container: this.lottieContainer,
      loop: false,
      autoplay: false,
      animationData: this.currentLottie
    });

    this.totalFrames = this.animation.totalFrames - 1;
    this.loopStart = 0;
    this.loopEnd = this.totalFrames;
    this.isPaused = false;

    await this.$nextTick();
    this.animation.goToAndPlay(0);

    this.animation.addEventListener('complete', () => {
      this.animation.goToAndPlay(this.loopStart, true);
    })
  }

  get currentFrameRounded() {
    return Math.round(this.currentFrame);
  }
}
</script>
