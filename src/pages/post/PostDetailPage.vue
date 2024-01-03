<script setup lang="ts">

import PostItemCard from "./components/PostItemCard.vue";
import { computed, type CSSProperties, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import adminApi from "@/apis/services/video-platform-admin";
import showToast from "@/components/toast/toast";
import { Like, Star, ShareTwo } from "@icon-park/vue-next";
import CusButton from "@/components/button/CusButton.vue";
import { getDefaultAvatar, getDefaultAvatarByUid } from '@/constants/defaultImage';
import useUserInfo from '@/stores/publicUserInfo';
import variables from '@/assets/variables.module.scss';
import type { CusButtonProps } from '@/components/button/CusButton';
import useLikeCacheStore from '@/stores/useLikeCacheStore';
import { getLighterColor } from '@/utils/color';

const props = withDefaults(defineProps<{
  postId?: string;
}>(), {

});

const pid = computed(() => {
  return parseInt(props.postId ?? '-1');
});

onMounted(() => {
  if (!pid.value || pid.value <= 0) {
    showToast({
      text: '参数异常',
      type: 'danger',
    });
    useRouter().replace('/home');
  }

  Promise.all([
    getPost(),
  ]);
});

const post = ref<API.Update & {
  images?: string[],
}>({});

const userInfo = useUserInfo(() => post.value.uid);

async function getPost() {
  try {
    const res = await adminApi.updatesController.getEssayByIdUsingGet({
      id: pid.value!,
    });
    if (res.data.code == 200) {
      post.value = res.data.data!;
      post.value.content = decodeURIComponent(post.value.content ?? '');
      post.value.images = JSON.parse(res.data.data?.urls ?? '[]') as string[];
    }
  } catch (ignore) { /* empty */ }
}

const likeCacheStore = useLikeCacheStore();
/* 计算点赞收藏转发bar的位置 */
const postItemCardRef = ref<HTMLDivElement>();
const actionBarLeft = ref<CSSProperties['left']>('');
onMounted(() => {
  console.log(postItemCardRef.value?.offsetLeft, postItemCardRef.value?.offsetWidth);
  actionBarLeft.value = `calc(${postItemCardRef.value?.offsetLeft! + postItemCardRef.value?.offsetWidth!}px + .5rem)`;
});

const defaultButtonStyle: CSSProperties = {
  'flex-direction': 'column',
  'padding': '.5rem',
};
const buttonStyles = computed<CSSProperties[]>(() => {
  return [
    defaultButtonStyle,
    defaultButtonStyle,
    defaultButtonStyle,
  ];
});

</script>

<template>
  <div class="post-detail">
    <div ref="postItemCardRef" class="post-detail-card">
      <PostItemCard
        type="post"
        :post-id="pid"
        :user-id="post.uid"
        :user-name="userInfo.userInfo.value?.name"
        :avatar="getDefaultAvatarByUid(post.uid)"
        :content="post.content"
        :create-time="post.uploadTime"
        :images="post.images"

        :single-use="true"
        :show-action="false"
        default-tab="comment"
      />
    </div>
    <div class="post-detail-bar" :style="{'left': actionBarLeft}">
      <CusButton :button-style="buttonStyles[0]"
                 :type="likeCacheStore.isLiked('post:' + props.postId) ? 'primary' : 'normal'"
                 @click="likeCacheStore.like('post:' + props.postId)"
      >
        <Like size="1.5rem" />
      </CusButton>
      <CusButton :button-style="buttonStyles[1]"
                 :type="likeCacheStore.isLiked('post:star:' + props.postId) ? 'primary' : 'normal'"
                 @click="likeCacheStore.like('post:star:' + props.postId)"
      >
        <Star size="1.5rem" />
      </CusButton>
      <CusButton :button-style="buttonStyles[2]">
        <ShareTwo size="1.5rem" />
      </CusButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.post-detail {

  &-card {
    width: 70%;
    margin-inline: auto;
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: .5rem;
    box-sizing: border-box;
  }

  &-bar {
    position: absolute;
    top: 5rem;
    display: flex;
    flex-direction: column;
    gap: .25rem;

    &-action {

    }
  }

}
</style>