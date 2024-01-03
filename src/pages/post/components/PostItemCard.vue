<script setup lang="ts">

import { DEFAULT_USER_AVATAR } from "@/constants/defaultImage";
import DateFormat from "@/components/date-format/DateFormat.vue";
import { MoreOne, ShareThree, CommentOne, ThumbsUp, DeleteOne } from "@icon-park/vue-next";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { PostItemCardProps } from "@/pages/post/components/PostItemCard";
import CommentView from "@/pages/post/components/CommentView.vue";
import { convertPostImage } from "@/pages/post/utils/image";
import adminApi from "@/apis/services/video-platform-admin";
import showToast from "@/components/toast/toast";
import useUserStore from "@/stores/useUserStore";
import commentApi from "@/apis/services/video-platform-comment";
import PreviewManager from '@/components/image-preview/ImagePreview';
import { DialogManager } from '@/components/dialog';
import CusPopover from '@/components/popover/CusPopover.vue';
import CusButton from '@/components/button/CusButton.vue';
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<PostItemCardProps>(), {
  type: 'post',
  postId: 0,
  userId: 0,
  userName: '测试用户',
  avatar: DEFAULT_USER_AVATAR,
  forwardCount: 0,
  commentCount: 0,
  likeCount: 0,
  isLiked: false,
  createTime: new Date().toLocaleString(),
  content: '-',
  images: () => [],

  singleUse: false,
  showAction: true,
  defaultTab: undefined,
});

const emit = defineEmits<{
  (event: 'delete-post', id: number): void;
}>();

/* 暴露 */
defineExpose({
  expandPost,
  contractPost,
});

onMounted(() => {
  window.addEventListener('resize', onResize);
  onResize();
  getCommentNum();
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});

function getCommentNum() {
  commentApi.commentController.countCommentsByForeignIdUsingGet({
    foreignId: props.postId,
  }).then(res => {
    if (res.data.code == 200) {
      commentCount.value = parseInt(res.data.data!);
    }
  }).catch();
}

const userStore = useUserStore();

const postTypeDesc = computed(() => {
  switch (props.type) {
    case 'post':
      return '发布了帖子';
    case 'video':
      return '发布了视频';
    default:
      return '';
  }
});

/* 自动处理内容 */
const contents = reactive({
  text: ref(''),
  title: ref(''),
});
watch(() => props.content, (val) => {
  contents.title = '';
  contents.text = val;
  // [title:xxx]啊哈哈哈哈
  const str = val;
  const regex = /^\[title:(.*?)\]/; // 使用非贪婪模式匹配括号内的内容
  const match = str.match(regex);
  if (match) {
    const matchTitle = match[1]; // 提取匹配的内容
    contents.title = matchTitle;
    contents.text = str.replace(regex, '');
  }
}, { immediate: true });

const refContent = ref();
const needReadMore = ref(false);
const readingMore = ref(false);
/* 屏幕大小调整回调函数 */
function onResize() {
  if (!refContent.value) {
    return;
  }
  requestAnimationFrame(() => {
    if (!refContent.value) {
      return;
    }
    const el = refContent.value as HTMLDivElement;
    needReadMore.value = el.offsetHeight < el.scrollHeight;
  });
}

function handleUnfold() {
  readingMore.value = !readingMore.value;
}

function handleDeletePost() {
  if (props.userId != userStore.userInfo.id) {
    showToast({ text: '别删别人的啊', type: 'danger' });
    return;
  }
  DialogManager.commonDialog({
    title: '删除动态',
    content: '确定要删除这条动态吗？',
    confirmButtonProps: {
      text: '删除',
      type: 'danger',
    },
    onConfirm: () => {
      // 执行：删除动态
      adminApi.updatesController.deleteEssayByIdUsingDelete({
        id: props.postId,
      }).then(res => {
        if (res.data.code == 200) {
          showToast({ text: '删除成功', type: 'success' });
        }
      }).catch();
      emit('delete-post', props.postId);
    },
  });
}

const expandType = ref(props.defaultTab ?? 'none');
/* 展开评论详情 */
function expandPost(type: 'none' | 'forward' | 'comment') {
  if (expandType.value === type) {
    // 已经展开则收起
    expandType.value = 'none';
  } else {
    // 收起状态则展开
    expandType.value = type;
  }
}
/* 收起评论详情 */
function contractPost() {
  expandPost('none');
}

const commentCount = ref(props.commentCount);

const showMore = ref(false);
function toggleMore() {
  showMore.value = !showMore.value;
}

const likeClicked = ref(false);
const likeCount = ref(props.likeCount);
function handleLikeClick() {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请登录以进行点赞'});
    return;
  }
  likeClicked.value = !likeClicked.value;
  likeCount.value += likeClicked.value ? 1 : -1;
}

