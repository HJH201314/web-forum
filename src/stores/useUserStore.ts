import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import securityApi from "@/apis/services/video-platform-security";
import adminApi from "@/apis/services/video-platform-admin";
import { useLocalStorage } from "@vueuse/core";
import { convertUserFile } from '@/pages/post/utils/image';
import { delay } from '@/utils/delay';
import { SHA256 } from 'crypto-js';
import { getUserInfo } from '@/stores/publicUserInfo';

const useUserStore = defineStore('user', () => {

  const avatar = ref<string|undefined>();
  const tokenStorage = useLocalStorage('token', '');
  const token = computed(() => tokenStorage.value);
  const userInfoStorage = useLocalStorage<API.User>('user-info', {});
  const userInfo = computed(() => userInfoStorage.value);
  const isLogin = computed(() => !!userInfo.value.id);

  const rememberUserStorage = useLocalStorage('remember-user', {
    phone: '',
    email: '',
  });
  const rememberUser = computed(() => rememberUserStorage.value);
  const isRememberUser = computed(() => rememberUserStorage.value.phone || rememberUserStorage.value.email);

  onMounted(async () => {
    // 获取用户信息
    await getCurrentUserInfo();
  });

  async function getCurrentUserInfo() {
    try {
      const res = await securityApi.loginController.getCurrentUserUsingGet({token: token.value});
      userInfoStorage.value = res.data.data ?? {};
      avatar.value = convertUserFile(res.data.data?.avatar) ?? `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${res.data.data?.id}`;
      userInfoStorage.value.avatar = avatar.value;
      // 使用公共用户信息接口更新头像，避免登录缓存问题
      getUserInfo(userInfo.value.id!).then(res => {
        if (res.avatar && res.avatar !== userInfo.value.avatar) {
          userInfoStorage.value.avatar = convertUserFile(res.avatar);
          avatar.value = convertUserFile(res.avatar);
        }
      });
      console.log('avatar', avatar.value);
      console.log('user_info', userInfoStorage.value);
    } catch (e) {
      console.error(e);
      userInfoStorage.value = {};
      avatar.value = `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=notlogin`;
    }
  }

  async function saveName(name: string) {
    const res = await securityApi.loginController.updateUserUsingPost({
      name: name,
    });
    if (res.data.code === 200) {
      await getCurrentUserInfo();
      // 使用公共用户信息接口更新用户信息，避免登录缓存问题
      getUserInfo(userInfo.value.id!).then(res => {
        if (res.name !== userInfo.value.name) {
          userInfoStorage.value.name = res.name;
        }
      });
      return true;
    }
    return false;
  }

  async function savePassword(password: string) {
    const res = await securityApi.loginController.updateUserUsingPost({
      password: SHA256(password).toString(),
    });
    return res.data.code === 200;
  }

  async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await adminApi.updatesControllerFix.uploadFileUsingPost(formData);
    if (res.data.code === 200) {
      avatar.value = convertUserFile(res.data.data) ?? '';
      // 请求更新用户信息
      const res2 = await securityApi.loginController.updateUserUsingPost({
        avatar: res.data.data,
      });
      if (res2.data.code === 200) {
        delay(1000).then(() => {
          getCurrentUserInfo();

          // 延迟10秒，至少等待缓存更新
          delay(10000).then(() => {
            // 使用公共用户信息接口更新用户信息，避免登录缓存问题
            getUserInfo(userInfo.value.id!).then(res => {
              if (res.avatar !== userInfo.value.avatar) {
                userInfoStorage.value.avatar = convertUserFile(res.avatar);
                avatar.value = convertUserFile(res.avatar);
              }
            });
          });
        });
        return true;
      }
    }
    return false;
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
      await nextTick(() => {
        // 获取用户信息
        getCurrentUserInfo();
      });
      return res?.data;
    } else {
      return res?.data;
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

  function setRememberUser(remember: boolean, principal?: string, type?: 'phone' | 'email') {
    rememberUserStorage.value = {
      phone: '',
      email: '',
    };
    if (remember) {
      if (type === 'phone') {
        rememberUserStorage.value.phone = principal ?? '';
      } else if (type === 'email') {
        rememberUserStorage.value.email = principal ?? '';
      }
    }
  }

  return {
    token,
    avatar,
    userInfo,
    isLogin,
    login,
    logout,
    sendPin,
    register,
    uploadAvatar,
    saveName,
    savePassword,
    isRememberUser,
    rememberUser,
    setRememberUser,
  };
});

export default useUserStore;

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}