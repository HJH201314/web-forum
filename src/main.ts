import '@/assets/main.scss';
import '@/assets/variables.module.scss';
import '@icon-park/vue-next/styles/index.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { VueQueryPlugin } from '@tanstack/vue-query';
import shake from '@/commands/shake';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);

// 自定义指令v-shake
app.directive('shake', {
  updated: shake,
});

app.mount('#app');
