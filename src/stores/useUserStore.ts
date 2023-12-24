import { acceptHMRUpdate, defineStore } from 'pinia';

const useUserStore = defineStore('user', () => {

});

export default useUserStore;

// 热更新
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}