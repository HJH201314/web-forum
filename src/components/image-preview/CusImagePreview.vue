<script setup lang="ts">

import { nextTick, ref, watch } from 'vue';
import PreviewManager, { type ImagePreviewProps } from '@/components/image-preview/ImagePreview';
import Spinning from '@/components/spinning/Spinning.vue';

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  modelValue: '',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const previewing = ref(false);
watch(() => props.modelValue, (v) => {
  previewing.value = !!v;
  if (!v) {
    loaded.value = false;
  }
}, { immediate: true });

function handleClose() {
  loaded.value = false;
  emit('update:modelValue', '');
  if (props._id) {
    // 有ID，说明是由Manager创建，需要手动销毁
    PreviewManager.destroy(props._id);
  }
}

const loaded = ref(false);
const imgRef = ref<HTMLImageElement>();
const originDivRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
function handleImgLoaded() {
  console.log('图片加载完成');
  // 图片加载完成后，设置预览状态
  loaded.value = true;
  nextTick(() => {
    // nextTick等待container完成首次渲染
    // 将图片加入到container中
    containerRef.value?.appendChild(imgRef.value!);
  });
}

</script>

<template>
  <teleport to="body" v-if="previewing">
    <div class="image-previewer" @click="handleClose">
      <spinning class="image-previewer--loading" v-if="!loaded" size="5rem" />
      <div ref="originDivRef" style="display: none;"><img ref="imgRef" v-if="previewing" class="image-previewer--img" :src="props.modelValue" alt="picker-preview" draggable="false" @load="handleImgLoaded" /></div>
      <div ref="containerRef" v-if="loaded" class="image-previewer--container"></div>
      <div class="image-previewer--mask"></div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.image-previewer {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  cursor: pointer;

  &--loading {
    z-index: 1;
  }

  &--container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &--img {
    border-radius: .5rem;
    overflow: hidden;
    box-sizing: border-box;
    max-height: 100%;
    max-width: 100%;
    object-fit: cover;
    z-index: 1;
    animation: show 0.3s $ease-in-out-circ;

    @keyframes show {
      0% {
        transform: scale(0);
      }
      100% {
        transform: scale(1);
      }
    }
  }
  &--mask {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>