<script setup lang="ts">
import { computed, onMounted, reactive, ref, watchEffect } from "vue";
import useUserStore from "@/stores/useUserStore";
import DateFormat from "@/components/date-format/DateFormat.vue";
import { ThumbsUp, ThumbsDown, Left, Right, MoreOne, DeleteOne, ToTopOne } from "@icon-park/vue-next";
import { useQuery } from "@tanstack/vue-query";
import commentApi from "@/apis/services/video-platform-comment";
import showToast, { quickToast } from "@/components/toast/toast";
import useLikeCacheStore from "@/stores/useLikeCacheStore";
import Spinning from "@/components/spinning/Spinning.vue";
import CusPagination from "@/components/pagination/CusPagination.vue";
import CusButton from "@/components/button/CusButton.vue";
import CusPopover from "@/components/popover/CusPopover.vue";
import variables from "@/assets/variables.module.scss";
import { DialogManager } from "@/components/dialog";

const props = withDefaults(defineProps<{
  postId: number; // 动态id
  postUserId: number; // 动态所有者id
}>(), {
  postId: 0,
  postUserId: 0,
});

const emit = defineEmits<{
  (event: 'update-comment-num', num: number): void;
}>();

const userStore = useUserStore();

const sortMode = ref<'hot'|'new'>('hot');

type CommentItem = {
  id: string; // 评论id
  userId: number;
  userAvatar: string;
  userName: string;
  userLevel?: number;
  content: string;
  targetUsername?: string;
  likeCount: number;
  isLiked: boolean;
  createTime: string;
  subComments: CommentItem[];
  totalSubCommentCnt?: number;
  currentPage?: number;
};

onMounted(() => {
  Promise.all([
    getComments(),
  ]);
});

const commentCount = ref(0);
const commentPageNums = computed(() => {
  const pageNums = [];
  for (let i = 0; i < Math.ceil(commentCount.value / PAGE_SIZE); i++) {
    pageNums.push(i + 1);
  }
  return pageNums;
});
const comments = ref<CommentItem[]>([]);
const MINIMUM_PAGE = 0; // comment的页码从0开始
const PAGE_SIZE = 5;
const currentPage = ref(MINIMUM_PAGE);

const {data: commentsResult, refetch: refetchComments, status: commentQueryStatus} = useQuery({
  queryKey: ['comments', props.postId, currentPage.value],
  queryFn: getComments,
})

