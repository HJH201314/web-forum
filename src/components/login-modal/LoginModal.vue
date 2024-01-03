<script setup lang="ts">
import EasyTyper from 'easy-typer-js';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { Close, Right, Switch, Mail, Phone } from "@icon-park/vue-next";
import CommonModal from "@/components/modal/CommonModal.vue";
import type { CommonModalFunc } from "@/components/modal/CommonModal";
import useUserStore from "@/stores/useUserStore";
import showToast from "@/components/toast/toast";
import Spinning from "@/components/spinning/Spinning.vue";
import { delay } from "@/utils/delay";
import useGlobal from '@/commands/useGlobal';
import CusInput from '@/components/input/CusInput.vue';
import CusToggle from '@/components/toggle/CusToggle.vue';
import ToastManager from '@/components/toast/ToastManager';
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<{
  showByDefault?: boolean;
}>(), {
  showByDefault: false,
});

onMounted(() => {
  if (props.showByDefault) {
    open();
  }
});

const userStore = useUserStore();
const refLoginModal = ref<CommonModalFunc>();

const typerObj = reactive({
  output: '',
  isEnd: false,
  speed: 100,
  singleBack: false,
  sleep: 1000,
  type: 'normal',
  backSpeed: 40,
  sentencePause: false,
});

const typer = ref<EasyTyper>();

const show = ref(false);
function open() {
  // show=true时创建CommonModal实例
  show.value = true;
  // 创建完成后，下一刻再初始化
  nextTick(() => {
    init();
  });
}
function close() {
  // 关闭模态框
  show.value = false;
}
defineExpose({
  open,
  close,
});

const loginForm = reactive({
  mode: ref<'login'|'register'>('login'), // 登陆还是注册
  type: ref<'phone'|'email'>('phone'),
  phone: ref(''),
  email: ref(''),
  password: ref(''),
  retypePwd: ref(''),
  pin: ref(''),
  shakePhone: ref(0),
  shake: ref(0),
  remember: ref(false),
});
const smsTip = ref('获取验证码');
const emoji = ref('🚀');

function init() {
  emoji.value = '🚀';
  // @ts-ignore
  typer.value = new EasyTyper(typerObj, ['产品论坛', '立即登录']);
  // 清除上次的表单
  loginForm.password = '';
  loginForm.retypePwd = '';
  loginForm.pin = '';
  loginForm.phone = '';
  loginForm.email = '';
  // 处理记住账号
  if (userStore.isRememberUser) {
    loginForm.remember = true;
    loginForm.type = userStore.rememberUser.email ? 'email' : 'phone';
    if (loginForm.type == 'phone') {
      loginForm.phone = userStore.rememberUser.phone;
    } else {
      loginForm.email = userStore.rememberUser.email;
    }
  }
}

function handleChangeMode() {
  loginForm.mode = (loginForm.mode == 'login' ? 'register' : 'login');
  if (loginForm.mode == 'login') {
    // @ts-ignore
    typer.value = new EasyTyper(typerObj, ['产品论坛', '立即登录']);
  } else {
    // @ts-ignore
    typer.value = new EasyTyper(typerObj, '立即注册');
  }
}

const smsLoading = ref(false);
const refetchPinTimer = ref<number>();
async function handleGetSmsCode() {
  if (smsLoading.value || smsTip.value.endsWith('s')) {
    showToast({ text: '现在点不得！', position: 'bottom', type: 'warning' })
    return;
  }
  if (!loginForm.email || !loginForm.email.match(/.+@.+\..+/)) {
    loginForm.shakePhone += 1;
    showToast({ text: '请正确输入邮箱！', position: 'bottom', type: 'danger' });
    return;
  } else {
    try {
      smsLoading.value = true;
      const res = await userStore.sendPin('email', loginForm.email);
      if (!res) {
        throw new Error();
      }
      showToast({ text: '验证码已发送，请检查邮箱！', position: 'bottom', type: 'success' });
      setGetPinAvailable(); // 先清空计时器
      smsTip.value = '60s';
      let count = 60;
      refetchPinTimer.value = setInterval(() => {
        count--;
        smsTip.value = `${count}s`;
        if (count === 0) {
          setGetPinAvailable();
        }
      }, 1000);
    }
    catch (e) {
      console.error(e);
      loginForm.shake += 1;
      showToast({ text: '获取验证码失败', position: 'bottom', type: 'danger' });
      return;
    }
    finally {
      smsLoading.value = false;
    }
  }
}
function setGetPinAvailable() {
  clearInterval(refetchPinTimer.value);
  smsTip.value = '获取验证码';
}

