<script lang = "ts" setup>
import useUserStore from '@/stores/useUserStore';
import { DEFAULT_USER_AVATAR } from '@/constants/defaultImage';
import CusButton from '@/components/button/CusButton.vue';
import PostItemCard from '@/pages/post/components/PostItemCard.vue';
import { onMounted, reactive, ref, watch } from 'vue';
import CusInput from '@/components/input/CusInput.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useRouter } from 'vue-router';
import useGlobal from '@/commands/useGlobal';
import type { PostItemCardProps } from '@/pages/post/components/PostItemCard';
import { delay } from '@/utils/delay';
import adminApi from '@/apis/services/video-platform-admin';
import showToast from '@/components/toast/toast';
import { useIntersectionObserver } from '@vueuse/core';
import { getUserInfo } from '@/stores/publicUserInfo';
import { convertUserFile } from '@/pages/post/utils/image';

const router = useRouter();
// todo 进入时加载
onMounted(() => {
  if (router.currentRoute.value.path == '/me/edit') {
    editing.value = true;
  } else {
    observeLoadMore.resume();
  }
});

const userStore = useUserStore(); // 通过useUserStore获取用户信息
let editing = ref(false); // 是否正在编辑资料

watch(() => editing.value, (newValue) => {
  if (newValue) {
    if (router.currentRoute.value.path != '/me/edit') {
      router.push('/me/edit');
    }
    edit();
  } else {
    if (router.currentRoute.value.path == '/me/edit') {
      router.push('/me');
    }
  }
});
let signature = ref(''); // 个性签名
let signatureLen = ref(signature.value.length); // 个性签名长度
const maleColor = ref('#F5F5F5FF'); // 性别颜色
const femaleColor = ref('#F5F5F5FF'); // 性别颜色
const address = ref([
  {
    value: '1',
    label: '北京',
    children: [
      {
        value: '11',
        label: '北京市',
        children: [
          { value: '111', label: '东城区' },
          { value: '112', label: '西城区' },
          { value: '113', label: '朝阳区' },
          { value: '114', label: '丰台区' },
          { value: '115', label: '石景山区' },
          { value: '116', label: '海淀区' },
          { value: '117', label: '门头沟区' },
          { value: '118', label: '房山区' },
          { value: '119', label: '通州区' },
          { value: '120', label: '顺义区' },
          { value: '121', label: '昌平区' },
          { value: '122', label: '大兴区' },
          { value: '123', label: '怀柔区' },
          { value: '124', label: '平谷区' },
          { value: '125', label: '密云区' },
          { value: '126', label: '延庆区' },
        ],
      },
    ],
  },
  {
    value: '2',
    label: '浙江省',
    children: [
      {
        value: '21', label: '杭州市',
        children: [
          { value: '211', label: '西湖区' },
          { value: '212', label: '余杭区' },
          { value: '213', label: '拱墅区' },
          { value: '214', label: '富阳区' },
          { value: '215', label: '临安区' },
          { value: '216', label: '桐庐县' },
          { value: '217', label: '淳安县' },
          { value: '218', label: '建德市' },
        ],
      },
      {
        value: '22', label: '湖州市',
        children: [
          { value: '221', label: '吴兴区' },
          { value: '222', label: '安吉区' },
          { value: '223', label: '南浔区' },
          { value: '224', label: '德清县' },
          { value: '225', label: '长兴县' },
        ],
      },
    ],
  },
  {
    value: '3',
    label: '广东省',
    children: [
      {
        value: '31',
        label: '广州市',
        children: [
          { value: '311', label: '越秀区' },
          { value: '312', label: '天河区' },
        ],
      },
      {
        value: '32',
        label: '深圳市',
        children: [
          { value: '321', label: '罗湖区' },
          { value: '322', label: '福田区' },
          { value: '323', label: '南山区' },
          { value: '324', label: '宝安区' },
          { value: '325', label: '龙岗区' },
          { value: '326', label: '盐田区' },
          { value: '327', label: '龙华区' },
          { value: '328', label: '坪山区' },
          { value: '329', label: '光明区' },
        ],
      },
      {
        value: '33',
        label: '珠海市',
        children: [
          { value: '331', label: '香洲区' },
          { value: '332', label: '斗门区' },
          { value: '333', label: '金湾区' },
          { value: '334', label: '横琴新区' },
          { value: '335', label: '高栏港经济区' },
          { value: '336', label: '珠海保税区' },
        ],
      },
    ],
  },
  {
    value: '4',
    label: '福建省',
    children: [
      {
        value: '41', label: '福州市',
        children: [
          { value: '411', label: '鼓楼区' },
          { value: '412', label: '台江区' },
          { value: '413', label: '仓山区' },
          { value: '414', label: '马尾区' },
          { value: '415', label: '晋安区' },
          { value: '416', label: '长乐区' },
          { value: '417', label: '福清市' },
          { value: '418', label: '闽侯县' },
          { value: '419', label: '连江县' },
          { value: '420', label: '罗源县' },
        ],
      },
      {
        value: '42', label: '厦门市',
        children: [
          { value: '421', label: '思明区' },
          { value: '422', label: '海沧区' },
          { value: '423', label: '湖里区' },
        ],
      },
      {
        value: '43',
        label: '莆田市',
        children: [
          { value: '431', label: '城厢区' },
          { value: '432', label: '涵江区' },
          { value: '433', label: '荔城区' },
          { value: '434', label: '秀屿区' },
          { value: '435', label: '仙游县' },
        ],
      },
    ],
  },
]);
const selectedAddress = ref(['3', '32', '323']);

