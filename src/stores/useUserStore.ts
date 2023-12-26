import { defineStore } from "pinia";
import { computed, nextTick, ref, watch } from "vue";
import securityApi from "@/apis/services/video-platform-security";
import { useLocalStorage } from "@vueuse/core";
import { DEFAULT_USER_AVATAR, getDefaultAvatar } from '@/constants/defaultImage';

const useUserStore = defineStore('user', () => {

  const avatar = ref<string|undefined>();
  const tokenStorage = useLocalStorage('token', '');
  const token = computed(() => tokenStorage.value);
  const userInfoStorage = useLocalStorage<API.User>('user-info', {});
  const userInfo = computed(() => userInfoStorage.value);
  const isLogin = computed(() => !!token.value);

  const login = async (type: 'phone' | 'email', principal: string, credential: string) => {
    let res;
    if (type == 'phone') {
      res = await securityApi.loginController.loginUsingPost({phone: principal, pswd: credential, type: 0});
    } else if (type == 'email') {
      res = await securityApi.loginController.loginUsingPost({email: principal, pin: credential, type: 1});
    }
    if (res?.data.code === 200) {
      tokenStorage.value = res.data.data ?? '';
      return true;
    } else {
      return false;
    }
    // setTimeout(() => {
    //   if ((type === 'password' && principal === 'guest' && credential === '123456') ||
    //       (type === 'sms' && principal === '11111111111' && credential === '654321')
    //   ) {
    //     userId.value = 1;
    //     avatar.value = 'https://img.yzcdn.cn/vant/cat.jpeg';
    //
    //   } else {
    //
    //   }
    // }, 1000);
  };

  const sendPin = async (type: 'phone' | 'email', principal: string) => {
    const res = await securityApi.loginController.getPinUsingPost({auth: principal, type: type == 'email' ? 0 : 1});
    return res.data.code === 200;
  };

  const register = async (type: 'phone' | 'email', principal: string, credential: string) => {
    const param: API.RegisterDto = {
      name: `匿名用户${principal.slice(0, 3)}`,
      email: type === 'email' ? principal : undefined,
      phone: type === 'phone' ? principal : undefined,
      pswd: type === 'phone' ? credential : undefined,
      pin: type === 'email' ? credential : undefined,
      type: type === 'phone' ? 1 : 2,
    };
    const res = await securityApi.loginController.registerUsingPost(param);
    return res?.data.code === 200;
  };

  const logout = async () => {
    try {
      if (token.value) {
        const res = await securityApi.loginController.logoutUsingGet({token: token.value});
        if (res?.data.code === 200) {
          return true;
        }
      }
      return false;
    } finally {
      // 无论如何，都清空token和用户信息
      tokenStorage.value = '';
      userInfoStorage.value = {};
    }
  };

  watch(isLogin, async (newVal, oldVal) => {
    // 等一下个tick，不然token可能还没写入storage
    await nextTick(async() => {
      if (newVal && !oldVal) {
        avatar.value = getDefaultAvatar(userInfo.value.name ?? '匿名用户');
        const res = await securityApi.loginController.getCurrentUserUsingGet({token: token.value});
        userInfoStorage.value = res.data.data ?? {};
      } else if (!newVal && oldVal) {
        userInfoStorage.value = {};
        avatar.value = undefined;
      }
    });
  });

  return {
    token,
    avatar,
    userInfo,
    isLogin,
    login,
    logout,
    sendPin,
    register,
  };
});

export default useUserStore;