import Vue from 'vue';
import VueMdl from 'vue-mdl';
import App from './App.vue';

Vue.use(VueMdl);

const app = new Vue({
  el: '#app',
  render: h => h(App),
});

window.debugApp = app;