watchEffect(async () => {
  if (commentQueryStatus.value !== 'success') return;
  if (!commentsResult.value?.list) return;
  comments.value = [];
  for (const item of commentsResult.value.list) {
    const subComments: CommentItem[] = [];
    for (const subItem of item.children ?? []) {
      subComments.push(convertCommentVOToCommentItem(subItem, 'sub'));
    }
    let totalSubComments = 0;
    // 如果有子评论，那么获取子评论的总数
    if (subComments.length > 0) {
      const res = await commentApi.commentController.countChildrenCommentsByPidUsingGet({
        pid: item.id ?? '',
      });
      if (res.data.code == 200) {
        totalSubComments = res.data.data ?? 0;
      }
    }
    comments.value.push({
      id: item.id ?? '',
      userId: item.userId!,
      userAvatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${item.userId}`,
      userName: item.username ?? '未知用户',
      userLevel: 1,
      targetUsername: item.targetUsername,
      content: item.content ?? '',
      likeCount: item.likeNum ?? 0,
      isLiked: false,
      createTime: item.createTime ?? '',
      subComments: subComments,
      totalSubCommentCnt: totalSubComments,
    })
  }
})

const form = reactive({
  comment: '',
  reply: '',
});

function convertCommentVOToCommentItem(item: API.Comment, type: 'sub'): CommentItem {
  if (type == 'sub') {
    return {
      id: item.id ?? '',
      userId: item.userId!,
      userAvatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${item.userId}`,
      userName: item.username ?? '未知用户',
      userLevel: 1,
      content: item.content ?? '',
      targetUsername: item.targetUsername,
      likeCount: item.likeNum ?? 0,
      isLiked: false,
      createTime: item.createTime ?? '',
      subComments: [],
    };
  }
  return {} as CommentItem;
}

async function getComments() {
  if (!props.postId || props.postId <= 0) return;

  try {
    const result = await commentApi.commentController.listCommentByPagesUsingGet({
      foreignId: props.postId,
      page: currentPage.value,
      size: 5,
      sortBy: sortMode.value === 'hot' ? 'likeNum' : 'createTime',
      uid: userStore.userInfo.id!,
    });
    commentCount.value = result.data?.data?.total ?? 0;
    emit('update-comment-num', commentCount.value);
    return result.data?.data;
  } catch (e) {
    // ignore
  }
}

async function getSubComments(comment: CommentItem) {
  try {
    const res = await commentApi.commentController.listChildrenCommentByPagesUsingGet({
      pid: comment.id,
      page: comment.currentPage ?? 0,
      size: 3,
      uid: userStore.userInfo.id!,
    });
    if (res.data.code == 200) {
      comments.value.forEach((item, index) => {
        if (item.id == comment.id) {
          // 将获取到的列表转换为展示的列表
          comments.value[index].totalSubCommentCnt = res.data.data?.total;
          comments.value[index].subComments = res.data.data?.list?.map((item) => {
            return convertCommentVOToCommentItem(item, 'sub');
          }) ?? [];
        }
      });
    }
  } catch (e) {
    // ignore
  }
}

function changeSortMode(mode: 'hot'|'new') {
  if (mode === sortMode.value) return;
  sortMode.value = mode;
  currentPage.value = MINIMUM_PAGE;
  refetchComments();
}

async function handleCommentPublish() {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请先登录'});
    return;
  }
  try {
    const res = await commentApi.commentController.addCommentUsingPost({
      foreignId: props.postId,
      content: form.comment,
      targetUsername: '',
      userId: userStore.userInfo.id ?? 0,
      username: userStore.userInfo.name ?? '',
    });
    if (res.data.code == 200) {
      showToast({position: 'top', text: '评论成功'});
      clearCommentInput();
      refetchComments();
    } else {
      showToast({position: 'top', text: '评论失败'});
    }
  } catch (e) {
    // ignore
  }
}

async function handleCommentDelete(commentId: string) {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请先登录'});
    return;
  }
  const dialogRes = await DialogManager.commonDialog({
    title: '删除评论',
    content: `确认要删除该评论吗？`,
  });
  if (!dialogRes) return;
  try {
    const res = await commentApi.commentController.deleteRootCommentUsingDelete({
      pid: commentId,
    });
    if (res.data.code == 200) {
      showToast({position: 'top', text: '删除成功'});
      refetchComments();
    } else {
      showToast({position: 'top', text: '删除失败'});
    }
  } catch (e) {
    // ignore
  }
}

async function handleSubCommentDelete(commentId: string, subCommentId: string) {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请先登录'});
    return;
  }
  const dialogRes = await DialogManager.commonDialog({
    title: '删除评论',
    content: `确认要删除该评论吗？`,
  });
  if (!dialogRes) return;
  try {
    const res = await commentApi.commentController.deleteChildCommentUsingDelete({
      pid: commentId,
      cid: subCommentId,
    });
    if (res.data.code == 200) {
      showToast({position: 'top', text: '删除成功'});
      refetchComments();
    } else {
      showToast({position: 'top', text: '删除失败'});
    }
  } catch (e) {
    // ignore
  }
}

async function handleCommentToTop(commentId: string) {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请先登录'});
    return;
  }
  try {
    const res = await commentApi.commentController.toTopCommentUsingPost({
      flag: 1,
      pid: commentId,
    });
    if (res.data.code == 200) {
      showToast({position: 'top', text: '置顶成功'});
      refetchComments();
    } else {
      showToast({position: 'top', text: '置顶失败'});
    }
  } catch (e) {
    // ignore
  }
}

