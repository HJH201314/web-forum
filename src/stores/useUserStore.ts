import { defineStore } from "pinia";
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import securityApi from "@/apis/services/video-platform-security";
import { useLocalStorage } from "@vueuse/core";

const useUserStore = defineStore('user', () => {

  const avatar = ref<string|undefined>();
  const tokenStorage = useLocalStorage('token', '');
  const token = computed(() => tokenStorage.value);
  const userInfoStorage = useLocalStorage<API.User>('user-info', {});
  const userInfo = computed(() => userInfoStorage.value);
  const isLogin = computed(() => !!userInfo.value.id);

  onMounted(async () => {
    // 获取用户信息
    await getUserInfo();
  });

  async function getUserInfo() {
    try {
      const res = await securityApi.loginController.getCurrentUserUsingGet({token: token.value});
      userInfoStorage.value = res.data.data ?? {};
      avatar.value = `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${res.data.data?.id}`;
      console.log('user_info', userInfoStorage.value);
    } catch (e) {
      console.error(e);
      userInfoStorage.value = {};
      avatar.value = `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=notlogin`;
    }
  }

  const login = async (type: 'phone' | 'email', principal: string, credential: string) => {
    let res;
    if (type == 'phone') {
      res = await securityApi.loginController.loginUsingPost({phone: principal, pswd: credential, type: 0});
    } else if (type == 'email') {
      res = await securityApi.loginController.loginUsingPost({email: principal, pin: credential, type: 1});
    }
    if (res?.data.code === 200) {
      tokenStorage.value = res.data.data ?? '';
      await nextTick(async () => {
        // 获取用户信息
        const res2 = await securityApi.loginController.getCurrentUserUsingGet({token: tokenStorage.value});
        userInfoStorage.value = res2.data.data ?? {};
        avatar.value = `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${res2.data.data?.id}`;
        console.log('user_info', userInfoStorage.value);
      });
      return res?.data;
    } else {
      return {};
    }
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
    return res?.data;
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
      avatar.value = `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=notlogin`;
    }
  };

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