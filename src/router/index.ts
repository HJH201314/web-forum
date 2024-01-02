import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/home/HomePage.vue';
import PostPage from '@/pages/post/PostPage.vue';
import PostDetailPage from '@/pages/post/PostDetailPage.vue';
import LoginPage from '@/pages/login/LoginPage.vue';
import MePage from '@/pages/me/MePage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { showCommonHeader: false },
    },
    {
      path: '/post',
      name: 'post',
      component: PostPage,
    },
    {
      path: '/post/:postId',
      name: 'post-detail',
      component: PostDetailPage,
      props: true,
    },
    {
      path: '/me',
      name: 'me',
      component: MePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { showCommonHeader: false },
    },
  ],
});

export default router;
