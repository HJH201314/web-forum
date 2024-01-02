<script setup lang="ts">

import { computed, reactive, ref, watch } from "vue";
import type { ImagePickerFunc, ImagePickerModel, ImagePickerModelItem } from "@/components/image-picker/ImagePicker";
import { CloseOne, Plus } from "@icon-park/vue-next";

type ImagePickerProps = {
  modelValue?: ImagePickerModel; // v-model返回文件对象
  limit?: number;
  showSelectOnEmpty?: boolean; // 是否在没有图片时显示选择按钮
  showSelectNotEmpty?: boolean; // 是否在有图片时显示选择按钮
};
const props = withDefaults(defineProps<ImagePickerProps>(), {
  limit: 9,
  showSelectOnEmpty: true,
  showSelectNotEmpty: true,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ImagePickerModel): void; // 选择或移除图片后
  (event: 'change', value: File[]): void; // 选择或移除图片后
  (event: 'limited'): void; // 超过数量限制
}>();

defineExpose<ImagePickerFunc>({
  selectImage,
});

const inputRef = ref<HTMLInputElement>();

const displaySelect = computed(() => {
  return (props.showSelectOnEmpty || (props.showSelectNotEmpty && form.files.length)) && form.files.length < props.limit;
});
const form = reactive({
  files: [] as File[],
  paths: [] as string[],
  previewingImage: ref<number>(-1),
});

/**
 * @export
 * 调起文件选择
 * */
function selectImage() {
  inputRef.value?.click();
}

/* 处理图片移除 */
function handleImageRemove(path: string) {
  const index = form.paths.indexOf(path);
  form.files.splice(index, 1);
  form.paths.splice(index, 1);
  notify();
}

/* 处理图片点击 */
function handleImageClick(index: number) {
  // 预览图片
  form.previewingImage = index;
}

/* 处理文件选择事件 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files) {
    return;
  }
  const files = Array.from(target.files);
  if (files.length > props.limit) {
    emit('limited');
    return;
  }
  form.files = [...form.files, ...files];
  form.paths = [...form.paths, ...files.map(file => URL.createObjectURL(file))];
  notify();
}

/* 处理拖动排序事件 */
const dragIndex = ref<number>(-1);

function handleDragStart(e: DragEvent, index: number) {
  console.log('drag start', index);
  dragIndex.value = index;
}

function handleDragEnter(e: DragEvent, index: number) {
  console.log('drag enter', index);
  e.preventDefault();
  if (dragIndex.value != index) {
    const files = form.files;
    const paths = form.paths;
    const dragFile = files[dragIndex.value];
    const dragPath = paths[dragIndex.value];
    files.splice(dragIndex.value, 1);
    paths.splice(dragIndex.value, 1);
    files.splice(index, 0, dragFile);
    paths.splice(index, 0, dragPath);
    console.log(files, paths);
    dragIndex.value = index;
    notify();
  }
}

/* 接收modelValue更新 */
watch(() => props.modelValue, (value) => {
  if (!value) {
    return;
  }
  form.files = value.map(item => item.file);
  form.paths = value.map(item => item.path);
}, { immediate: true });

/* 发送emit通知 */
function notify() {
  console.log(form.files);
  emit('update:modelValue', form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as ImagePickerModelItem;
  }));
  console.log(form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as ImagePickerModelItem;
  }));
  emit('change', form.files);
  console.log(form.files);
}
</script>

<template>
  <div class="image-picker">
    <input ref="inputRef" type="file" multiple accept="image/*" @change="handleFileChange" />
    <teleport to="body">
      <div v-if="form.previewingImage != -1" class="image-picker__previewer" @click="form.previewingImage = -1">
        <transition name="image-scale" appear><img v-if="form.previewingImage != -1" class="image-picker__previewer--img" :src="form.paths[form.previewingImage]" alt="picker-preview" draggable="false" /></transition>
        <div class="image-picker__previewer--mask"></div>
      </div>
    </teleport>
    <div class="image-picker__preview" @dragover.prevent>
      <transition-group name="list">
        <div class="image-picker__preview__item" v-for="(path, i) in form.paths" :key="path"
             draggable="true" @dragover.prevent
             @dragstart="(e) => handleDragStart(e, i)" @dragenter="(e) => handleDragEnter(e, i)">
          <img :src="path" alt="picker-preview" draggable="false" @click="handleImageClick(i)" />
          <CloseOne class="image-picker__preview__item__del" size="1.5rem" theme="filled" @click="handleImageRemove(path)" />
        </div>
      </transition-group>
      <div v-if="displaySelect" class="image-picker__preview__select">
        <Plus class="image-picker__preview__select__plus" size="2.5rem" theme="outline" @click="selectImage" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.image-picker {
  input {
    display: none;
  }
  /* 预览器 */
  &__previewer {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    cursor: pointer;

    &--img {
      border-radius: .5rem;
      overflow: hidden;
      box-sizing: border-box;
      max-height: 100%;
      max-width: 100%;
      object-fit: cover;
      z-index: 1;
    }
    &--mask {
      position: absolute;
      inset: 0;
      z-index: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  /* 列表预览 */
  &__preview {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;

    &__item {
      position: relative;
      width: 5rem;
      height: 5rem;
      cursor: pointer;

      &:hover {
        .image-picker__preview__item__del {
          scale: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: .5rem;
      }

      &__del {
        scale: 0;
        position: absolute;
        top: 0;
        right: 0;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        color: transparentize($color-black-lighter, 0.3);
        transition: scale .2s $ease-out-circ;
      }
    }
    &__select {
      position: relative;
      width: 5rem;
      height: 5rem;
      border-radius: .5rem;
      border: 1px dashed $color-black-lighter;
      cursor: pointer;

      &__plus {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: darken($color-grey-500, 10%);
      }
    }
  }
}
</style>
<style lang="scss">
@import "@/assets/animations.scss";
.image-scale-enter-active,
.image-scale-leave-active {
  transition: scale .3s $ease-in-out-circ;
}
.image-scale-enter-from,
.image-scale-leave-to {
  scale: 0;
}
.image-scale-enter-to,
.image-scale-leave-from {
  scale: 1;
}
</style>