<script setup lang="ts">

import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { AudioPickerFunc, AudioPickerModel, AudioPickerModelItem } from "@/components/audio-picker/AudioPicker";
import { CloseOne, Plus } from "@icon-park/vue-next";

type AudioPickerProps = {
  modelValue?: AudioPickerModel; // v-model返回文件对象
  limit?: number;
  showSelectOnEmpty?: boolean; // 是否在没有图片时显示选择按钮
  showSelectNotEmpty?: boolean; // 是否在有图片时显示选择按钮
};
const props = withDefaults(defineProps<AudioPickerProps>(), {
  limit: 9,
  showSelectOnEmpty: true,
  showSelectNotEmpty: true,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: AudioPickerModel): void; // 选择或移除图片后
  (event: 'change', value: File[]): void; // 选择或移除图片后
  (event: 'limited'): void; // 超过数量限制
}>();

defineExpose<AudioPickerFunc>({
  selectAudio,
});

const inputRef = ref<HTMLInputElement>();

const displaySelect = computed(() => {
  return (props.showSelectOnEmpty || (props.showSelectNotEmpty && form.files.length)) && form.files.length < props.limit;
});
const form = reactive({
  files: [] as File[],
  paths: [] as string[],
  previewingAudio: ref<number>(-1),
});

/**
 * @export
 * 调起文件选择
 * */
function selectAudio() {
  if (form.files.length >= props.limit) {
    emit('limited');
    return;
  }
  inputRef.value!.value = ''; // 清空input的value，否则选择同一文件不会触发change事件
  inputRef.value?.click();
}

/* 处理图片移除 */
function handleAudioRemove(index: number) {
  form.files.splice(index, 1);
  form.paths.splice(index, 1);
  nextTick(() => {
    notify();
  });
}

/* 处理图片点击 */
function handleAudioClick(e: any, index: number) {
  // 预览图片
  form.previewingAudio = index;
}

/* 处理文件选择事件 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  console.log(1);
  if (!target.files) {
    return;
  }
  console.log(2);
  const files = Array.from(target.files);
  if (form.files.length + files.length > props.limit) {
    emit('limited');
    return;
  }
  console.log(3);
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
  console.log(form.files);
  emit('update:modelValue', form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as AudioPickerModelItem;
  }));
  console.log(form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as AudioPickerModelItem;
  }));
  emit('change', form.files);
  console.log(form.files);
}
</script>

<template>
  <div class="audio-picker">
    <input ref="inputRef" type="file" multiple accept="audio/*" @change="handleFileChange" />
    <teleport to="body">
      <div v-if="form.previewingAudio != -1" class="audio-picker__previewer" @click="form.previewingAudio = -1">
        <transition name="audio-scale" appear>
          <audio controls v-if="form.previewingAudio != -1" class="audio-picker__previewer--img" :src="form.paths[form.previewingAudio]" draggable="false" />
        </transition>
        <div class="audio-picker__previewer--mask"></div>
      </div>
    </teleport>
    <div class="audio-picker__preview" @dragover.prevent>
      <transition-group name="list">
        <div class="audio-picker__preview__item" v-for="(file, i) in form.files" :key="i"
             draggable="true" @dragover.prevent @click="(e) => handleAudioClick(e, i)"
             @contextmenu.prevent="handleAudioRemove(i)"
             @dragstart="(e) => handleDragStart(e, i)" @dragenter="(e) => handleDragEnter(e, i)">
<!--          <img :src="path" alt="picker-preview" draggable="false" @click="handleImageClick(i)" />-->
          <span>【音频】{{ file.name }}</span>
          <CloseOne class="audio-picker__preview__item__del" size="1.5rem" theme="filled" @click.stop="handleAudioRemove(i)" />
        </div>
      </transition-group>
      <div v-if="displaySelect" class="audio-picker__preview__select">
        <Plus class="audio-picker__preview__select__plus" size="1rem" theme="outline" @click="selectAudio" />
        添加音频
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.audio-picker {
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

        .audio-picker__preview__item__del {
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
.audio-scale-enter-active,
.audio-scale-leave-active {
  transition: scale .3s $ease-in-out-circ;
}
.audio-scale-enter-from,
.audio-scale-leave-to {
  scale: 0;
}
.audio-scale-enter-to,
.audio-scale-leave-from {
  scale: 1;
}
</style>