async function handleCommentToGround(commentId: string) {
  if (!userStore.isLogin) {
    showToast({position: 'top', text: '请先登录'});
    return;
  }
  try {
    const res = await commentApi.commentController.toTopCommentUsingPost({
      flag: 0,
      pid: commentId,
    });
    if (res.data.code == 200) {
      showToast({position: 'top', text: '取消置顶成功'});
      refetchComments();
    } else {
      showToast({position: 'top', text: '取消置顶失败'});
    }
  } catch (e) {
    // ignore
  }
}

const likeCacheStore = useLikeCacheStore();
async function handleLike(pid: string, isChild: boolean, cid: string = '', pUid: number) {
  try {
    const flag = likeCacheStore.isLiked(isChild ? cid : pid) ? -1 : 1;
    let res;
    if (!isChild) {
      res = await commentApi.commentController.likeRootCommentUsingPost({
        pid: pid,
        flag: flag,
        uid: userStore.userInfo.id!,
        pUid: pUid,
      });
    } else {
      if (cid == '') return;
      res = await commentApi.commentController.likeChildrenCommentUsingPost({
        cid: cid,
        flag: flag,
        pid: pid,
        uid: userStore.userInfo.id!,
        pUid: pUid,
      });
    }
    if (res.data.code == 200) {
      likeCacheStore.like(isChild ? cid : pid);
      comments.value.forEach((item) => {
        if (item.id === pid) {
          if (!isChild) {
            // 如果是根评论，更新根评论的点赞数
            item.likeCount += flag;
            item.isLiked = true;
          } else {
            // 如果是子评论，更新子评论的点赞数
            item.subComments.forEach((subItem) => {
              if (subItem.id == cid) {
                subItem.likeCount += flag;
                subItem.isLiked = true;
              }
            });
          }
        }
      });
      showToast({position: 'top', text: (flag < 0 ? '取消' : '') + '点赞成功'});
    } else {
      showToast({position: 'top', text: '点赞失败'});
    }
  } catch (e) {
    // ignore
  }
}
async function handleDislike(pid: string, isChild: boolean, cid: string = '', pUid: number) {
  try {
    const id = isChild ? cid : pid;
    if (likeCacheStore.isLiked(id)) {
      await handleLike(pid, isChild, cid, pUid);
    }
    likeCacheStore.dislike(id);
    showToast({position: 'top', text: '点踩成功'});
  } catch (e) {
    // ignore
  }
}

function handleChangePage(paginationPage: number) {
  currentPage.value = paginationPage + MINIMUM_PAGE - 1;
  refetchComments();
}

function handleSubChangePage(comment: CommentItem, page: number) {
  comments.value.forEach((item) => {
    if (item.id == comment.id) {
      item.currentPage = page - 1;
      getSubComments(comment);
    }
  });
}

function clearCommentInput() {
  form.comment = '';
  currentPage.value = MINIMUM_PAGE;
}

// ========== 回复相关 ==========
const replyingComment = ref<CommentItem>(); // 正在回复的评论
const replyingCommentSub = ref<CommentItem>(); // 正在回复的子评论

function changeReplyingComment(comment: CommentItem, subComment: CommentItem | undefined = undefined) {
  if (!subComment) {
    // 如果是要回复根评论
    if (replyingComment.value?.id != comment.id || replyingCommentSub.value) {
      replyingComment.value = comment;
    } else {
      replyingComment.value = undefined;
    }
    replyingCommentSub.value = undefined;
  } else {
    // 如果是要回复子评论
    if (replyingCommentSub.value?.id == subComment.id) {
      replyingComment.value = undefined;
      replyingCommentSub.value = undefined;
    } else {
      replyingComment.value = comment;
      replyingCommentSub.value = subComment;
    }
  }
}

