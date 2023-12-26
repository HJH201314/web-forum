import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/home/HomePage.vue';
import PostPage from '@/pages/post/PostPage.vue';
import LoginPage from '@/pages/login/LoginPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/post',
      name: 'post',
      component: PostPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
  ],
});

export default router;