const newPwd = ref('');
const confirmPwd = ref('');
const newPwdTip = ref('请输入6-30位密码，至少包含数字、英文字母和符号。');
const confirmTip = ref('请输入6-30位密码，至少包含数字、英文字母和符号。');
const confirmed = ref(true); // 是否确认密码

const infoString = ref(localStorage.getItem('info'));
let gender = ref(''); // 性别
// let nickname = ref(userStore.userInfo?.name); // 昵称
let nickname = ref(''); // 昵称
// const avatar = ref(''); // 头像
const birthday = ref('');
// 校验新密码
watch(() => newPwd.value, (newValue) => {
  if (newValue.length === 0) {
    newPwdTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
    let element = document.getElementById('newPwdTip');
    if (element) {
      element.style.color = '#9E9E9EFF';
    }
  } else if (newValue.length < 6 || newValue.length > 30) {
    confirmed.value = false;
    newPwdTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
    let element = document.getElementById('newPwdTip');
    if (element) {
      element.style.color = 'red';
    }
  } else {
    newPwdTip.value = '✅ 密码格式正确。';
    let element = document.getElementById('newPwdTip');
    if (element) {
      element.style.color = '#9E9E9EFF';
    }
  }
  
  // 匹配一致后修改newPwd
  if (newValue !== confirmPwd.value) {
    if (confirmPwd.value.length === 0) {
      confirmTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
    } else {
      confirmTip.value = '❌ 两次密码不一致，请重新输入。';
      let element = document.getElementById('confirmTip');
      if (element) {
        element.style.color = 'red';
      }
    }
    confirmed.value = false;
  } else {
    if (newValue.length === 0 && confirmPwd.value.length === 0) {
      confirmed.value = true;
      confirmTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
    } else {
      confirmTip.value = '✅ 密码一致。';
      confirmed.value = false;
    }
    confirmed.value = true;
    let element = document.getElementById('confirmTip');
    if (element) {
      element.style.color = '#9E9E9EFF';
    }
  }
});

