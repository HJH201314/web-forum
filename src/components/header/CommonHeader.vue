
<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import type { CSSProperties } from "vue";
import { Search } from "@icon-park/vue-next";
import { useRouter } from "vue-router";
import showToast from "@/components/toast/toast";
import useUserStore from "@/stores/useUserStore";
import LoginModal from "@/components/login-modal/LoginModal.vue";
import type { CommonModalFunc } from "@/components/modal/CommonModal";
import CusPopover from "@/components/popover/CusPopover.vue";
import axios from "axios";
import CusButton from "@/components/button/CusButton.vue";
import { DialogManager } from "@/components/dialog";
import services from "@/apis/services";
import ToastManager from "@/components/toast/ToastManager";
import { DEFAULT_USER_AVATAR } from '@/constants/defaultImage';

const props = defineProps<{
  searchBarStyle?: CSSProperties,
  headerStyle?: CSSProperties,
}>();

const userStore = useUserStore();

/* 定义入口项属性 */
type Entry = {
  key: string;
  name: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
};
/* 左侧列表 */
const leftEntries = ref<Entry[]>([
  {
    key: "home",
    name: "首页",
    icon: 'home',
    href: "/post",
  },
]);
/* 右侧列表 */
const rightEntries = ref<Entry[]>([
  {
    key: "message",
    name: "消息",
    icon: 'message',
    href: "/message",
  },
]);

const router = useRouter();
function handleEntryClick(e: Event, entry: Entry) {
  if (entry.onClick) {
    entry.onClick();
  } else if (entry.href) {
    if (entry.href == router.currentRoute.value.path) return;
    router.push(entry.href);
  }
  showToast({ text: entry.name, position: 'top' });
}

const refLoginModal = ref<CommonModalFunc>();
function handleLoginClick() {
  // 展示登录模态框
  refLoginModal.value?.open();
}
async function handleLogoutClick() {
  const res = await userStore.logout();
  if (res) {
    showToast({ text: '登出成功', position: 'top' });
  } else {
    showToast({ text: '登出请求失败，已强制登出', position: 'top' });
  }
}

async function handleChangePassword() {
  const dialogRes = await DialogManager.inputDialog({
    title: '修改密码',
    content: '请输入新密码',
  }, {
    inputAttrs: {
      type: 'password',
    },
  });
  if (dialogRes.status) {
    try {
      const res = await services.manageService.userController.updateUserUsingPut({
        id: userStore.userInfo.id,
        password: dialogRes.value,
      });
      if (res.data.code == 200) {
        ToastManager.success('修改成功！');
      } else {
        ToastManager.danger(`修改失败！`);
      }
    } catch (e) {
        ToastManager.danger(`修改失败！`);
    }
  }
}

function handleMeClick() {
  showToast({text: userStore.userInfo, position: 'top', duration: 'long'});
  if (userStore.isLogin) {
    router.push('/space/me');
  }
}

/* searchStatus - 搜索状态 : none-没有在搜索  searching-搜索框展开  mouseout-鼠标移出搜索面板但未关闭 */
const searchStatus = ref<'none' | 'searching' | 'mouseout'>('none');
const searchContainer = ref<HTMLDivElement>();
const searchInputRef = ref<HTMLInputElement>();

/**
 * 处理input失焦
 */
function handleSearchInputBlur() {
  if (searchStatus.value != 'mouseout') {
    // 如果是因为鼠标点击搜索框中其它内容导致的失焦，就要将焦点放回input
    searchInputRef.value?.focus();
  } else {
    // 如果是鼠标已经移出搜索面板，则关闭搜索
    searchStatus.value = 'none';
  }
}
watch(() => searchStatus.value, (v) => {
  console.log(searchStatus);
  if (v == 'none') {
    // 如果失去搜索状态，强制取消input的聚焦
    searchInputRef.value?.blur();
  }
});

const form = reactive({
  searchVal: "",
});

watch(
    () => form.searchVal,
    (newVal) => {
      // /api/admin会走vite代理转发到localhost:8850，具体配置在vite.config.ts中
        axios.get("/api/admin/video/suggest",{
        params: {
          key: encodeURIComponent(newVal),
        },
      }).then(response =>{
        suggestList.value = [];
        suggestList.value = response.data;
      });
    },
    {
      deep: true,
    },
);
const suggestList = ref([""]);
const historyList = ref([""]);
const hisIsShow = computed(() => {
  if(form.searchVal == ""){
    fetchSearchHis();
    return true;
  }else{
    return false;
  }
});
const fetchSearchHis = () =>{
  historyList.value = localStorage.getItem("searchHistory")?.split(",").slice(0, 20) as string[];
};

