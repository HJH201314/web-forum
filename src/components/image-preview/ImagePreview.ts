import { type App, createApp, h } from 'vue';
import ImagePreview from '@/components/image-preview/CusImagePreview.vue';
import { getRandomString } from '@/utils/string';

type ImagePreviewInstance = {
  dom: HTMLDivElement;
  app: App;
}

export type ImagePreviewProps = {
  _id: string;
  modelValue: string;
  type: 'image' | 'video' | 'audio';
}

class PreviewManager {
  private static instances: Map<string, ImagePreviewInstance> = new Map();
  private static top: number; // 当前最高的z-index

  static image(src: string) {
    const id = getRandomString(5);
    const imageDiv = document.createElement('div');
    document.querySelector('#app')?.appendChild(imageDiv);
    const imageApp = createApp({
      render() {
        return h(ImagePreview, {
              _id: id, // 指定组件全局唯一ID
              modelValue: src,
            });
      },
    });
    imageApp.mount(imageDiv);
    this.instances.set(id, {
      dom: imageDiv,
      app: imageApp,
    });
    console.debug(this.instances);
  }

  public static destroy(_id: string) {
    const instance = this.instances.get(_id);
    if (!instance) return;
    instance.app.unmount();
    instance.dom.remove();
    this.instances.delete(_id);
    console.debug(this.instances);
  }
}

export default PreviewManager;