const replyPublishing = ref(false); // 正在上传回复
async function handleReplyPublish() {
  replyPublishing.value = true;
  try {
    let res;
    if (!replyingCommentSub.value) {
      // 回复的是根评论
      res = await commentApi.commentController.replyCommentUsingPost({
        pid: replyingComment.value?.id ?? '',
      }, {
        foreignId: props.postId,
        content: form.reply,
        targetUsername: '',
        userId: userStore.userInfo.id ?? 0,
        username: userStore.userInfo.name ?? '',
      });
    } else {
      // 回复的是子评论
      res = await commentApi.commentController.replyCommentUsingPost({
        pid: replyingComment.value?.id ?? '',
      }, {
        foreignId: props.postId,
        content: form.reply,
        targetUsername: replyingCommentSub.value?.userName,
        userId: userStore.userInfo.id ?? 0,
        username: userStore.userInfo.name ?? '',
      });
    }
    if (res.data.code == 200) {
      quickToast("回复成功！");
      handleSubChangePage(replyingComment.value!, 1);
    }
  } finally {
    replyPublishing.value = false;
    form.reply = '';
    replyingComment.value = undefined;
    replyingCommentSub.value = undefined;
  }
}

function getCommentContentHtml(comment: CommentItem) {
  let html = comment.content;
  if (comment.targetUsername) {
    html = `<a class="comment-content-a">@${comment.targetUsername}</a> ` + html;
  }
  return html;
}

</script>

