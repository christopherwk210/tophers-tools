<style lang="scss" src="./assets/styles/global.scss"></style>

<style scoped>
  #app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBar from '@/components/NavBar.vue';

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {
  mounted() {
    // Prevent global file drops
    window.addEventListener('dragover', e => e.preventDefault(), false);
    window.addEventListener('drop', e => e.preventDefault(), false);
  }
}
</script>