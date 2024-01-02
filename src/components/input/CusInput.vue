<script setup lang="ts">

import { ref, watch } from 'vue';
import type { CusInputProps } from "@/components/input/CusInput";

const props = withDefaults(defineProps<CusInputProps>(), {
  borderIndicator: true,
  displayValidation: true,
  inputAttrs: () => {
    return {
      autocomplete: 'off',
    };
  },
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'update:validateMsg', value: string): void;
}>();

const inputRef = ref<HTMLInputElement>();

const v = ref(props.modelValue || props.value);

watch(() => props.modelValue, (newValue, oldValue) => {
  if (newValue != undefined && newValue !== oldValue) {
    v.value = newValue;
  }
});

function handleInput(e: any) {
  // 若已有验证不合法，则每进行一个字的输入，都会触发验证
  if (validationMsg.value) {
    validate(e.target.value, e);
  }
  v.value = e.target.value;
  emit('update:modelValue', v.value as string);
}

const validationMsg = ref('');
function handleChange(e: any) {
  // 通常情况下，在输入完成后，会触发change事件，此时需要验证输入是否合法
  validate(e.target.value, e);
}

function validate(str: string, e?: any) {
  if (props.validation) {
    validationMsg.value = props.validation(str); // 有msg表明验证不合法
    return !validationMsg.value;
  }
  if (props.validations) {
    for (const validation of props.validations) {
      switch (validation.name) {
        case 'minLength':
          if (str.length < validation.value) {
            validationMsg.value = validation.msg || '输入长度不足';
            return false;
          }
          break;
        case 'maxLength':
          if (str.length > validation.value) {
            validationMsg.value = validation.msg || '输入长度超出';
            return false;
          }
          break;
        case 'pattern':
          if (!validation.value.test(str)) {
            validationMsg.value = validation.msg || '输入格式不正确';
            return false;
          }
          break;
      }
    }
  }
  validationMsg.value = '';
  return true;
}

watch(() => validationMsg.value, (newVal, oldVal) => {
  console.log(newVal);
  if (newVal == oldVal) return;
  if (newVal) {
    inputRef.value?.classList.add('danger');
    emit('update:validateMsg', newVal);
  } else {
    inputRef.value?.classList.remove('danger');
    emit('update:validateMsg', '');
  }
});
</script>

<template>
  <div class="cus-input">
    <input ref="inputRef" class="cus-input--input" :class="{'border-indicator': props.borderIndicator}"
           :value="v" :placeholder="props.placeholder" :disabled="props.disabled"
           @input="handleInput" @change="handleChange"
           v-bind="props.inputAttrs" />
    <div class="cus-input--validation" v-if="props.displayValidation && validationMsg">{{ validationMsg }}</div>
    <slot name="append" />
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.cus-input {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border-radius: .5rem;
  background-color: $color-grey-100;

  &:focus-within {
    background-color: $color-grey-200;
  }

  &--input {
    outline: none;
    resize: none;
    border: none;
    width: 100%;
    border-radius: .5rem;
    padding: .25rem .5rem;
    transition: background-color .2s $ease-in-out-circ;
    background-color: transparent;

    &.border-indicator {
      border: 2px solid transparent; // 默认透明边框占位
      transition: border .2s $ease-out-circ;
      &:focus {
        border: 2px solid $color-primary;
      }
      &.danger {
        border: 2px solid $color-danger;
        &:focus {
          border: 2px solid $color-danger;
        }
      }
    }
  }

  &--validation {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    color: transparentize($color-danger, 0.75);
    pointer-events: none;
  }
}
</style>