<template>
  <div class="comment-view">
    <div class="header">
      <span class="title">评论</span>
      <span class="count">{{ commentCount }}</span>
      <span class="sort-hot" :class="{'active': sortMode == 'hot'}" @click="changeSortMode('hot')">最热</span>
      <span>|</span>
      <span class="sort-new" :class="{'active': sortMode == 'new'}" @click="changeSortMode('new')">最新</span>
    </div>
    <div class="comment-publish">
      <div class="avatar">
        <img :src="userStore.avatar ?? `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${userStore.userInfo.id}`" alt="avatar" />
      </div>
      <div class="input">
        <textarea placeholder="你猜我的评论区在等谁？" v-model="form.comment" />
      </div>
      <button class="publish" :class="{'enable': form.comment.length > 0}" @click="handleCommentPublish" :disabled="!form.comment.length">
        <span>发布</span>
      </button>
    </div>
    <div class="comment-list">
      <div class="item" v-for="comment in comments" :key="comment.id">
        <div class="avatar"><img :src="comment.userAvatar || `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${comment.userId}`" alt="avatar" /></div>
        <div class="body">
          <div class="header user-info">
            <span class="name">{{ comment.userName }}</span>
            <span class="level" v-if="comment.userLevel">Lv.{{ comment.userLevel }}</span>
          </div>
          <div class="content">{{ comment.content }}</div>
          <div class="footer">
            <DateFormat :date="comment.createTime" class="time" />
            <span class="like" :class="{'active': likeCacheStore.isLiked(comment.id)}" @click="handleLike(comment.id, false, '', comment.userId)"><thumbs-up theme="outline" size="1rem"/>{{ comment.likeCount }}</span>
            <span class="dislike" :class="{'active': likeCacheStore.isDisliked(comment.id)}" @click="handleDislike(comment.id, false, '', comment.userId)"><thumbs-down theme="outline" size="1rem"/></span>
            <span class="reply" @click="changeReplyingComment(comment)">回复</span>
            <CusPopover style="margin-left: auto;" position="left">
              <template #body>
                <CusButton><MoreOne /></CusButton>
              </template>
              <template #popover>
                <div style="display: flex; border-radius: .5rem; background-color: white; box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);">
                  <CusButton @click="handleCommentDelete(comment.id)"
                              v-if="userStore.userInfo.id == comment.userId || userStore.userInfo.id == props.postUserId">
                    <DeleteOne theme="outline" :fill="variables.colorDanger" />
                  </CusButton>
                  <CusButton @click="handleCommentToGround(comment.id)"
                              v-if="userStore.userInfo.id == props.postUserId">
                    <ToTopOne style="rotate: 180deg;" theme="outline" :fill="variables.colorPrimary" />
                  </CusButton>
                  <CusButton @click="handleCommentToTop(comment.id)"
                              v-if="userStore.userInfo.id == props.postUserId">
                    <ToTopOne theme="outline" :fill="variables.colorPrimary" />
                  </CusButton>
                </div>
              </template>
            </CusPopover>
          </div>
          <!-- 根评论回复 -->
          <div v-if="replyingComment?.id == comment.id && !replyingCommentSub" class="comment-publish">
            <div class="input">
              <textarea :placeholder="'回复 @'+comment.userName" v-model="form.reply" />
            </div>
            <button class="publish" :class="{'enable': form.reply.length > 0}" @click="handleReplyPublish" :disabled="!form.reply.length">
              <span v-if="!replyPublishing">发布</span>
              <Spinning v-if="replyPublishing" />
            </button>
          </div>
          <div class="sub-comment-list">
            <div class="item" v-for="subComment in comment.subComments" :key="subComment.id">
              <div class="avatar-small"><img :src="subComment.userAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=id${subComment.userId}`"  alt="avatar-small"/></div>
              <div class="body">
                <div class="header">
                  <div class="user-info">
                    <span class="name">{{ subComment.userName }}</span>
                    <span class="level" v-if="subComment.userLevel">Lv.{{ subComment.userLevel }}</span>
                  </div>
                  <span class="content" v-html="getCommentContentHtml(subComment)"></span>
                </div>
                <div class="footer">
                  <DateFormat :date="subComment.createTime" class="time" />
                  <span class="like" :class="{'active': likeCacheStore.isLiked(subComment.id)}" @click="handleLike(comment.id, true, subComment.id, subComment.userId)"><thumbs-up theme="outline" size="1rem"/>{{ subComment.likeCount }}</span>
                  <span class="dislike" :class="{'active': likeCacheStore.isDisliked(subComment.id)}" @click="handleDislike(comment.id, true, subComment.id, subComment.userId)"><thumbs-down theme="outline" size="1rem"/></span>
                  <span class="reply" @click="changeReplyingComment(comment, subComment)">回复</span>
                  <CusPopover style="margin-left: auto;" position="left">
                    <template #body>
                      <CusButton><MoreOne /></CusButton>
                    </template>
                    <template #popover>
                      <div style="display: flex; border-radius: .5rem; background-color: white; box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);">
                        <CusButton @click="handleSubCommentDelete(comment.id, subComment.id)"
                                    v-if="userStore.userInfo.id == subComment.userId || userStore.userInfo.id == props.postUserId">
                          <DeleteOne theme="outline" :fill="variables.colorDanger" />
                        </CusButton>
                      </div>
                    </template>
                  </CusPopover>
                </div>
                <!-- 子评论回复 -->
                <div v-if="replyingCommentSub?.id == subComment.id" class="comment-publish">
                  <div class="input">
                    <textarea :placeholder="'回复 @'+subComment.userName" v-model="form.reply" />
                  </div>
                  <button class="publish" :class="{'enable': form.reply.length > 0}" @click="handleReplyPublish" :disabled="!form.reply.length">
                    <span v-if="!replyPublishing">发布</span>
                    <Spinning v-if="replyPublishing" />
                  </button>
                </div>
              </div>
            </div>
            <CusPagination v-if="(comment.totalSubCommentCnt ?? 0) > 3" :page-count="Math.ceil((comment.totalSubCommentCnt ?? 0) / 3)" @change="(page: number) => handleSubChangePage(comment, page)" />
          </div>
          <hr style="margin-right: 5rem;" />
        </div>
      </div>
      <div class="pagination" v-if="commentCount > comments.length">
        <button class="button" :disabled="currentPage - 1 < MINIMUM_PAGE" @click="handleChangePage(currentPage - MINIMUM_PAGE)"><Left class="button" size="1rem" /></button>
        <div v-for="i in commentPageNums" :key="i" :class="{'active': currentPage - MINIMUM_PAGE + 1 == i}" @click="handleChangePage(i)">
          <span>{{ i }}</span>
        </div>
        <button class="button" :disabled="currentPage - MINIMUM_PAGE + 2 > commentPageNums.length" @click="handleChangePage(currentPage - MINIMUM_PAGE + 2)"><Right class="button" size="1rem" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/variables.module";
