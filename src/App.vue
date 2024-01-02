<script setup lang="ts">
import { RouterView } from 'vue-router';
import CommonHeader from '@/components/header/CommonHeader.vue';
import { watch } from 'vue';
import ToastManager from '@/components/toast/ToastManager';
import useUserStore from '@/stores/useUserStore';

const userStore = useUserStore();
// 监听登录状态变化并提示
watch(() => userStore.isLogin, (newVal) => {
  if (newVal) {
    ToastManager.normal(`欢迎回来，${userStore.userInfo.name}！`);
  } else {
    ToastManager.normal('注销成功');
  }
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Teleport to="#app"><div v-if="route.meta.showBackground == undefined || route.meta.showBackground" class="background"></div></Teleport>
    <Transition name="slide-fade">
      <div style="display: flex; flex-direction: column; height: 100%;">
        <CommonHeader v-if="route.meta.showCommonHeader == undefined || route.meta.showCommonHeader"
                      :search-bar-style="{'opacity': 0.9}"
        />
        <component class="child-view" :is="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<style scoped>

</style>