const submitLoading = ref(false);
async function handleLoginSubmit() {
  if (loginForm.type == 'email' && !loginForm.email.match(/.+@.+\..+/)) {
    loginForm.shake += 1;
    showToast({ text: '请正确输入邮箱！', position: 'bottom', type: 'danger' });
    return;
  }
  if (loginForm.type == 'phone' && !loginForm.phone.match(/^1\d{10}$/)) {
    loginForm.shake += 1;
    showToast({ text: '请正确输入手机号！', position: 'bottom', type: 'danger' });
    return;
  }
  if (loginForm.type == 'phone' && loginForm.mode == 'register' && !loginForm.password.match(/^(?=.*[0-9])(?=.*[a-zA-Z]).{6,30}$/)) {
    loginForm.shake += 1;
    showToast({ text: '密码强度不足！', position: 'bottom', type: 'danger' });
    return;
  }
  if (loginForm.type == 'phone' && loginForm.mode == 'login' && !loginForm.password.match(/^.{6,30}$/)) {
    loginForm.shake += 1;
    showToast({ text: '请正确输入密码！', position: 'bottom', type: 'danger' });
    return;
  }
  if (loginForm.mode == 'register' && loginForm.type == 'phone' && loginForm.retypePwd != loginForm.password) {
    loginForm.shake += 1;
    showToast({ text: '重复输入密码错误！', position: 'bottom', type: 'danger' });
    return;
  }
  if (loginForm.type == 'email' && !loginForm.pin.match(/^\d{6}$/)) {
    loginForm.shake += 1;
    showToast({ text: '请正确输入验证码！', position: 'bottom', type: 'danger' });
    return;
  }
  try {
    submitLoading.value = true;
    let principal = '';
    let credential = '';
    if (loginForm.type == 'email') {
      principal = loginForm.email;
      credential = loginForm.pin;
    } else {
      principal = loginForm.phone;
      credential = loginForm.password;
    }
    if (loginForm.mode == 'login') {
      const result = await userStore.login(loginForm.type, principal, credential);
      if (result?.code != 200) {
        showToast({ text: `登录失败，${result?.data}`, position: 'bottom', type: 'danger' });
      }
    } else if (loginForm.mode == 'register') {
      const result = await userStore.register(loginForm.type, principal, credential);
      if (result?.data) {
        showToast({ text: '注册成功', position: 'bottom', type: 'success' });
        handleChangeMode();
        setGetPinAvailable();
      } else {
        showToast({ text: `注册失败，${result?.message}`, position: 'bottom', type: 'danger' });
      }
    }
    await delay(1000);
  }
  catch (e) {
    console.error(e);
    loginForm.shake += 1;
    showToast({ text: '点火失败', position: 'bottom', type: 'danger' });
    return;
  }
  finally {
    submitLoading.value = false;
  }
}

/* 观测userStore中的登录结果 */
watch(() => userStore.isLogin, (v) => {
  // 若登录成功，则提示并关闭模态框
  if (v) {
    emoji.value = '🎉';
    // @ts-ignore
    typer.value = new EasyTyper(typerObj, '欢迎回来');
    // 处理记住账号
    if (loginForm.remember) {
      userStore.setRememberUser(true, loginForm.type == 'phone' ? loginForm.phone : loginForm.email, loginForm.type);
    } else {
      userStore.setRememberUser(false);
    }
    // 关闭模态框
    setTimeout(() => {
      show.value = false;
    }, 1500);
  }
});

const router = useRouter();
</script>

<template>
  <CommonModal ref="refLoginModal" :show-close="false" v-model:visible="show">
    <template #default>
      <div class="login">
        <Close class="login-close" size="20" @click="() => refLoginModal?.close()" />
        <div style="margin-top: .5rem; display: flex;">
