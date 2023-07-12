import './assets/styles/global.scss';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.directive('focus-select', el => {
  el.addEventListener('focus', () => el.select && el.select());
});

app.use(router);
app.mount('#app');