// 实时匹配密码
watch(() => confirmPwd.value, (newValue) => {
  if (newValue.length === 0) {
    confirmed.value = newPwd.value.length === 0;
    confirmTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
    let element = document.getElementById('confirmTip');
    if (element) {
      element.style.color = '#9E9E9EFF';
    }
  } else if (newValue !== newPwd.value) {
    confirmTip.value = '❌ 两次密码不一致，请重新输入。';
    confirmed.value = false;
    let element = document.getElementById('confirmTip');
    if (element) {
      element.style.color = 'red';
    }
  } else {
    if (newValue.length < 6 || newValue.length > 30) {
      confirmed.value = false;
      confirmTip.value = '请输入6-30位密码，至少包含数字、英文字母和符号。';
      let element = document.getElementById('confirmTip');
      if (element) {
        element.style.color = 'red';
      }
    } else {
      confirmTip.value = '✅ 密码一致。';
      confirmed.value = true;
      let element = document.getElementById('confirmTip');
      if (element) {
        element.style.color = '#9E9E9EFF';
      }
    }
  }
});

// 限制个性签名长度不超过200
watch(signature, (newValue, oldValue) => {
  signatureLen.value = newValue.length;
  if (newValue.length > 200) {
    signature.value = oldValue;
  }
});

// 选择男
function choseMale() {
  maleColor.value = '#adb7ff';
  femaleColor.value = '#F5F5F5FF';
  gender.value = 'male';
}

// 选择女
function choseFemale() {
  maleColor.value = '#F5F5F5FF';
  femaleColor.value = '#efcaff';
  gender.value = 'female';
}

// 打开修改区域，加载本地数据
function edit() {
  editing.value = true;
  if (infoString.value) {
    let infoArray = JSON.parse(infoString.value);
    // avatar.value = infoArray.find('avatar')?.avatar;
    nickname.value = infoArray.find(item => 'nickname' in item)?.nickname;
    gender.value = infoArray.find(item => 'gender' in item)?.gender;
    if (gender.value == 'male') {
      maleColor.value = '#adb7ff';
      femaleColor.value = '#F5F5F5FF';
    } else {
      maleColor.value = '#F5F5F5FF';
      femaleColor.value = '#efcaff';
    }
    birthday.value = infoArray.find(item => 'birthday' in item)?.birthday;
    selectedAddress.value = infoArray.find(item => 'selectedAddress' in item)?.selectedAddress;
    signature.value = infoArray.find(item => 'signature' in item)?.signature;
  }
}

const show = ref(0);

// todo 显示我的帖子
// todo 进入时即加载

const origin_posts = ref<PostItemCardProps[]>([]); // 所有的帖子
const posts = ref<PostItemCardProps[]>([]); // 要显示的帖子
const tempPosts = ref<API.UpdateVo[]>(); // 中间值
const hasNoMore = ref(false); // 是否还有更多帖子
const currentPage = ref(0); // 当前页数
const searchForm = reactive({
  uid: ref(-1),
  keyword: ref(''),
});
function showMyPosts() {
  changeBorderBottomColor('me-main-myPost', '#5C6BC0FF');
  changeBorderBottomColor('me-main-involved', 'transparent');
  show.value = 0;
  console.log(origin_posts.value);
}

// todo 显示我参与的

function showInvolved() {
  changeBorderBottomColor('me-main-involved', '#5C6BC0FF');
  changeBorderBottomColor('me-main-myPost', 'transparent');
  show.value = 1;

}

function changeBorderBottomColor(elementId: string, color: string) {
  let element = document.getElementById(elementId);
  if (element) {
    element.style.borderBottom = `2px solid ${color}`;
  }
}

// todo 删除帖子
function handlePostDeleted(id: number) {
  posts.value.forEach((item, index) => {
    if (item.postId == id) {
      posts.value.splice(index, 1);
    }
  });
}

// todo 加载更多
async function handleLoadMore() {
  currentPage.value++;
  await getPosts();
  await delay(100);
  observeLoadMore.pause();
  observeLoadMore.resume();
}

