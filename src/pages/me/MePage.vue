<script lang = "ts" setup>
import useUserStore from '@/stores/useUserStore';
import { DEFAULT_USER_AVATAR } from '@/constants/defaultImage';
import CusButton from '@/components/button/CusButton.vue';
import type { PostItemCardProps } from '@/pages/post/components/PostItemCard';
import PostItemCard from '@/pages/post/components/PostItemCard.vue';
import { ref } from 'vue';


const userStore = useUserStore(); // 通过useUserStore获取用户信息
const posts = ref<PostItemCardProps[]>([]); // 所有的帖子
const myPosts = posts.value.filter(item => item.userId == userStore.userInfo?.id); // 过滤出用户的帖子
const hasNoMore = ref(false); // 是否还有更多帖子
// 修改用户资料
function edit() {

}

// 删除帖子
function handlePostDeleted(id: number) {
  posts.value.forEach((item, index) => {
    if (item.postId == id) {
      posts.value.splice(index, 1);
    }
  });
}

// 加载更多帖子
function handleLoadMore() {

}

</script>

<template>
  <div class = "me">
    <div class = "me-container">
      <aside class = "me-left">
        <section v-if = "userStore.isLogin" ref = "meLeftUserRef" class = "me-left-user">
          <div>
            <div class = "avatar"><img :src = "userStore.avatar ?? DEFAULT_USER_AVATAR" alt = "me-user-avatar" />
            </div>
            <div class = "info"><span class = "username">{{ userStore.userInfo?.name ?? '匿名用户' }}</span><br /><span
              class = "vip">初级用户</span></div>
          </div>
          <div class = "stats">
            <div id = "me-left-user-follow" class = "stats-item"><span>{{ 1024 }}</span><span>成长值</span></div>
            <div id = "me-left-user-fans" class = "stats-item"><span>{{ 11 }}</span><span>帖子</span></div>
            <div id = "me-left-user-likes" class = "stats-item"><span>{{ 666 }}</span><span>点赞</span></div>
          </div>
        </section>
        <section class = "me-left-edit" @click = "edit">
          编辑资料
        </section>
      </aside>
      <main class = "me-main">
        <section class = "me-main-actions">
          <div class = "me-main-actions-title">
            <CusButton id = "me-main-myPost" text = "我的帖子" type = "text"></CusButton>
            <CusButton id = "me-main-involved" text = "我参与的" type = "text"></CusButton>
          </div>
        </section>
        <section class = "me-main-posts">
          <PostItemCard v-for = "item in myPosts" :key = "item.postId" :avatar = "item.avatar"
                        :comment-count = "item.commentCount"
                        :content = "item.content"
                        :create-time = "item.createTime"
                        :forward-count = "item.forwardCount"
                        :images = "item.images"
                        :is-liked = "item.isLiked"
                        :like-count = "item.likeCount"
                        :post-id = "item.postId!"
                        :type = "item.type ?? 'post'"
                        :user-id = "item.userId!"
                        :user-name = "item.userName"
                        class = "post-item"
                        @delete-post = "(id) => handlePostDeleted(id)"
          />
          <div v-if = "!hasNoMore" ref = "loadMoreRef" class = "load-more" @click = "handleLoadMore">加载更多...</div>
        </section>
      </main>
    </div>
  </div>
</template>

<style lang = "scss" scoped>
@import "@/assets/variables.module";
@import "@/assets/functions";

.me {
  //display: flex;
  
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
    //width: 30%;
    height: 100%;
    display: flex;
    flex: 1;
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
          margin-bottom: .5rem;
        }
      }
      
      .avatar {
        width: 4rem;
        height: 4rem;
        border-radius: .75rem;
        overflow: hidden;
        
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
            color: #424242FF;
          }
          
          & span:last-child {
            font-size: .8rem;
            color: #9E9E9EFF;
          }
        }
      }
    }
    
    &-edit {
      @extend %click-able;
      @extend %button-like;
      @extend %card;
      margin-top: .1rem;
      font-size: 1rem;
      text-align: center;
      color: $color-primary;
      
      &:hover {
        color: white;
        font-size: 1.1rem;
        background-color: $color-primary;
      }
    }
  }
  
  &-main {
    height: 100%;
    display: flex;
    flex: 4;
    flex-direction: column;
    gap: .5rem;
    
    &-actions {
      @extend %card;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: .5rem;
      
      &-title {
        font-size: 1.1rem;
        font-weight: normal;
        color: $color-primary;
        display: flex;
      }
    }
    
    &-posts {
      display: flex;
      flex-direction: column;
      gap: .5rem;
      .post-item {
        @extend %card;
      }
      .load-more {
        @extend %click-able;
        @extend %button-like;
        @extend %card;
        text-align: center;
        color: $color-primary;
      }
    }
  }
}
</style>