<!--          <span class="sidebar-logo sidebar-logo-animation">X Forum</span>-->
          <div class="login-type">
            <div class="login-type-item" :class="{'active': loginForm.type === 'phone'}" @click="loginForm.type = 'phone'">
              <Phone />
              <span>手机号{{ loginForm.mode == 'register' ? '注册' : '登录' }}</span>
            </div>
            <span>&nbsp;|&nbsp;</span>
            <div class="login-type-item" :class="{'active': loginForm.type === 'email'}" @click="loginForm.type = 'email'">
              <Mail />
              <span>邮箱{{ loginForm.mode == 'register' ? '注册' : '登录' }}</span>
            </div>
          </div>
        </div>
        <div class="login-top">
<!--          <span class="login-top-emoji transition-all-circ">{{ emoji }}</span>-->
          <div class="login-top-logo transition-all-circ"><img src="/x-logo-reverse.png" alt="logo" /></div>
          <span class="login-top-text">{{ typerObj.output }}</span>
          <span class="typed-cursor login-top-text">|</span>
        </div>
        <form class="login-bottom" @submit.prevent>
          <div class="login-form">
            <CusInput v-if="loginForm.type === 'phone'" class="login-form-item" placeholder="请输入手机号" v-model="loginForm.phone"
                      :validations="[{name: 'pattern', value: /^1\d{10}$/, msg: '请输入正确的手机号'}]"
                      :input-attrs="{type: 'tel', autocomplete: 'username'}" />
            <CusInput v-if="loginForm.type === 'email'" class="login-form-item" placeholder="请输入邮箱" v-model="loginForm.email"
                      :validations="[{name: 'pattern', value: /^.+@.+\..+$/, msg: '请输入正确的邮箱'}]"
                      :input-attrs="{type: 'email', autocomplete: 'username'}" />
            <!-- TODO: 细化密码提示 -->
            <CusInput v-if="loginForm.type === 'phone'" class="login-form-item" placeholder="请输入密码" v-model="loginForm.password"
                      :validations="[{name: 'pattern', value: /^.{6,30}$/, msg: '请输入正确的密码'}]"
                      :input-attrs="{type: 'password', autocomplete: 'current-password'}" />
            <CusInput v-if="loginForm.type === 'phone' && loginForm.mode == 'register'" class="login-form-item" placeholder="请再次输入密码" v-model="loginForm.retypePwd"
                      :validation="() => loginForm.retypePwd == loginForm.password ? '' : '两次输入密码不一致'"
                      :input-attrs="{type: 'password', autocomplete: 'new-password'}" />
            <CusInput v-if="loginForm.type === 'email'" class="login-form-item" placeholder="请输入验证码" v-model="loginForm.pin"
                      :validations="[{name: 'pattern', value: /^\d{6}$/, msg: '请输入正确的验证码'}]"
                      :input-attrs="{type: 'text', autocomplete: 'off'}">
              <template #append>
                <div class="login-form-get-sms" @click="handleGetSmsCode"><Spinning style="margin-right: .5rem;" :show="smsLoading" color="#9e9e9e" />{{ smsTip }}</div>
              </template>
            </CusInput>
          </div>
          <div class="login-form-submit" v-shake="loginForm.shake" @click="handleLoginSubmit">
            <button style="outline: none; color: inherit;" :disabled="submitLoading" @submit.prevent="handleLoginSubmit">
              <Right v-show="!submitLoading" size="32" />
              <spinning :show="submitLoading" size="2rem" thickness="4px" />
            </button>
          </div>
        </form>
        <div class="login-footer">
          <CusToggle label="记住账号" v-model="loginForm.remember" />
          <div v-if="loginForm.mode == 'login'">还未注册？<a href="javascript:void(0)" @click="handleChangeMode">点此立即注册</a><br /></div>
          <div v-if="loginForm.mode == 'register'">已有帐号？<a href="javascript:void(0)" @click="handleChangeMode">立即登录</a><br /></div>
          我已阅读并同意<a :href="router.resolve('/post/1').fullPath" target="_blank">《X产品论坛用户协议》</a>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<style scoped lang="scss">
