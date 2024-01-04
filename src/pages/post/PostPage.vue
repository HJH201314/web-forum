<script setup lang="ts">
import useUserStore from "@/stores/useUserStore";
import { DEFAULT_USER_AVATAR } from "@/constants/defaultImage";
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Instagram, Refresh, VideoOne, VoiceOne, Left } from '@icon-park/vue-next';
import PostItemCard from "@/pages/post/components/PostItemCard.vue";
import type { PostItemCardProps } from "@/pages/post/components/PostItemCard";
import { useRouter } from "vue-router";
import showToast from "@/components/toast/toast";
import ImagePicker from "@/components/image-picker/ImagePicker.vue";
import type { ImagePickerFunc, ImagePickerModel } from "@/components/image-picker/ImagePicker";
import type { VideoPickerFunc, VideoPickerModel } from '@/components/video-picker/VideoPicker';
import adminApi from "@/apis/services/video-platform-admin";
import { delay } from "@/utils/delay";
import Spinning from "@/components/spinning/Spinning.vue";
import { getUserInfo } from '@/stores/publicUserInfo';
import CusButton from '@/components/button/CusButton.vue';
import { useIntersectionObserver } from '@vueuse/core';
import useGlobal from '@/commands/useGlobal';
import CusTooltip from '@/components/tooltip/CusTooltip.vue';
import VideoPicker from '@/components/video-picker/VideoPicker.vue';
import AudioPicker from '@/components/audio-picker/AudioPicker.vue';
import type { AudioPickerFunc, AudioPickerModel } from '@/components/audio-picker/AudioPicker';
import ToastManager from '@/components/toast/ToastManager';
import { DialogManager } from '@/components/dialog';
import { convertUserFile } from '@/pages/post/utils/image';

const userStore = useUserStore();

const searchForm = reactive({
  uid: ref(-1),
  keyword: ref(''),
});

const everyDaySentence = ref('每日一句加载中...');
const dailySentenceLoading = ref(false);
onMounted(() => {
  loadEverydaySentence();
});

const router = useRouter();

function loadEverydaySentence() {
  dailySentenceLoading.value = true;
  fetch('https://v1.hitokoto.cn?encode=text')
    .then(res => res.text())
    .then(data => {
      everyDaySentence.value = data;
      dailySentenceLoading.value = false;
    });
}

/* 计算版权信息的位置 */
const detectRef = ref<HTMLDivElement>();
const copyrightRef = ref<HTMLDivElement>();
watch(() => detectRef.value, (newVal) => {
  if (!newVal) return;
  const marginTop = newVal.getBoundingClientRect().top;
  if (!copyrightRef.value) return;
  copyrightRef.value.style.marginTop
    = `calc(${Math.max(0, window.innerHeight - marginTop)}px - 2.25rem - 3.5rem)`;
}, { immediate: true });

/* 图片选择组件实例 */
const imagePickerRef = ref<ImagePickerFunc>();
const videoPickerRef = ref<VideoPickerFunc>();
const audioPickerRef = ref<AudioPickerFunc>();

function handleImageSelect() {
  imagePickerRef.value?.selectImage();
}

function handleVideoSelect() {
  videoPickerRef.value?.selectVideo();
}

function handleAudioSelect() {
  audioPickerRef.value?.selectAudio();
}

const publishForm = reactive({
  edit: ref(false),
  pid: ref(1),
  topic: ref(''),
  title: ref(''),
  content: ref(''),
  images: ref<ImagePickerModel>([]),
  videos: ref<VideoPickerModel>([]),
  audios: ref<AudioPickerModel>([]),
});
const publishButtonText = ref('发布');

const posts = ref<PostItemCardProps[]>([]);
const currentPage = ref(0); // 首页为1，但是handleLoadMore会先+1，所以初始值为0
const hasNoMore = ref(false);

const postResult = ref<API.UpdateVo[]>();

watch(() => postResult.value, async () => {
  if (!postResult.value?.length) return;
  for (let item of postResult.value) {
    if (item.vid) continue; // 此处不处理视频
    const userInfo = await getUserInfo(item.uid ?? -1);
    posts.value.push({
      type: 'post',
      postId: item.id ?? -1,
      userId: item.uid ?? -1,
      userName: userInfo.name ?? '测试用户',
      avatar: convertUserFile(userInfo.avatar) ?? `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${item.uid}`,
      forwardCount: 0,
      commentCount: 0,
      likeCount: 0,
      isLiked: item.isLiked ?? false,
      createTime: item.uploadTime ? new Date(item.uploadTime).toLocaleString() : new Date().toLocaleString(),
      images: JSON.parse(item.urls ?? '[]'),
      content: item.content ? decodeURIComponent(item.content) : '',
    });
  }
  postResult.value = []; // 处理完成后清空
});

