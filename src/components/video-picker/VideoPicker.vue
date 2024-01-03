<script setup lang="ts">

import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { VideoPickerFunc, VideoPickerModel, VideoPickerModelItem } from "@/components/video-picker/VideoPicker";
import { CloseOne, Plus } from "@icon-park/vue-next";

type VideoPickerProps = {
  modelValue?: VideoPickerModel; // v-model返回文件对象
  limit?: number;
  showSelectOnEmpty?: boolean; // 是否在没有图片时显示选择按钮
  showSelectNotEmpty?: boolean; // 是否在有图片时显示选择按钮
};
const props = withDefaults(defineProps<VideoPickerProps>(), {
  limit: 9,
  showSelectOnEmpty: true,
  showSelectNotEmpty: true,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: VideoPickerModel): void; // 选择或移除图片后
  (event: 'change', value: File[]): void; // 选择或移除图片后
  (event: 'limited'): void; // 超过数量限制
}>();

defineExpose<VideoPickerFunc>({
  selectVideo,
});

const inputRef = ref<HTMLInputElement>();

const displaySelect = computed(() => {
  return (props.showSelectOnEmpty || (props.showSelectNotEmpty && form.files.length)) && form.files.length < props.limit;
});
const form = reactive({
  files: [] as File[],
  paths: [] as string[],
  previewingVideo: ref<number>(-1),
});

/**
 * @export
 * 调起文件选择
 * */
function selectVideo() {
  if (form.files.length >= props.limit) {
    emit('limited');
    return;
  }
  inputRef.value!.value = ''; // 清空input的value，否则选择同一文件不会触发change事件
  inputRef.value?.click();
}

/* 处理图片移除 */
function handleVideoRemove(index: number) {
  form.files.splice(index, 1);
  form.paths.splice(index, 1);
  nextTick(() => {
    notify();
  });
}

/* 处理图片点击 */
function handleVideoClick(e: any, index: number) {
  // 预览图片
  form.previewingVideo = index;
}

/* 处理文件选择事件 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files) {
    return;
  }
  const files = Array.from(target.files);
  if (form.files.length + files.length > props.limit) {
    emit('limited');
    return;
  }
  form.files = [...form.files, ...files];
  form.paths = [...form.paths, ...files.map(file => URL.createObjectURL(file))];
  nextTick(() => {
    notify();
  });
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
    nextTick(() => {
      notify();
    });
  }
}

/* 接收modelValue更新 */
watch(() => props.modelValue, (value) => {
  if (value == undefined) {
    return;
  }
  form.files = value.map(item => item.file);
  form.paths = value.map(item => item.path);
}, { immediate: true });

/* 发送emit通知 */
function notify() {
  console.log('notify', form.files, form.paths);
  emit('update:modelValue', form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as VideoPickerModelItem;
  }));
  emit('change', form.files);
}
</script>

<template>
  <div class="video-picker">
    <input ref="inputRef" type="file" multiple accept="video/*" @change="handleFileChange" />
    <teleport to="body">
      <div v-if="form.previewingVideo != -1" class="video-picker__previewer" @click="form.previewingVideo = -1">
        <transition name="video-scale" appear>
          <video controls autoplay v-if="form.previewingVideo != -1" class="video-picker__previewer--img" :src="form.paths[form.previewingVideo]" draggable="false" />
        </transition>
        <div class="video-picker__previewer--mask"></div>
      </div>
    </teleport>
    <div class="video-picker__preview" @dragover.prevent>
      <transition-group name="list">
        <div class="video-picker__preview__item" v-for="(file, i) in form.files" :key="i"
             draggable="true" @dragover.prevent @click="(e) => handleVideoClick(e, i)"
             @contextmenu.prevent="handleVideoRemove(i)"
             @dragstart="(e) => handleDragStart(e, i)" @dragenter="(e) => handleDragEnter(e, i)">
<!--          <img :src="path" alt="picker-preview" draggable="false" @click="handleImageClick(i)" />-->
          <span>【视频】{{ file.name }}</span>
          <CloseOne class="video-picker__preview__item__del" size="1.5rem" theme="filled" @click.stop="handleVideoRemove(i)" />
        </div>
      </transition-group>
      <div v-if="displaySelect" class="video-picker__preview__select">
        <Plus class="video-picker__preview__select__plus" size="1rem" theme="outline" @click="selectVideo" />
        添加视频
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.video-picker {
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
    gap: .25rem;

    &__item {
      position: relative;
      width: 100%;
      cursor: pointer;
      padding: .5rem .75rem;
      border-radius: .5rem;

      &:hover {
        @extend %hover-able;
        @extend %click-able;

        .video-picker__preview__item__del {
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
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        color: transparentize($color-black-lighter, 0.3);
        transition: scale .2s $ease-out-circ;
      }
    }
    &__select {
      position: relative;
      width: 100%;
      border-radius: .5rem;
      border: 1px dashed $color-black-lighter;
      cursor: pointer;
      padding: .5rem .75rem;

      &:hover {
        @extend %hover-able;
        @extend %click-able;
      }

      &__plus {
        //color: darken($color-grey-500, 10%);
      }
    }
  }
}
</style>
<style lang="scss">
@import "@/assets/animations.scss";
.video-scale-enter-active,
.video-scale-leave-active {
  transition: scale .3s $ease-in-out-circ;
}
.video-scale-enter-from,
.video-scale-leave-to {
  scale: 0;
}
.video-scale-enter-to,
.video-scale-leave-from {
  scale: 1;
}
</style>