// 获取帖子
async function getPosts() {
  try {
    const res = await adminApi.updatesController.getInPageUsingPost({
      pageNum: currentPage.value,
      pageSize: 10,
    }, {
      uid: userStore.userInfo?.id,
      str: searchForm.keyword ? searchForm.keyword : undefined,
    });
    if (res.data.data?.length == 0) {
      showToast({ type: 'info', text: '没有更多啦' });
      hasNoMore.value = true;
    }
    tempPosts.value = res.data.data;
    return res.data.data;
  } catch (e) {
    return [];
  }
}

/* 无限加载控制 */
const loadMoreRef = ref<HTMLDivElement>();
const observeLoadMore = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    console.log(currentPage.value);
    handleLoadMore();
  }
}, {
  threshold: 0,
  immediate: false,
});

// 监听tempPost的变化
watch(() => tempPosts.value, async () => {
  if (!tempPosts.value?.length) return;
  for (let item of tempPosts.value) {
    if (item.vid) continue; // 此处不处理视频
    const userInfo = await getUserInfo(item.uid ?? -1);
    origin_posts.value.push({
      type: 'post',
      postId: item.id ?? -1,
      userId: item.uid ?? -1,
      userName: userInfo.name ?? '测试用户',
      avatar: convertUserFile(userInfo.avatar) ?? `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=id${item.uid}`,
      forwardCount: 0,
      commentCount: 0,
      likeCount: 0,
      isLiked: item.isLiked ?? false,
      createTime: item.uploadTime ? new Date(item.uploadTime).toLocaleString() : new Date().toLocaleString(),
      images: JSON.parse(item.urls ?? '[]'),
      content: item.content ? decodeURIComponent(item.content) : '',
    });
  }
  tempPosts.value = []; // 处理完成后清空
});

// 修改头像
function changeAvatar() {
  let element = document.getElementById('change-avatar');
  if (element) {
    element.click();
    document.getElementById('change-avatar')?.addEventListener('change', async (e) => {
      let file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('upload avatar');
        console.log(file);
        let res = await userStore.uploadAvatar(file);
        if (res) console.log('upload avatar success');
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          let result = (e.target as FileReader).result;
          if (result) {
            // 保存到localstorage
            localStorage.setItem('avatar', result.toString());
            userStore.avatar = result.toString();
          }
        };
      }
    });
  }
}

// 保存修改
async function save() {
  console.log(confirmed.value);
  if (confirmed.value === false) {
    return;
  }
  let infoArray = [
    {
      nickname: nickname.value,
      gender: gender.value,
      birthday: birthday.value,
      selectedAddress: selectedAddress.value,
      signature: signature.value,
    }];
  let res = await userStore.saveName(nickname.value);
  if (res) console.log('save name');
  if (confirmed.value === true && newPwd.value.length !== 0) {
    console.log('save new password');
    let res = await userStore.savePassword(newPwd.value);
    if (res) console.log('save new password success');
  }
  let infoString = JSON.stringify(infoArray);
  localStorage.setItem('info', infoString);
  window.location.reload();
}

// 重置修改
function reset() {
  window.location.reload();
}


const globe = useGlobal(); // 小屏适配
</script>

