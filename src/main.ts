import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.directive('focus-select', {
  bind: element => {
    element.addEventListener('focus', () => {
      if ((element as any).select) (element as any).select();
    });
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
