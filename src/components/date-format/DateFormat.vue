<script setup lang="ts">
import { friendlyDate } from './date-format';
import { computed, ref, watch } from "vue";

type DateFormatProps = {
  date: string | number | Date | number[]; // 时间
  locale?: 'zh' | 'en'; // 语言
  threshold?: [number, number]; // 友好转化阈值
  format?: string; // 格式，默认为 yyyy/MM/dd hh:mm:ss
  refreshRate?: number; // 刷新间隔(ms)
}

const props = withDefaults(defineProps<DateFormatProps>(), {
  date: '-',
  locale: 'zh',
  format: 'yyyy/MM/dd hh:mm:ss',
  threshold: () => [6000, 60480000000],
  refreshRate: 0,
});

defineExpose({
  refresh, // 允许外部调用刷新
});

const dateShow = computed(() => {
  refreshMark.value; // 读一下标记让vue检测到变动以重新计算
  return friendlyDate(props.date, {
    locale: props.locale,
    threshold: props.threshold,
    format: props.format,
  });
});
const refreshMark = ref(0); // refreshMark变动表示需要重新计算dateShow

let refreshInterval = ref<number>();
function refresh() {
  refreshMark.value++;
}
function setAutoRefresh() {
  clearInterval(refreshInterval.value);
  if (props.refreshRate > 0) {
    refreshInterval.value = setInterval(() => {
      refresh();
    }, props.refreshRate);
  }
}

watch(() => props.refreshRate, (v) => {
  setAutoRefresh();
}, { immediate: true });
</script>

<template>
  <span>{{ dateShow }}</span>
</template>

<style scoped lang="scss">

</style>