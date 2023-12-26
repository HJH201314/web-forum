<script setup lang="ts">
import { Left, Right } from "@icon-park/vue-next";
import { computed, ref } from "vue";

type CusPaginationProps = {
  pageCount: number; // 总页数
  currentPage?: number; // 当前页码
}

const props = withDefaults(defineProps<CusPaginationProps>(), {
});

const emit = defineEmits<{
  (event: 'update:currentPage', page: number): void;
  (event: 'change', page: number): void;
}>();

const pageNums = computed(() => {
  const pageNums = [];
  for (let i = 0; i < props.pageCount; i++) {
    pageNums.push(i + 1);
  }
  return pageNums;
});
const currentPage = ref(1);

function handleChangePage(page: number) {
  currentPage.value = page;
  emit('update:currentPage', page);
  emit('change', page);
}
function handleIncPage() {
  handleChangePage(currentPage.value + 1);
}
function handleDecPage() {
  handleChangePage(currentPage.value - 1);
}
</script>

<template>
  <div class="dili-pagination">
    <button :disabled="currentPage - 1 < 1" @click="handleDecPage"><Left class="button" size="1rem" /></button>
    <div v-for="i in pageNums" :key="i" :class="{'active': currentPage == i}" @click="handleChangePage(i)">
      <span>{{ i }}</span>
    </div>
    <button :disabled="currentPage + 1 > pageNums.length" @click="handleIncPage"><Right class="button" size="1rem" /></button>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.dili-pagination {
  display: flex;
  gap: .25rem;
  margin-bottom: .5rem;

  > div {
    @extend %click-able;
    @extend %button-like;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    vertical-align: center;
    position: relative;
    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.active {
      background-color: $color-primary;
      color: white;
    }
  }

  > button {
    &:disabled {
      cursor: default;
    }
    &:not(&:disabled) {
      @extend %click-able;
    }
    background-color: $color-grey-100;
    color: darken($color-grey-500, 50%);
    width: 1.5rem;
    height: 1.5rem;
    border-radius: .5rem;
    position: relative;
    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>