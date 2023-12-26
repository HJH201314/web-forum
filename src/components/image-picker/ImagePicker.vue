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

/* 处理文件选择事件 */
function onFileChange(e: Event) {
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
  emit('update:modelValue', form.files.map((file, index) => {
    return {
      file,
      path: form.paths[index],
    } as ImagePickerModelItem;
  }));
  emit('change', form.files);
}
</script>

<template>
  <div class="image-picker">
    <input ref="inputRef" type="file" multiple accept="image/*" @change="onFileChange" />
    <div class="image-picker__preview">
      <div class="image-picker__preview__item" v-for="path in form.paths" :key="path">
        <img :src="path" alt="picker-preview" />
        <CloseOne class="image-picker__preview__item__del" size="1.5rem" theme="filled" @click="handleImageRemove(path)" />
      </div>
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
  &__preview {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;

    &__item {
      position: relative;
      width: 5rem;
      height: 5rem;

      &:hover {
        .image-picker__preview__item__del {
          display: block;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: .5rem;
      }

      &__del {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        color: transparentize($color-black-lighter, 0.3);
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