.comment-view {

  > .header {
    height: 3rem;
    color: $color-grey-500;

    > .title {
      font-size: 1.5rem;
      color: $color-black-lighter;
      margin-left: 1rem;
    }
    > .count {
      margin-left: 1rem;
      margin-right: 3rem;
    }
    > .sort-hot, > .sort-new {
      margin: 0 1rem;
      &:not(&.active) {
        cursor: pointer;
      }
      &.active {
        color: $color-primary;
      }
    }
  }
  .comment-publish {
    display: flex;
    gap: .5rem;

    > .avatar {
      margin-left: 1.5rem;
      width: 3rem;
      height: 3rem;
      > img {
        border-radius: .5rem;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    }
    > .input {
      @extend %transition-all-circ;
      flex: 1;
      border-radius: .5rem;
      background-color: $color-grey-100;
      padding: .5rem;
      &:focus-within {
        background-color: $color-grey-200;
      }

      > textarea {
        width: 100%;
        background: transparent;
        height: 2rem;
      }
    }
    > .publish {
      @extend %button-like;
      @extend %transition-all-circ;
      color: white;
      width: 5rem;
      background-color: $color-primary-lighter;
      display: grid;
      place-items: center;
      &.enable {
        background-color: $color-primary;
      }
    }
  }

  > .comment-list {
    margin-top: 1rem;
    margin-left: 1.75rem;
    .item {
      display: flex;
      gap: 1rem;
      margin-bottom: .5rem;
      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        img {
          border-radius: .5rem;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      }
      .avatar-small {
        width: 1.75rem;
        height: 1.75rem;
        img {
          border-radius: .5rem;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      }
      .body {
        flex: 1;
        .header {
          // 前者.user-info作用于.header内，对应子评论；后者&.user-info作用于.header同级，对应一级评论
          .user-info, &.user-info {
            display: inline-flex;
            align-items: baseline;
            gap: .5rem;
            margin-right: .5rem;
            word-break: break-word;
            word-wrap: break-word;
            white-space: pre-wrap;
            overflow: hidden;
            .name {
              white-space: nowrap; // 避免挤压换行
              font-size: .9rem;
              color: $color-primary;
            }
            .level {
              white-space: nowrap; // 避免挤压换行
              font-size: .75rem;
              color: $color-grey-500;
            }
          }
          > .content {
            font-size: .9rem;
            word-break: break-word;
            word-wrap: break-word;
            white-space: pre-wrap;
            vertical-align: baseline;
            overflow: hidden;
          }
        }
        > .content {
          font-size: .9rem;
          color: $color-black-lighter;
        }
        .footer {
          margin-top: .5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          .time {
            font-size: .75rem;
            color: $color-grey-500;
          }
          .like, .dislike {
            cursor: pointer;
            font-size: .75rem;
            color: $color-grey-500;
            &.active {
              color: $color-primary;
            }
          }
          .reply {
            cursor: pointer;
            font-size: .75rem;
            color: $color-grey-500;
          }
        }
        .sub-comment-list {
          margin-top: .5rem;
        }
        .sub-comment-more {
          cursor: pointer;
          color: $color-grey-500;
          font-size: .9rem;
        }
      }
    }

    > .pagination {
      display: flex;
      justify-content: flex-end;
      gap: .25rem;
      margin-bottom: .5rem;

      div {
        @extend %click-able;
        @extend %button-like;
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;
        vertical-align: center;
        position: relative;
        span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &.active {
          background-color: $color-primary;
          color: white;
        }
      }

      > .button {
        &:disabled {
          cursor: default;
        }
        &:not(&:disabled) {
          @extend %click-able;
        }
        background-color: $color-grey-100;
        color: darken($color-grey-500, 50%);
        width: 1.5rem;
        height: 1.5rem;
        border-radius: .5rem;
        position: relative;
        span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
}
</style>

<!--单独一个没有scoped的css让v-html中的类选择器也能被识别 -->
<style lang="scss">
@import "@/assets/variables.module";
.comment-content-a {
  cursor: pointer;
  text-decoration: none;
  color: $color-primary;
  &:hover {
    color: darken($color-primary, 10%);
  }
  &:active {
    color: darken($color-primary, 20%);
  }
}
</style>