const addSearchHis = (newSearch: string) => {
  let HistoryStr = localStorage.getItem("searchHistory");
  if(HistoryStr == "" || HistoryStr == null){
    localStorage.setItem("searchHistory", newSearch);
  }else{
    HistoryStr = newSearch + ',' + HistoryStr;
    localStorage.setItem("searchHistory", HistoryStr);
  }
};

const searchFromHistory = (SearchHisStr: string) => {
  form.searchVal = SearchHisStr;
  //触发搜索
  handleSearch();
};

function handleSearch(keyword?: string) {
  if (keyword && keyword.replace) {
    keyword = keyword?.replace(/<em>/g, '');
    keyword = keyword?.replace(/<\/em>/g, '');
    form.searchVal = keyword;
  }
  addSearchHis(form.searchVal);
  // router.push(`/search?type=video&keyword=${form.searchVal}`)
  window.open(router.resolve(`/search?type=video&keyword=${form.searchVal}`).href, '_blank');
}
</script>

<template>
  <div class="common-header">
    <div class="header-placeholder" style="height: 3.5rem;"></div>
    <header ref="headerRef" :style="headerStyle">
      <ul class="left-entry">
        <li style="display: flex;"><img src="/x-logo-reverse.png" alt="logo" style="height: 1.5rem; object-fit: cover;" /></li>
        <li v-for="entry in leftEntries" :key="entry.key" @click="(e) => handleEntryClick(e, entry)">
          <span>{{ entry.name }}</span>
          <div v-if="entry.href == router.currentRoute.value.path" class="active-underline" />
        </li>
      </ul>
      <div class="center-search-container" ref="searchContainer">
        <div class="center-search-bar" :class="{ 'center-search-bar-focus': searchStatus != 'none' }"
             @mouseleave="() => searchStatus = (searchStatus != 'none') ? 'mouseout' : 'none'"
             @mouseenter="() => searchStatus = (searchStatus == 'mouseout') ? 'searching' : searchStatus"
             :style="props.searchBarStyle"
        >
          <form :class="{ 'focus': searchStatus != 'none' }" @submit.prevent>
            <input ref="searchInputRef" v-model="form.searchVal" type="text" id="nav-search-input" placeholder="搜索"
                   @focus="searchStatus = 'searching'"
                   @blur="handleSearchInputBlur"
            />
            <Search class="search" size="1.25rem" @click="handleSearch" />
          </form>
          <Transition name="opacity-circ">
            <div v-show="searchStatus !== 'none'" class="center-search-panel">
              <div v-show="hisIsShow" class="hisBoard">
                <div class="header">
                  <div class="title">搜索历史</div>
                  <div class="clear">清空</div>
                </div>
                <div class="histories">
                  <div @click="searchFromHistory(history)" class="hisDiv" v-for="(history, index) in historyList" :key="index">{{ history }}</div>
                </div>
              </div>
              <div style="height: 1rem" v-show="!suggestList.length"><!-- 占位，让没有搜索结果时的搜索面板圆润起来 --></div>
            </div>
          </Transition>
        </div>
      </div>
      <ul class="right-entry">
        <li v-for="entry in rightEntries" :key="entry.key" @click="(e) => handleEntryClick(e, entry)">
          <CusPopover position="bottom">
            <template #body>
              <span>{{ entry.name }}</span>
              <div v-if="entry.href == router.currentRoute.value.path" class="active-underline" />
            </template>
            <template #popover>
              <div v-if="entry.key == 'history'">

              </div>
            </template>
          </CusPopover>
        </li>
      </ul>
      <CusPopover position="bottom" :enabled="userStore.isLogin">
        <template #body>
          <div class="nav-user-container" @click="handleMeClick">
            <CusButton v-if="!userStore.isLogin" type="primary" @click="handleLoginClick" text="登录 / 注册"></CusButton>
            <img class="nav-user-avatar" v-if="userStore.isLogin" :src="userStore.avatar ?? DEFAULT_USER_AVATAR"
                 alt="avatar" />
          </div>
        </template>
        <template #popover>
          <div class="nav-user-actions">
            <CusButton class="nav-user-action" :button-style="{'border-radius': '0'}" @click="handleLogoutClick" text="修改昵称"></CusButton>
            <CusButton class="nav-user-action" :button-style="{'border-radius': '0'}" @click="handleChangePassword" text="修改密码"></CusButton>
            <CusButton class="nav-user-action" :button-style="{'border-radius': '0'}" @click="handleLogoutClick" text="登出账号"></CusButton>
          </div>
        </template>
      </CusPopover>
      <LoginModal ref="refLoginModal" />
    </header>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/main";

