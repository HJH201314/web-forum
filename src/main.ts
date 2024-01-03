import '@/assets/main.scss';
import '@/assets/variables.module.scss';
import '@icon-park/vue-next/styles/index.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { VueQueryPlugin } from '@tanstack/vue-query';
import shake from '@/commands/shake';

import * as IconParkIcons from '@icon-park/vue-next';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import 'vue-amazing-ui/css';
import VueAmazingUI from 'vue-amazing-ui';

const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);
app.use(VueAmazingUI)
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);

// 自定义指令v-shake
app.directive('shake', {
  updated: shake,
});

// 注册icon_park图标
for (const [key, component] of Object.entries(IconParkIcons)) {
  app.component(key, component);
}

app.mount('#app');
