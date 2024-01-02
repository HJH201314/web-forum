<script setup lang="ts">
import useUserStore from "@/stores/useUserStore";
import { DEFAULT_USER_AVATAR } from "@/constants/defaultImage";
import { computed, onMounted, reactive, ref, watch, watchEffect } from "vue";
import { Instagram, Topic, SettingOne } from '@icon-park/vue-next';
import PostItemCard from "@/pages/post/components/PostItemCard.vue";
import type { PostItemCardProps } from "@/pages/post/components/PostItemCard";
import { useRouter } from "vue-router";
import showToast from "@/components/toast/toast";
import ImagePicker from "@/components/image-picker/ImagePicker.vue";
import type { ImagePickerFunc, ImagePickerModel } from "@/components/image-picker/ImagePicker";
import adminApi from "@/apis/services/video-platform-admin";
import { delay } from "@/utils/delay";
import Spinning from "@/components/spinning/Spinning.vue";
import { getUserInfo } from '@/stores/publicUserInfo';
import CusButton from '@/components/button/CusButton.vue';
import { useIntersectionObserver } from '@vueuse/core';
import useGlobal from '@/commands/useGlobal';

const userStore = useUserStore();

/* 图片选择组件实例 */
const imagePickerRef = ref<ImagePickerFunc>();

function handleImageSelect() {
  imagePickerRef.value?.selectImage();
}

const publishForm = reactive({
  pid: ref(1),
  topic: ref(''),
  title: ref(''),
  content: ref(''),
  images: ref<ImagePickerModel>([]),
});

const router = useRouter();

const posts = ref<PostItemCardProps[]>([]);
const currentPage = ref(0); // 首页为1，但是handleLoadMore会先+1，所以初始值为0
const hasNoMore = ref(false);

const postResult = ref<API.Update[]>();

