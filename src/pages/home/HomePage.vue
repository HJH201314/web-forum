<script setup lang="ts">

import CusButton from '@/components/button/CusButton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="home-page">
    HomePage
    <CusButton type="primary" text="hi" @click="router.push('/post')"></CusButton>
  </div>
</template>

<style scoped lang="scss">
.home-page {

}
</style>