@import "@/assets/main";
.login {
  margin: .25rem 1rem 1rem 1rem;
  position: relative;

  &-close {
    @extend %click-able;
    position: absolute;
    top: 0;
    right: 0;
    margin-top: .5rem;
    padding: .5rem;
    cursor: pointer;
    border-radius: .5rem;
  }

  &-type {
    font-size: 1rem;
    color: #5c5c5c;
    margin-left: .5rem;
    vertical-align: center;
    display: flex;
    align-items: center;
    &-item {
      display: flex;
      align-items: center;
      gap: .5rem;
      transition: all .2s $ease-out-circ;
      padding: .35rem .5rem;
      border-radius: .5rem;
      &:not(.active) {
        @extend %click-able;
      }
      &.active {
        color: $color-primary;
      }
    }
  }
  &-mode {
    @extend %click-able;
    margin-left: 2rem;
    padding: .35rem .5rem;
    border-radius: .5rem;
    font-size: 1rem;
    color: $color-primary;
    vertical-align: center;
  }

  &-top {
    width: 100%;
    font-size: 100px;
    line-height: 1;
    text-align: center;
    margin: 1rem 0;
    &-emoji {
      &:focus {
        transform: scale(0.9);
      }
    }
    &-logo {
      margin: 0 auto;
      width: 5rem;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: invert(43%) sepia(13%) saturate(2294%) hue-rotate(193deg) brightness(84%) contrast(88%); // 用于将图片变成紫色
        animation: spinning 3s infinite linear;
      }
      @keyframes spinning {
        0% {
          transform: rotate3d(0,0,0, 0deg);
        }
        100% {
          transform: rotate3d(1,2,1, 360deg);
        }
      }
    }
    &-text {
      font-size: 56px;
      font-weight: bold;
      color: $color-primary;
      background-image: $linear-gradient-primary;
      -webkit-text-fill-color: rgba(0,0,0,0);
      -webkit-background-clip: text;
      background-clip: text;
    }
  }

  &-title {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 4px;

    &:before {
      display: inline-block;
      content: '';
      height: 1rem;
      width: 4px;
      background-color: $color-primary;
    }
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    gap: .5rem;
  }

  &-footer {
    margin-top: .5rem;
    color: $color-grey-500;
    text-align: center;
  }

  &-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    &-item {
      width: 100%;
      font-size: 1.1rem;
    }
    &-input {
      width: 100%;
      font-size: large;
      border-radius: .5rem;
      padding: .25rem .5rem;
      border: 2px solid #FFFFFF00;
      background-color: $color-grey-100;
      outline: none;
      transition: all .2s $ease-out-circ;
      &:focus {
        border: 2px solid $color-primary;
      }
    }
    &-get-sms {
      @extend %click-able;
      font-size: 14px;
      color: $color-grey-500;
      padding: 0 .5rem;
      margin: 2px; // 避开边框
      border-radius: .5rem;
      position: absolute; right: 0; top: 0; bottom: 0; display: flex; place-items: center;
    }
    &-submit {
      position: relative;
      font-size: 20px;
      background-image: $linear-gradient-primary-2;
      color: white;
      text-align: center;
      border-radius: .5rem;
      display: flex;
      padding: .75rem;
      box-sizing: border-box;
      cursor: pointer;
      transition: all .2s $ease-out-circ;
      &:hover {
        opacity: 0.85;
      }
      &:active {
        background-image: $linear-gradient-primary-3;
      }
    }
  }
}
.sidebar-logo {
  flex: 1;
  font-size: 28px;
  &-animation {
    // background-image: linear-gradient(-135deg, #41e0a3, #56d8c0, #dc8bc3, #56d8c0, #41e0a3, #56d8c0, #dc8bc3, #56d8c0, #41e0a3);
    background-image: linear-gradient(-135deg, #418ae0, #56a0d8, #5c6bc0, #56a0d8, #418ae0, #56a0d8, #5c6bc0, #56a0d8, #418ae0);
    -webkit-text-fill-color: rgba(0,0,0,0);
    background-clip: text;
    background-size: 200% 200%;
    animation: text-masked-animation 3s infinite linear;
  }
  @keyframes text-masked-animation {
    0% {
      background-position: 0 -100%;
    }
    100% {
      background-position: -100% 0;
    }
  }
}
</style>