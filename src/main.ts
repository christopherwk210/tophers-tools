import 'nprogress/nprogress.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles/global.scss';
import 'weq8/ui';


import ace from 'ace-builds';
import workerJsonUrl from 'ace-builds/src-noconflict/worker-json?url';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github_dark';
ace.config.setModuleUrl('ace/mode/json_worker', workerJsonUrl);

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.directive('focus-select', el => {
  el.addEventListener('focus', () => el.select && el.select());
});

app.use(router);
app.mount('#app');
