<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ToastProps } from './index';
import variables from "@/assets/variables.module.scss";
import { getDarkerColor } from '@/utils/color';

const props = withDefaults(defineProps<ToastProps>(), {
  text: '',
  position: 'top-center',
  duration: 'normal',
  type: 'normal',

  // 启用操作栏
  actionText: '',
  action: () => { /* empty */ },
});

const myself = ref<HTMLElement>();
const durationTimeMs = computed(() => {
  switch (props.duration) {
    case 'long':
      return 3000;
    case 'normal':
      return 1500;
    case 'short':
      return 1000;
    default:
      return props.duration;
  }
});

onMounted(() => {
  setTimeout(() => {
    myself.value?.remove();
  }, durationTimeMs.value);
});

const toastClass = computed(() => {
  let className: string = props.position;
  if (className === 'top') className = 'top-center';
  if (className === 'bottom') className = 'bottom-center';
  return ['toast', `toast-${className}`];
});

const wrapperColor = computed(() => {
  if (props.actionText) return variables.colorWhite; // 带action
  switch (props.type) {
    case 'success':
      return variables.colorSuccess;
    case 'warning':
      return variables.colorWarning;
    case 'danger':
      return variables.colorDanger;
    case 'info':
      return variables.colorInfo;
    case 'normal':
    case 'primary':
      return variables.colorPrimary;
    default:
      return variables.colorWhite;
  }
});

const shadowColor = computed(() => {
  return getDarkerColor(wrapperColor.value, 0.5);
});

const fontColor = computed(() => {
  if (props.actionText) return variables.colorBlack; // 带action
  switch (props.type) {
    case 'success':
    case 'warning':
    case 'danger':
    case 'info':
    case 'normal':
    case 'primary':
      return variables.colorWhite;
    default:
      return variables.colorBlack;
  }
});
</script>

<template>
  <Teleport to="body">
    <div :class="toastClass" ref="myself">
      <div class="toast-wrapper">
        <span v-if="text" class="toast-text">{{ props.text }}</span>
        <slot v-if="$slots.default"></slot>
        <span v-if="props.actionText" class="toast-action" @click="props.action">{{ props.actionText }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.toast {
  position: absolute;
  z-index: 10000;

  &-wrapper {
    border-radius: .5rem;
    padding: .25rem .5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: .5rem;
    color: v-bind(fontColor);
    background-color: v-bind(wrapperColor);
    box-shadow: 0 0 4px v-bind(shadowColor);
    opacity: 0.9;
  }

  &-action {
    cursor: pointer;
    color: $color-primary;
  }

  &-top-center {
    margin-top: .75rem;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    -webkit-animation: top-center-in .25s $ease-out-circ;
    -o-animation: top-center-in .25s $ease-out-circ;
    animation: top-center-in .25s $ease-out-circ;

    @keyframes top-center-in {
      0% {
        transform: translate(-50%, -100%);
      }
      100% {
        transform: translate(-50%, 0);
      }
    }
  }
  &-top-left {
    margin-top: .75rem;
    margin-left: .75rem;
    top: 0;
    left: 0;
    -webkit-animation: top-left-in .25s $ease-out-circ;;
    -o-animation: top-left-in .25s $ease-out-circ;;
    animation: top-left-in .25s $ease-out-circ;;
    @keyframes top-left-in {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(0);
      }
    }
  }
  &-top-right {
    margin-top: .75rem;
    margin-right: .75rem;
    top: 0;
    right: 0;
    -webkit-animation: top-right-in .25s $ease-out-circ;
    -o-animation: top-right-in .25s $ease-out-circ;
    animation: top-right-in .25s $ease-out-circ;
    @keyframes top-right-in {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(0);
      }
    }
  }
  &-bottom-center {
    margin-bottom: .75rem;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    -webkit-animation: bottom-center-in .25s $ease-out-circ;
    -o-animation: bottom-center-in .25s $ease-out-circ;
    animation: bottom-center-in .25s $ease-out-circ;
    @keyframes bottom-center-in {
      0% {
        transform: translate(-50%, 100%);
      }
      100% {
        transform: translate(-50%, 0);
      }
    }
  }
  &-bottom-left {
    margin-bottom: .75rem;
    margin-left: .75rem;
    bottom: 0;
    left: 0;
    -webkit-animation: bottom-left-in .25s $ease-out-circ;
    -o-animation: bottom-left-in .25s $ease-out-circ;
    animation: bottom-left-in .25s $ease-out-circ;
    @keyframes bottom-left-in {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(0);
      }
    }
  }
  &-bottom-right {
    margin-bottom: .75rem;
    margin-right: .75rem;
    bottom: 0;
    right: 0;
    -webkit-animation: bottom-right-in .25s $ease-out-circ;
    -o-animation: bottom-right-in .25s $ease-out-circ;
    animation: bottom-right-in .25s $ease-out-circ;
    @keyframes bottom-right-in {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(0);
      }
    }
  }
}
</style>