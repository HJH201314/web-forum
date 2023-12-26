/**
 * 本地记录已经点过赞的东西，骗过上帝
 *
 */
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

const useLikeCacheStore = defineStore('likeCache', () => {

  const likeCacheStorage = useLocalStorage<Record<string, number>>('like-cache', {});

  /**
   * 点赞
   * @param id
   */
  function like(id: string) {
    likeCacheStorage.value[id] = likeCacheStorage.value[id] == 1 ? 0 : 1;
  }

  /**
   * 点踩
   * @param id
   */
  function dislike(id: string) {
    likeCacheStorage.value[id] = likeCacheStorage.value[id] == -1 ? 0 : -1;
  }

  function isLiked(id: string) {
    return likeCacheStorage.value[id] == 1;
  }

  function isDisliked(id: string) {
    return likeCacheStorage.value[id] == -1;
  }

  return {
    like,
    dislike,
    isLiked,
    isDisliked,
  };
});

export default useLikeCacheStore;