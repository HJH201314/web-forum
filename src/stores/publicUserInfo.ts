/**
 *  @description 缓存用户公开信息，减少多次请求消耗
 *  提供useUserInfo响应式获取，getUserInfo异步获取
 *
 *  */

import services from '@/apis/services';
import { ref, toValue, watch, watchEffect } from "vue";
import type { MaybeRefOrGetter } from "vue";

/**
 * 获取用户公开信息
 * @param uid 用户UID
 */
export const getUserInfo = async (uid: number): Promise<API.UserInfo> => new Promise((resolve, reject) => {
  const userInfo = sessionStorage.getItem(`user-info-${uid}`);
  if (userInfo) {
    resolve(JSON.parse(userInfo) as API.UserInfo);
  } else {
    services.adminService.userInfoController.getUserInfoByUidUsingGet({ uid }).then(res => {
      if (res.data.code === 200) {
        sessionStorage.setItem(`user-info-${uid}`, JSON.stringify(res.data.data));
        resolve(res.data.data ?? {});
      }
    }).finally(() =>resolve({} as API.UserInfo));
  }
});

/**
 * 响应式获取用户公开信息
 * @param uid 用户UID（如果UID初始为空，请传入getter）
 * @param callback 请求成功回调函数
 */
export default function useUserInfo(uid: MaybeRefOrGetter<number | undefined>, callback?: (userInfo: API.UserInfo) => void) {
  // 获取状态，none-无操作、loading-请求中、success-请求成功、failed-请求失败
  const status = ref<'success' | 'failed' | 'loading' | 'none'>('none');
  // 用户公开信息
  const userInfo = ref<API.UserInfo>();
  // 用户essay信息
  const essayCount = ref<number>(0);

  watch(() => toValue(uid), (val) => {
    if (val) {
      Promise.all([
        getUserInfoFunc(val),
        getEssayNumFunc(val),
      ]).then();
    } else {
      status.value = 'none';
    }
  }, { immediate: true });

  async function getUserInfoFunc(uid: number) {
    try {
      // 发起请求
      status.value = 'loading';
      userInfo.value = await getUserInfo(uid);
      // 请求成功
      status.value = 'success';
      callback?.(userInfo.value);
    } catch (e) {
      status.value = 'failed';
    }
  }

  async function getEssayNumFunc(uid: number) {
    try {
      // 发起请求
      status.value = 'loading';
      const res = await services.adminService.updatesController.countUpdatesUsingGet({
        uid: uid,
      });
      if (res.data.code == 200) {
        // 请求成功
        status.value = 'success';
        essayCount.value = res.data.data!;
      }
    } catch (e) {
      status.value = 'failed';
    }
  }

  return {
    status, userInfo, essayCount,
  };
}