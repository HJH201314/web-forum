<script setup lang="ts">

import CommonModal from "@/components/modal/CommonModal.vue";
import { computed, ref, watch } from "vue";
import type { CSSProperties } from "vue";
import type { CommonModalFunc } from "@/components/modal/CommonModal";

type ImagePreviewProps = {
  modelValue: string;
}
const props = withDefaults(defineProps<ImagePreviewProps>(), {
  modelValue: '',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const refImagePreviewModal = ref<CommonModalFunc>();
const refImage = ref<HTMLImageElement>();
const imageWidth = ref(0);
const imageHeight = ref(0);
const modalStyle = computed(() => {
  let style: CSSProperties = {};
  style.backgroundColor = '#0000001F';
  if (imageWidth.value) {
    style.width = `${imageWidth.value}px`;
  }
  if (imageHeight.value) {
    style.width = `${imageHeight.value}px`;
  }
  return style;
});
watch(() => props.modelValue, (v) => {
  if (v) {
    refImagePreviewModal.value?.open();
    // 计算图片宽度
    let imgObj = new Image();
    imgObj.src = v;
    imgObj.onload = () => {
      imageWidth.value = imgObj.width;
      imageHeight.value = imgObj.height;
    };
  }
});

function handleClose() {
  emit('update:modelValue', '');
}
</script>

<template>
  <CommonModal ref="refImagePreviewModal" show-close @on-close="handleClose" :modal-style="modalStyle">
    <div ref="refImage" class="image-preview">
      <img :src="props.modelValue" alt="预览图片" />
    </div>
    <div class="image-control">

    </div>
  </CommonModal>
</template>

<style scoped lang="scss">
.image-preview {
  border-radius: .5rem;
  overflow: hidden;
  max-width: 90vw;
  img {
    object-fit: cover;
  }
}
.image-control {

}
</style>