<template>
  <div class = "me">
    <div class = "me-container">
      <aside v-if = "globe.isLargeScreen" class = "me-left">
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
        <section class = "me-left-edit" @click = "() => editing ? editing = false : edit()">
          {{ editing ? '返回' : '编辑资料' }}
        </section>
      </aside>
      <main v-if = "!editing" id = "me-posts" class = "me-main">
        <section class = "me-main-actions">
          <div class = "me-main-actions-title">
            <CusButton id = "me-main-myPost" text = "我的帖子" type = "text" @click = "showMyPosts"></CusButton>
            <CusButton id = "me-main-involved" text = "我参与的" type = "text" @click = "showInvolved"></CusButton>
          </div>
        </section>
        <section class = "me-main-posts">
          <PostItemCard v-for = "item in posts" :key = "item.postId" :avatar = "item.avatar"
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
      <main v-if = "editing" id = "me-edit" class = "me-main">
        <section class = "me-main-edit">
          <form class = "me-main-edit-form">
            <div class = "me-main-edit-form-avatar">
              <img :src = "userStore.avatar ?? DEFAULT_USER_AVATAR" alt = "me-user-avatar" />
              <input id = "change-avatar" accept = ".jpeg, .jpg, .png" style = "display: none" type = "file">
              <div class = "me-main-edit-form-avatar-icon" @click = "changeAvatar">
                <svg class = "h-4 w-4 text-green-s dark:text-dark-green-s" fill = "white" height = "1em"
                     viewBox = "0 0 24 24" width = "1em" xmlns = "http://www.w3.org/2000/svg">
                  <path clip-rule = "evenodd"
                        d = "M11 20a1 1 0 011-1h8a1 1 0 110 2h-8a1 1 0 01-1-1zM17.018 5c-.26 0-.51.104-.695.288L4.837 16.773l-.463 1.853 1.853-.463L17.712 6.677A.981.981 0 0017.018 5zm-2.11-1.126a2.983 2.983 0 014.219 4.217L7.444 19.773a1 1 0 01-.464.263l-3.738.934a1 1 0 01-1.213-1.212l.934-3.739a1 1 0 01.263-.464L14.91 3.874z"
                        fill-rule = "evenodd"></path>
                </svg>
              </div>
            </div>
            <div class = "me-main-edit-form-bar">
              <div class = "nickname">
                <span>昵称</span>
                <CusInput id = "nickname" v-model = "nickname" :placeholder = "nickname" type = "text"></CusInput>
              </div>
              <div class = "gender">
                <span>性别</span>
                <div class = "gender-item">
                  <div class = "male">
                    <CusButton id = "gender" :background-color = "maleColor" name = "male" type = "normal"
                               @click = "choseMale">
                      <svg class = "text-blue-s dark:text-dark-blue-s mr-[6px]" fill = "blue" height = "1em"
                           viewBox = "0 0 24 24" width = "1em" xmlns = "http://www.w3.org/2000/svg">
                        <path clip-rule = "evenodd"
                              d = "M17.022 5.564h-2.586a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V6.978L16.17 9.243a7.001 7.001 0 01-10.557 9.143 7 7 0 019.143-10.557l2.265-2.265zM14.1 9.9a5 5 0 10-7.071 7.072 5 5 0 007.07-7.072z"
                              fill-rule = "evenodd"></path>
                      </svg>
                      男
                    </CusButton>
                  </div>
                  <div class = "female">
                    <CusButton id = "gender" :background-color = "femaleColor" name = "female" type = "normal"
                               @click = "choseFemale">
                      <svg class = "text-label-2 dark:text-dark-label-2 mr-[6px]" fill = "red" height = "1em"
                           viewBox = "0 0 24 24" width = "1em" xmlns = "http://www.w3.org/2000/svg">
                        <path clip-rule = "evenodd"
                              d = "M13 15.93V17h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H9a1 1 0 110-2h2v-1.07A7.001 7.001 0 0112 2a7 7 0 011 13.93zM12 14a5 5 0 100-10 5 5 0 000 10z"
                              fill-rule = "evenodd"></path>
                      </svg>
                      女
                    </CusButton>
                  </div>
                </div>
              </div>
            </div>
            <div class = "me-main-edit-form-bar">
              <div class = "birthday">
                <span>生日</span>
                <VueDatePicker v-model = "birthday"
                               :max-date = "new Date()"
                               :placeholder = "birthday"
                               format = "yyyy-MM-dd"
                               model-type = "format"
                />
              </div>
              <div class = "address">
                <span>现居地</span>
                <div class = "options">
                  <Cascader v-model:selected-value = "selectedAddress" :options = "address"></Cascader>
                </div>
              </div>
            </div>
            <div class = "me-main-edit-form-bar">
              <div class = "signature">
                <span>个性签名</span>
                <textarea id = "signature" v-model = "signature"
                          class = "textarea" placeholder = "这个人很懒，什么都没留下..."></textarea>
                <span>{{ signatureLen }}/200</span>
              </div>
            </div>
            <div class = "me-main-edit-form-bar">
              <div class = "password">
                <span class = "title">修改密码</span>
                <span>新密码</span>
                <CusInput id = "newPwd" v-model = "newPwd" :input-attrs = "{type: 'password'}"
                          placeholder = "请输入新密码"></CusInput>
                <span id = "newPwdTip" class = "tips">{{ newPwdTip }}</span>
                <span>确认密码</span>
                <CusInput id = "password" v-model = "confirmPwd" :input-attrs = "{type: 'password'}"
                          placeholder = "请再次输入密码"></CusInput>
                <span id = "confirmTip" class = "tips">{{ confirmTip }}</span>
              </div>
            </div>
            <div class = "me-main-edit-form-bar">
              <CusButton text = "保存" type = "success" @click = "save" @click.stop = "!confirmed"></CusButton>
              <CusButton text = "取消" type = "danger" @click = "reset"></CusButton>
            </div>
          </form>
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
        border-top: 2px solid transparent;
        
        #me-main-myPost {
          border-bottom: 2px solid $color-primary;
        }
        
        #me-main-involved {
          border-bottom: 2px solid transparent;
        }
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
    
    &-edit {
      @extend %card;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      &-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        
        &-avatar {
          position: relative;
          height: auto;
          border-radius: .75rem;
          //overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
          
          &-icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 1.6rem;
            height: 1.6rem;
            background-color: $color-primary;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          img {
            width: 5rem;
            height: 5rem;
            border-radius: 50%;
            object-position: center;
            object-fit: cover;
          }
        }
        
        &-bar {
          display: flex;
          flex-direction: row;
          //position: relative;
          gap: .5rem;
          
          .gender {
            display: flex;
            flex-direction: column;
            
            &-item {
              display: flex;
              flex-direction: row;
              gap: .5rem;
              
              & > div {
                flex: 1;
                display: flex;
                flex-direction: row;
                gap: .5rem;
                
                &:not(:last-child) {
                  margin-right: .5rem;
                }
                
                & > input {
                  flex: 1;
                  display: flex;
                  flex-direction: row;
                  gap: .5rem;
                  border: 1px solid #E0E0E0FF;
                  border-radius: .5rem;
                  padding: .5rem;
                  background-color: #F5F5F5FF;
                }
              }
              
            }
          }
          
          .signature {
            display: flex;
            flex-direction: column;
            
            textarea {
              flex: 1;
              position: relative;
              background-color: #F5F5F5FF;
              padding: .5rem;
              resize: none;
              border-radius: .5rem;
              border: 2px solid transparent;
            }
            
            // todo 点击时边框大小会改变
            textarea:focus {
              border: 2px solid $color-primary
            }
            
          }
          
          .birthday {
          }
          
          .address {
            display: flex;
            flex-direction: column;
            
            div {
              display: flex;
              flex-direction: row;
              gap: .5rem;
              
              &:not(:last-child) {
                margin-bottom: .5rem;
              }
              
              & > div {
                flex: 1;
                display: flex;
                flex-direction: row;
                gap: .5rem;
                
                &:not(:last-child) {
                  margin-right: .5rem;
                }
              }
            }
          }
          
          .password {
            display: flex;
            flex-direction: column;
            
            .title {
              font-size: 1.1rem;
              font-weight: bold;
              display: flex;
            }
            
            .tips {
              font-size: .8rem;
              color: #9E9E9EFF;
            }
          }
          
        }
        
        div {
          display: flex;
          flex-direction: row;
          gap: .5rem;
          
          &:not(:last-child) {
            margin-bottom: .5rem;
          }
          
          
          & > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            
            &:not(:last-child) {
              margin-right: .5rem;
            }
          }
        }
      }
    }
  }
}
</style>