<script setup lang="ts">

import CusButton from '@/components/button/CusButton.vue';
import ToastManager from '@/components/toast/ToastManager';
import { DialogManager } from '@/components/dialog';
import { nextTick } from 'vue';

function handleLogin() {
  ToastManager.success('打开登录');
  DialogManager.commonDialog({
    title: 'hello',
    content: 'world',
    onCancel: (close) => {
      nextTick(() => {
        ToastManager.success('取消登录');
      });
      close();
    },
    onConfirm: (close) => {
      ToastManager.success('登录成功');
      close();
    },
  });
}
</script>

<template>
  <div class="login-page">
    <CusButton type="primary" text="Hello World!" @click="handleLogin"></CusButton>
  </div>
</template>

<style scoped lang="scss">
.login-page {

}
</style>