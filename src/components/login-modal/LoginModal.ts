import { createApp, h } from 'vue';
import type { App } from "vue";
import LoginModal from "./LoginModal.vue";
import shake from '@/commands/shake';

let div: HTMLDivElement | null = null;
let app: App | null = null;

function showLoginModal() {
  if (!div) {
    div = document.createElement('div');
    document.querySelector('#app')?.appendChild(div);
  } else {
    app?.unmount(); // 卸载之前的应用实例
  }
  app = createApp({
    render() {
      return h(LoginModal, {
        showByDefault: true,
      });
    },
  });
  app.directive('shake', {
    updated: shake,
  });
  app.mount(div);
}

export default showLoginModal;
