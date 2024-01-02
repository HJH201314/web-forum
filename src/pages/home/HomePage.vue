<script setup lang="ts">

import CusButton from '@/components/button/CusButton.vue';
import { useRouter } from 'vue-router';
import useUserStore from '@/stores/useUserStore';
import showLoginModal from '@/components/login-modal/LoginModal';
import useGlobal from '@/commands/useGlobal';

const userStore = useUserStore();
const router = useRouter();

function handleLogout() {
  userStore.logout();
}

const globe = useGlobal();
</script>

<template>
  <div class="home-page">
    <div class="title">
      <img class="logo" src="/x-logo.png" alt="logo" />
      <span class="text" :class="{'text--small': globe.isSmallScreen}">Fast, Convenient</span>
    </div>
    <div class="actions">
      <CusButton type="primary" text="文档" @click="router.push('/login')"></CusButton>
      <CusButton type="primary" text="产品论坛" @click="router.push('/post')"></CusButton>
    </div>

    <!-- 右上角 -->
    <div style="position: absolute; top: 0; right: 0; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
      <span v-if="userStore.isLogin">欢迎，{{ userStore.userInfo?.name }}</span>
      <CusButton v-if="!userStore.isLogin" type="primary" text="登录" @click="showLoginModal()"></CusButton>
      <CusButton v-else type="primary" text="注销" @click="handleLogout()"></CusButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.home-page {
  background: linear-gradient(135deg, #ee9ae53F, #5961f93F);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  > .title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    > .logo {
      width: 72px;
      height: 72px;
      filter: invert(43%) sepia(13%) saturate(2294%) hue-rotate(193deg) brightness(84%) contrast(88%); // 用于将图片变成紫色
      transition: transform .5s $ease-in-out-circ;

      &:hover {
        transform: rotateX(180deg) rotateY(180deg); // 悬浮时翻转
      }
    }
    > .text {
      font-size: 72px;
      font-weight: bold;
      text-align: center;
      background-size: 200% 100%;
      background-image: linear-gradient(-135deg, #5260ac, #5260ac6F, #5260ac, #5260ac6F, #5260ac);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: flowery 3s infinite linear;
      
      @keyframes flowery {
        0% {
          background-position: 0 -100%;
        }
        100% {
          background-position: -90% 0;
        }
      }

      &--small {
        line-height: 70px;
        font-size: 64px;
      }
    }
  }

  > .actions {
    display: flex;
    gap: 1rem;
  }
}
</style>