const largeImage = ref(''); // 放大查看的image
function handlePreviewImage(image: string) {
  PreviewManager.image(convertPostImage(image));
}

const router = useRouter();
</script>

<template>
  <div class="post-list-item">
    <div class="post-list-item-avatar">
      <img :src="props.avatar" alt="avatar">
    </div>
    <div class="post-list-item-header">
      <div class="username">{{ props.userName }}</div>
      <div class="desc"><DateFormat :date="props.createTime" /> · {{ postTypeDesc }}<span v-if="!props.singleUse"> ·
        <a href="javascript:void(0)" @click="router.push(`/post/${props.postId}`)">详情>></a>
      </span></div>
      <CusPopover class="more" position="left">
        <template #body>
          <CusButton v-if="userStore.isLogin && userStore.userInfo.id == props.userId"><MoreOne theme="outline" size="1.25rem" /></CusButton>
        </template>
        <template #popover>
          <div class="more-actions">
            <div class="delete" v-if="userStore.userInfo.id == props.userId" @click="handleDeletePost">
              <DeleteOne theme="outline" size="1.25rem" />
            </div>
          </div>
        </template>
      </CusPopover>
    </div>
    <div class="post-list-item-body">
      <div class="title cus-text-ellipsis" v-html="contents.title"></div>
      <div ref="refContent" class="content-normal" :class="{'cus-text-ellipsis': !props.singleUse, 'content-less': !readingMore, 'content-normal': readingMore}" v-html="contents.text"></div>
      <div v-if="needReadMore" class="unfold" @click="handleUnfold">{{ readingMore ? '收起' : '展开' }}</div>
      <div class="image-grid">
        <div class="image-item" :class="{'unlimited': largeImage == image}" v-for="image in props.images" :key="image" @click="handlePreviewImage(image)">
          <img :src="convertPostImage(image)" alt="image">
        </div>
      </div>
    </div>
    <div class="post-list-item-actions" v-if="props.showAction">
      <div class="action" :class="{'active': expandType == 'comment'}" @click="expandPost('comment')"><CommentOne :theme="expandType == 'comment' ? 'filled' : 'outline' " /> {{ commentCount }}</div>
      <div class="action" :class="{'active': props.isLiked || likeClicked}" @click="handleLikeClick"><ThumbsUp :theme="props.isLiked || likeClicked ? 'filled' : 'outline'" /> {{ likeCount }}</div>
    </div>
    <div class="expand-content" v-if="expandType != 'none'">
      <hr style="margin: .5rem;" />
      <CommentView v-if="expandType == 'comment'" :post-id="props.postId" :post-user-id="props.userId" @update-comment-num="n => commentCount = n" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/main";
@import "@/assets/preset";
.post-list-item {
  position: relative;
  &-avatar {
    position: absolute;
    top: .5rem;
    left: .5rem;
    width: 3rem;
    height: 3rem;
    & img {
      width: 100%;
      height: 100%;
      border-radius: .75rem;
    }
  }
  &-header {
    margin-left: 4rem;

    .username {
      font-size: 1rem;
      font-weight: bold;
      color: $color-primary;
    }

    .desc {
      font-size: .8rem;
      color: $color-grey-500;
    }

    .more {
      position: absolute;
      top: .5rem;
      right: .5rem;

      .more-actions {
        height: 1.75rem;
        border-radius: .5rem;
        display: flex;
        align-items: center;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

        .delete {
          height: 100%;
          aspect-ratio: 1;
          span {
            @extend %click-able;
            @extend %button-like;
            color: #ff7875;
            padding: .25rem;
            vertical-align: center;
          }
        }
      }
    }
  }

  &-body {
    margin-left: 4rem;

    > .title {
      font-weight: bold;
      font-size: 1.1rem;
    }

    > .content-less {
      word-break: break-all;
      white-space: pre-line;
      -webkit-line-clamp: 6;
      // max-height: 6rem;
      // overflow: hidden;
    }
    > .content-normal {
      word-break: break-all;
      white-space: pre-line;
      -webkit-line-clamp: none;
    }

    > .unfold {
      cursor: pointer;
      color: $color-primary;
    }

    > .image-grid {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;

      .image-item {
        cursor: pointer;
        width: 5rem;
        height: 5rem;
        box-sizing: border-box;
        &.unlimited {
          width: 100%;
          height: auto;
        }
        & img {
          width: 100%;
          height: 100%;
          border-radius: .25rem;
          object-fit: cover;
        }
      }
    }
  }

  &-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    color: $color-grey-500;
    margin-top: .5rem;

    .action {
      cursor: pointer;

      &.active {
        color: $color-primary;
      }
    }
  }
}
</style>