const userPostCount = ref(0);
const userLikeCount = ref(0);
const userPoint = computed(() => {
  return userPostCount.value * 100 + userLikeCount.value * 8;
});
const userLevelName = computed(() => {
  if (userPoint.value < 1000) {
    return '初来乍到';
  } else if (userPoint.value < 5000) {
    return '小有名气';
  } else if (userPoint.value < 15000) {
    return '名声显赫';
  } else {
    return '大名鼎鼎';
  }
});
// 检测用户id，获取用户帖子信息
watch(() => userStore.userInfo?.id, async (newVal) => {
  if (newVal != undefined) {
    try {
      const res = await adminApi.updatesController.countUpdatesUsingGet({
        uid: newVal,
      });
      if (res.data?.code == 200) {
        userPostCount.value = res.data.data ?? 0;
      }
    } catch (e) {
      // ignore
    }
    try {
      const res = await adminApi.userInfoController.getLikeCountByUidUsingGet({
        uid: newVal,
      });
      if (res.data?.code == 200) {
        userLikeCount.value = res.data.data ?? 0;
      }
    } catch (e) {
      // ignore
    }
  }
}, { immediate: true });

async function getPosts() {
  try {
    const res = await adminApi.updatesController.getInPageUsingPost({
      pageNum: currentPage.value,
      pageSize: 10,
    }, {
      uid: searchForm.uid == -1 ? undefined : searchForm.uid,
      str: searchForm.keyword ? searchForm.keyword : undefined,
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
  if (!userStore.isLogin || !userStore.userInfo?.id) {
    // 未登录则提醒登录
    showToast({ type: 'danger', text: '请先登录' });
    return;
  }
  if (!publishForm.content) {
    showToast({ type: 'danger', text: '请输入内容' });
    return;
  }
  uploading.value = true;
  try {
    // 上传视频
    publishButtonText.value = '上传视频';
    if (publishForm.videos.length > 0) {
      for (const item of publishForm.videos) {
        const formData = new FormData();
        formData.append('file', item.file);
        const res = await adminApi.updatesControllerFix.uploadFileUsingPost(formData);
        if (res.data?.code == 200) {
          publishForm.content += `[video:${res.data.data}]`;
        } else {
          ToastManager.danger(`上传视频失败：${res.data?.message}`);
          break;
        }
      }
    }
    // 上传音频
    publishButtonText.value = '上传音频';
    if (publishForm.audios.length > 0) {
      for (const item of publishForm.audios) {
        const formData = new FormData();
        formData.append('file', item.file);
        const res = await adminApi.updatesControllerFix.uploadFileUsingPost(formData);
        if (res.data?.code == 200) {
          publishForm.content += `[audio:${res.data.data}]`;
        } else {
          ToastManager.danger(`上传音频失败：${res.data?.message}`);
          break;
        }
      }
    }
    publishButtonText.value = '上传图片';
    await delay(1000);
    // 创建 FormData 对象
    const formData = new FormData();
    publishForm.images.forEach(image => {
      formData.append('images', image.file);
    });
    let content = publishForm.content;
    if (publishForm.title) {
      content = `[title:${publishForm.title}]${content}`;
    }
    const res = await adminApi.updatesControllerFix.publishUsingPost({
      content: content,
    }, formData);
    if (res.data?.code == 200) {
      clearInput();
      currentPage.value = 0; // 重置页码
      posts.value = [];
      hasNoMore.value = false;

      ToastManager.show({
        text: '发布帖子成功！',
        action: async () => {
          if (!res.data?.data) return;
          await doPostDelete(res.data.data);
        },
        actionText: '撤回',
        duration: 'long',
      });
    } else {
      showToast({ type: 'danger', text: `发布失败：${res.data?.message}` });
    }
  } catch (e) {
    showToast({ type: 'danger', text: '发布失败' });
  } finally {
    uploading.value = false;
    publishButtonText.value = '发布';
  }
}

/* 用于撤回刚发布的帖子 */
async function doPostDelete(id: number) {
  try {
    const res = await adminApi.updatesController.deleteEssayByIdUsingDelete({
      id: id,
    });
    if (res.data?.code == 200) {
      showToast({ type: 'success', text: '撤回成功' });
      handlePostDeleted(id);
    }
  } catch (e) {
    showToast({ type: 'danger', text: '撤回失败' });
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

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;
function handleContentInput() {
  if (publishForm.content.length > MAX_CONTENT_LENGTH) {
    publishForm.content = publishForm.content.slice(0, MAX_CONTENT_LENGTH);
  }
}
function handleTitleInput() {
  if (publishForm.title.length > MAX_TITLE_LENGTH) {
    publishForm.title = publishForm.title.slice(0, MAX_TITLE_LENGTH);
  }
}

function handleClearClick() {
  DialogManager.commonDialog({
    title: '清空内容',
    content: '确定要清空输入的所有文本、文件内容吗？',
    onConfirm: () => {
      clearInput();
    },
  });
}

function clearInput() {
  publishForm.pid = 1;
  publishForm.topic = '';
  publishForm.title = '';
  publishForm.content = '';
  publishForm.images = [];
  publishForm.videos = [];
  publishForm.audios = [];
  currentPage.value = 0;
  // posts.value = [];
}

/* 上传数量限制 */
const MAX_IMAGE_COUNT = 9;
const MAX_VIDEO_COUNT = 1;
const MAX_AUDIO_COUNT = 3;
function handleUploadLimited(type: 'image' | 'video' | 'audio') {
  switch (type) {
    case 'image':
      ToastManager.danger(`最多上传 ${MAX_IMAGE_COUNT} 张图片`);
      break;
    case 'video':
      ToastManager.danger(`最多上传 ${MAX_VIDEO_COUNT} 个视频`);
      break;
    case 'audio':
      ToastManager.danger(`最多上传 ${MAX_AUDIO_COUNT} 个音频`);
      break;
  }
}

/* 无限加载控制 */
const loadMoreRef = ref<HTMLDivElement>();
const observeLoadMore = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    handleLoadMore();
  }
}, {
  threshold: 0,
  immediate: false,
});

/* 使用query进行搜索 */
watch(() => router.currentRoute.value, (newVal) => {
  if (newVal) {
    if (newVal.query?.keyword) searchForm.keyword = newVal.query.keyword as string;
    else searchForm.keyword = '';
    if (newVal.query?.uid) searchForm.uid = parseInt(newVal.query.uid as string);
    else searchForm.uid = -1;
    posts.value = [];
    hasNoMore.value = false;
    currentPage.value = 0;
    observeLoadMore.pause();
    observeLoadMore.resume();
  }
}, { immediate: true });

/* 小屏适配 */
const globe = useGlobal();
</script>

<template>
  <div class="post">
    <div class="post-container">
      <aside class="post-left" v-if="globe.isLargeScreen">
        <section ref="postLeftUserRef" class="post-left-user" v-if="userStore.isLogin">
          <div>
            <div class="avatar"><img :src="userStore.userInfo.avatar ?? DEFAULT_USER_AVATAR" alt="post-user-avatar" /></div>
            <div class="right"><span class="username">{{ userStore.userInfo?.name ?? '匿名用户' }}</span><br /><span class="vip">{{ userLevelName }}</span></div>
          </div>
          <div class="stats">
            <div id="post-left-user-follow" class="stats-item"><span>{{ userPostCount * 100 + userLikeCount * 8 }}</span><span>成长值</span></div>
            <div id="post-left-user-fans" class="stats-item" @click="ToastManager.normal(`真棒，你已经发表了${userPostCount}篇帖子！`)"><span>{{ userPostCount }}</span><span>帖子</span></div>
            <div id="post-left-user-fans" class="stats-item" @click="ToastManager.normal(`真棒，你已经点过${userLikeCount}个赞！`)"><span>{{ userLikeCount }}</span><span>点赞</span></div>
          </div>
        </section>
        <section class="post-left-live">
          <div class="top">
            <span>每日一句</span>
            <CusButton style="margin-left: auto;" @click="loadEverydaySentence" :disabled="dailySentenceLoading"><span class="refresh"><Refresh />刷新</span></CusButton>
          </div>
          <hr style="margin-top: .25rem; margin-bottom: .25rem;"/>
          <div class="post-left-live-item">
            {{ everyDaySentence }}
          </div>
        </section>
        <div ref="detectRef"></div>
        <div ref="copyrightRef" style="padding: .5rem; margin-top: auto; display: flex; flex-direction: column; align-items: center; font-size: .75rem;">
          <div>Powered by CusUI</div>
          <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备2021142215号-1</a>
          <div>© 2016-2024 FCraft. All Rights Reserved. </div>
        </div>
      </aside>
      <main class="post-center">
        <section v-if="userStore.isLogin" class="post-center-publish">
          <div class="header">
<!--            <div class="topic">-->
<!--              <topic theme="outline" size="1rem"/>-->
<!--              <span style="margin-left: .5rem;">选择板块</span>-->
<!--            </div>-->
            <div v-show="publishForm.content" class="title">
              <input type="text" placeholder="标题（选填）" v-model="publishForm.title" @input="handleTitleInput" />
              <span class="length-tip-title">{{ publishForm.title.length }} / {{ MAX_TITLE_LENGTH }}</span>
            </div>
          </div>
          <div class="input">
            <textarea placeholder="写下你的用户故事..." v-model="publishForm.content" @input="handleContentInput" />
            <ImagePicker ref="imagePickerRef" @limited="handleUploadLimited('image')" :show-select-on-empty="false" show-select-not-empty v-model="publishForm.images" :limit="MAX_IMAGE_COUNT" />
            <VideoPicker ref="videoPickerRef" @limited="handleUploadLimited('video')" :show-select-on-empty="false" :show-select-not-empty="false" v-model="publishForm.videos" :limit="MAX_VIDEO_COUNT" />
            <AudioPicker ref="audioPickerRef" @limited="handleUploadLimited('audio')" :show-select-on-empty="false" :show-select-not-empty="false" v-model="publishForm.audios" :limit="MAX_AUDIO_COUNT" />
            <div class="actions-placeholder"></div>
            <div class="actions">
              <CusTooltip position="bottom" text="添加图片">
                <CusButton @click="handleImageSelect" :button-style="{'padding': '.25rem .5rem'}">
                  <span><instagram theme="outline"/></span>
                  <span v-if="publishForm.images.length">{{ publishForm.images.length }}/{{ MAX_IMAGE_COUNT }}</span>
                </CusButton>
              </CusTooltip>
              <CusTooltip position="bottom" text="添加视频">
                <CusButton @click="handleVideoSelect" :button-style="{'padding': '.25rem .5rem'}">
                  <span><video-one theme="outline"/></span>
                  <span v-if="publishForm.videos.length">{{ publishForm.videos.length }}/{{ MAX_VIDEO_COUNT }}</span>
                </CusButton>
              </CusTooltip>
              <CusTooltip position="bottom" text="添加音频">
                <CusButton @click="handleAudioSelect" :button-style="{'padding': '.25rem .5rem'}">
                  <span><voice-one theme="outline"/></span>
                  <span v-if="publishForm.audios.length">{{ publishForm.audios.length }}/{{ MAX_AUDIO_COUNT }}</span>
                </CusButton>
              </CusTooltip>
              <CusButton style="margin-left: auto;" type="text" background-color="#00000000" font-color="#0000005F" @click="handleClearClick" :disabled="uploading" text="清空"></CusButton>
              <span class="length-tip">{{ publishForm.content.length }} / {{ MAX_CONTENT_LENGTH }}</span>
<!--              <div class="action"><span class="icon"><setting-one theme="outline"/></span></div>-->
              <CusButton type="primary" @click="handlePublishPost" :disabled="uploading" :text="publishButtonText"><Spinning :show="uploading" /></CusButton>
            </div>
          </div>
        </section>
        <section class="post-center-posts">
          <div v-if="searchForm.keyword" class="load-more">
            <span @click="router.replace('/post')"><Left />{{ '返回' }}</span>
            <div style="flex: 1;"></div>
            <span>“{{ decodeURIComponent(searchForm.keyword) }}” 的搜索结果（共{{ posts.length }}个）</span>
          </div>
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
          <div class="load-more" v-if="hasNoMore && !posts.length" @click="router.replace('/post')">这里空空如也，不如点我返回首页吧ㄟ( ▔, ▔ )ㄏ</div>
          <div ref="loadMoreRef" class="load-more" v-if="!hasNoMore" @click="handleLoadMore">加载更多...</div>
        </section>
      </main>
      <aside class="post-right" v-if="globe.isLargeScreen">
        <section class="post-right-notice">
          站点公告
          <div class="post-right-notice-item">
            🥳 X产品论坛正式上线啦！
          </div>
          <div class="post-right-notice-item">
            🧧 千万红包雨等你来拿！
          </div>
          <div class="post-right-notice-item" @click="router.push('/post/74')">
            🍕 立即下载X插件管理器——
          </div>
          <div class="post-right-notice-item" @click="router.push('/post/1')">
            ⚠️ 点此查看论坛规章制度
          </div>
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

      .top {
        display: flex;
        align-items: center;
      }

      .refresh {
        margin-left: auto;
        font-size: .8rem;
        color: $color-primary;
      }
    }
  }

  &-center {
    flex: 1;
    max-width: 960px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: .5rem;

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
          position: relative;

          .length-tip-title {
            position: absolute;
            right: 0;
            margin: auto 0;
            font-size: .8rem;
            color: $color-grey-500;
          }
        }
      }

      .input {
        flex: 1;
        padding: .5rem;
        border-radius: .5rem;
        background-color: $color-grey-100;
        transition: all .2s $ease-out-circ;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: .25rem;
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
      &-item {
        cursor: pointer;
        padding: .25rem .5rem;
        border-radius: .5rem;
        margin-top: .5rem;
        transition: background-color .2s $ease-out-circ;
        &:hover {
          background-color: $color-grey-200;
        }
      }
    }
    &-topics {
      @extend %card;
    }
  }
}
</style>