watch(() => postResult.value, async () => {
  if (!postResult.value) return;
  for (let item of postResult.value) {
    if (item.vid) continue; // 此处不处理视频
    const userInfo = await getUserInfo(item.uid ?? -1);
    posts.value.push({
      type: 'post',
      postId: item.id ?? -1,
      userId: item.uid ?? -1,
      userName: userInfo.name ?? '测试用户',
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${item.uid}`,
      forwardCount: 0,
      commentCount: 0,
      likeCount: 0,
      isLiked: false,
      createTime: item.uploadTime ? new Date(item.uploadTime).toLocaleString() : new Date().toLocaleString(),
      images: JSON.parse(item.urls ?? '[]'),
      content: item.content ? decodeURIComponent(item.content) : '',
    });
  }
  postResult.value = []; // 处理完成后清空
});

async function getPosts() {
  try {
    const res = await adminApi.updatesController.getInPageUsingGet({
      pageNum: currentPage.value,
      pageSize: 10,
    });
    if (res.data.data?.length == 0) {
      showToast({ type: 'info', text: '没有更多啦' });
      hasNoMore.value = true;
    }
    postResult.value = res.data.data;
    return res.data.data;
  } catch (e) {
    return [];
  }
}

const uploading = ref(false);

async function handlePublishPost() {
  if (!publishForm.content) {
    showToast({ type: 'danger', text: '请输入内容' });
    return;
  }
  uploading.value = true;
  try {
    if (!userStore.isLogin || !userStore.userInfo?.id) {
      // 未登录则跳转到登录页
      showToast({ type: 'danger', text: '请先登录' });
      await router.replace({name: 'home'});
      return;
    }
    await delay(1000);
    // 创建 FormData 对象
    const formData = new FormData();
    publishForm.images.forEach(image => {
      formData.append('images', image.file);
    });
    const res = await adminApi.updatesControllerFix.publishUsingPost({
      content: publishForm.content,
    }, formData);
    if (res.data?.code == 200) {
      showToast({ type: 'success', text: '发布成功' });
      clearInput();
      currentPage.value = 1;
      await getPosts();
    } else {
      showToast({ type: 'danger', text: `发布失败：${res.data?.message}` });
    }
  } catch (e) {
    showToast({ type: 'danger', text: '发布失败' });
  } finally {
    uploading.value = false;
  }
}

function handlePostDeleted(id: number) {
  posts.value.forEach((item, index) => {
    if (item.postId == id) {
      posts.value.splice(index, 1);
    }
  });
}

async function handleLoadMore() {
  currentPage.value++;
  await getPosts();
  await delay(100);
  observeLoadMore.pause();
  observeLoadMore.resume();
}

const MAX_CONTENT_LENGTH = 1000;
function handleContentInput() {
  if (publishForm.content.length > MAX_CONTENT_LENGTH) {
    publishForm.content = publishForm.content.slice(0, MAX_CONTENT_LENGTH);
  }
}

function clearInput() {
  publishForm.pid = 1;
  publishForm.topic = '';
  publishForm.title = '';
  publishForm.content = '';
  publishForm.images = [];
  currentPage.value = 1;
  posts.value = [];
}

/* 无限加载控制 */
const loadMoreRef = ref<HTMLDivElement>();
const observeLoadMore = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    handleLoadMore();
  }
}, {
  threshold: 0,
});

/* 小屏适配 */
const globe = useGlobal();
</script>

<template>
  <div class="post">
    <div class="post-container">
      <aside class="post-left" v-if="globe.isLargeScreen">
        <section ref="postLeftUserRef" class="post-left-user" v-if="userStore.isLogin">
          <div>
            <div class="avatar"><img :src="userStore.avatar ?? DEFAULT_USER_AVATAR" alt="post-user-avatar" /></div>
            <div class="right"><span class="username">{{ userStore.userInfo?.name ?? '匿名用户' }}</span><br /><span class="vip">初级用户</span></div>
          </div>
          <div class="stats">
            <div id="post-left-user-follow" class="stats-item"><span>{{ 1024 }}</span><span>成长值</span></div>
            <div id="post-left-user-fans" class="stats-item"><span>{{ 11 }}</span><span>帖子</span></div>
            <div id="post-left-user-fans" class="stats-item"><span>{{ 666 }}</span><span>点赞</span></div>
          </div>
        </section>
        <section class="post-left-live">
          板块
        </section>
      </aside>
      <main class="post-center">
        <section v-if="userStore.isLogin" class="post-center-publish">
          <div class="header">
            <div class="topic">
              <topic theme="outline" size="1rem"/>
              <span style="margin-left: .5rem;">选择板块</span>
            </div>
            <div v-show="publishForm.content" class="title">
              <input type="text" placeholder="标题（选填）" v-model="publishForm.title" />
            </div>
          </div>
          <div class="input">
            <textarea placeholder="写下你的用户故事..." v-model="publishForm.content" @input="handleContentInput" />
            <ImagePicker ref="imagePickerRef" :show-select-on-empty="false" show-select-not-empty v-model="publishForm.images" />
            <div class="actions-placeholder"></div>
            <div class="actions">
              <div class="action" @click="handleImageSelect"><span class="icon"><instagram theme="outline"/></span></div>
              <span class="length-tip">{{ publishForm.content.length }} / {{ MAX_CONTENT_LENGTH }}</span>
              <div class="action"><span class="icon"><setting-one theme="outline"/></span></div>
              <CusButton type="primary" @click="handlePublishPost" :disabled="uploading" text="发布"><Spinning :show="uploading" /></CusButton>
            </div>
          </div>
        </section>
        <section class="post-center-posts">
          <PostItemCard class="post-item" v-for="item in posts" :key="item.postId"
                        :type="item.type ?? 'post'"
                        :post-id="item.postId!"
                        :user-id="item.userId!"
                        :user-name="item.userName"
                        :avatar="item.avatar"
                        :forward-count="item.forwardCount"
                        :comment-count="item.commentCount"
                        :like-count="item.likeCount"
                        :is-liked="item.isLiked"
                        :create-time="item.createTime"
                        :content="item.content"
                        :images="item.images"
                        @delete-post="(id) => handlePostDeleted(id)"
          />
<!--          <div class="post-loading" v-if="postQueryStatus == 'pending'">加载中...</div>-->
          <div ref="loadMoreRef" class="load-more" v-if="!hasNoMore" @click="handleLoadMore">加载更多...</div>
        </section>
      </main>
      <aside class="post-right" v-if="globe.isLargeScreen">
        <section class="post-right-notice">
          站点公告
        </section>
        <section class="post-right-topics">
          热议话题
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
@import "@/assets/functions";
.post {

  &-container {
    position: relative;
    margin: 0 auto;
    padding: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: row;
    gap: .5rem;
  }

  %card {
    background-color: white;
    border-radius: .5rem;
    padding: .5rem;
  }

  &-left {
    position: sticky;
    top: 4.5rem;
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    &-user {
      @extend %card;
      & > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-top: .5rem;
        &:not(:last-child) {
          // 非最后一个元素，添加下外边距
          margin-bottom: .5rem;
        }
      }
      .avatar {
        width: 4rem;
        height: 4rem;
        overflow: hidden;
        border-radius: .75rem;
        img {
          width: 100%;
          height: 100%;
          object-position: center;
          object-fit: cover;
        }
      }
      .username {
        font-size: 1.2rem;
        font-weight: bold;
        color: $color-primary;
      }
      .vip {
        font-size: .7rem;
        color: white;
        padding: .25rem .5rem;
        background-color: $color-primary;
        border-radius: .25rem;
      }
      .stats {
        justify-content: space-around;
        &-item {
          @extend %click-able;
          @extend %button-like;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          & span:first-child {
            font-size: .9rem;
            font-weight: bold;
            color: $color-black-lighter;
          }
          & span:last-child {
            font-size: .8rem;
            color: $color-grey-500;
          }
        }
      }
    }
    &-live {
      @extend %card;
    }
  }

  &-center {
    flex: 1;
    max-width: 960px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    overflow: hidden;
    &-publish {
      @extend %card;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: .35rem;
      position: relative;

      .header {
        display: flex;
        align-items: center;
        gap: .5rem;

        .topic {
          @extend %click-able;
          width: fit-content;
          padding: .125rem .35rem;
          border-radius: .5rem;
          color: $color-grey-500;
          background-color: $color-grey-100;
        }

        .title {
          flex: 1;
        }
      }

      .input {
        flex: 1;
        padding: .5rem;
        border-radius: .5rem;
        background-color: $color-grey-100;
        transition: all .2s $ease-out-circ;
        position: relative;
        textarea {
          width: 100%;
          height: 3.5rem;
          outline: none;
          resize: none;
          background-color: transparent;
        }
        &:focus-within {
          background-color: $color-grey-200;
        }

      }

      .actions {
        position: absolute;
        left: .25rem;
        bottom: .25rem;
        right: .25rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: .25rem;
        &-placeholder {
          height: 2rem;
          width: 100%;
        }
        .action {
          @extend %click-able;
          @extend %button-like;
          width: 1.75rem;
          height: 1.75rem;
          position: relative;
        }
        .icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .length-tip {
          margin-left: auto;
          margin-right: .25rem;
          font-size: .8rem;
          color: $color-grey-500;
        }
        .publish {
          @extend %transition-all-circ;
          color: white;
          background-color: $color-primary;
          border-radius: .5rem;
          padding: .25rem 1rem;
          margin: 0 .25rem .25rem .5rem;
          display: flex;
          align-items: center;
          gap: .5rem;
          &:hover {
            background-color: shade-color($color-primary, 3%);
          }
          &:active {
            background-color: shade-color($color-primary, 6%);
          }
        }
      }
    }
    &-posts {
      display: flex;
      flex-direction: column;
      gap: .5rem;
      .post-item {
        @extend %card;
      }
      .post-loading {
        @extend %card;
        display: flex;
        justify-content: center;
      }
      .load-more {
        @extend %card;
        @extend %click-able;
        @extend %button-like;
        display: flex;
        justify-content: center;
      }
    }
  }

  &-right {
    position: sticky;
    top: 4.5rem;
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    &-notice {
      @extend %card;
    }
    &-topics {
      @extend %card;
    }
  }
}
</style>