.common-header {
  position: relative;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 1);
  //-webkit-backdrop-filter: blur(3px);
  //backdrop-filter: blur(3px);
  height: 3.5rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
  z-index: 1;

  ul {
    height: 100%;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
  }

  li {
    @extend %click-able;
    position: relative;
    height: 100%;
    cursor: pointer;
    padding: 1rem;
    box-sizing: border-box;

    span {
      a {
        text-decoration: none;
        color: $color-black;
      }
    }

    .active-underline {
      position: absolute;
      content: '';
      bottom: 0;
      left: 0;
      right: 0;
      background-color: $color-primary;
      height: 2px;
    }
  }

}

.left-entry {}

.center-search {
  flex: 1;

  &-container {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  &-bar {
    flex: 1;
    height: 2.5rem;
    min-width: 180px;
    max-width: 500px;
    position: relative;
    border-radius: .5rem;
    transition: background-color .2s $ease-out-circ;
    //&:focus-within {
    //  background: $color-active;
    //}

    form {
      height: 100%;
      padding: 0 .25rem;
      border-radius: .5rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      gap: .5rem;
      background: transparentize($color-black, 0.9);
      transition: background-color .2s $ease-out-circ;

      &.focus {
        background: white;
        border-radius: .5rem .5rem 0 0;
        border-left: solid 1px $color-grey-400;
        border-right: solid 1px $color-grey-400;
        border-top: solid 1px $color-grey-400;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
      }

      input {
        flex: 1;
        line-height: 2rem;
        border-radius: .25rem;
        width: 100%;
        outline: none;
        border: none;
        background: transparent;
        padding: 0 .5rem;
        &:not(:focus) {
          &::placeholder {
            color: transparentize(black, 0.25);
          }
        }

        &:focus {
          background: transparentize(black, 0.9);
        }

        &::placeholder {
          color: grey;
        }
      }

      .search {
        cursor: pointer;
        color: transparentize(black, 0.25);
        padding: .4rem;
        margin-right: .25rem;
        border-radius: .5rem;
        @extend %click-able;
      }
    }
  }

  &-panel {
    @extend %transition-all-circ;
    background: white;
    border-radius: 0 0 .5rem .5rem;
    border-left: solid 1px $color-grey-400;
    border-right: solid 1px $color-grey-400;
    border-bottom: solid 1px $color-grey-400;
    box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
}

.nav-user {
  &-container {
    height: 100%;
    padding: 1rem;
    cursor: pointer;
    box-sizing: border-box;
  }

  &-avatar {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    transition: transform .2s $ease-out-circ;

    &:hover {
      transform: rotate(-360deg);
    }
  }

  &-actions {
    display: flex;
    flex-direction: column;
    border-radius: .5rem;
    overflow: hidden;
    align-items: center;
    background-color: white;
  }

  &-action {
    white-space: nowrap;
    cursor: pointer;
  }
}

.right-entry {}

.searchSuggest {
  padding-left: 5px;
  height: 32px;
  padding-top: 5px;
  overflow: hidden;
}

.searchSuggest:hover {
  background-color: rgb(227, 229, 231);
}

.hisBoard {
  padding: 8px 5px 10px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      margin-left: 8px;
      height: 24px;
      line-height: 24px;
    }

    .clear {
      font-size: 12px;
      margin-right: 8px;
      color: rgb(148, 153, 160);
      height: 15px;
      line-height: 12px;
      cursor: pointer;
    }

    .clear:hover {
      color: rgb(71, 197, 241);
    }
  }

  .histories {
    // display: flex;
    .hisDiv {
      display: inline-block;
      box-sizing: border-box;
      background-color: rgb(246, 247, 248);
      margin-left: 8px;
      font-size: 12px;
      padding: 3px 5px;
      border-radius: 6px;
    }
    .hisDiv:hover {
      color: rgb(71, 197, 241);
      cursor: pointer;
    }
  }

}</style>