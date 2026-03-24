<template>
  <div class="page-about-monitor-container">
    <BbTabbar v-model="activeName" followFullScreen navPosition="bottom">
      <PageMin title="待办" name="ToDo" icon="friends-o"></PageMin>
      <PageMin title="我的" name="Mine" icon="user-o"></PageMin>
      <PageMin title="设置" name="Setting" icon="setting-o"></PageMin>
    </BbTabbar>
  </div>
</template>

<script setup name="Home">
import PageMin from "pages/Mine/Index.vue"
import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  shallowReactive,
  computed,
  defineAsyncComponent,
  watch,
  nextTick,
} from 'vue';
import {
  useUserInfo
} from "stores"
const { user } = useUserInfo();

const route = useRoute();
const router = useRouter();

const urlTabName = computed(() => route.query.tabbarName);
const activeName = computed({
  get() {
    const urlName = urlTabName.value;
    return urlName || 'ToDo';
  },
  set(val) {
    router.replace({ query: { tabbarName: val } })
  }
});


</script>

<style lang="less" scoped>
.page-about-monitor-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .main-container {
    flex-grow: 1;
    height: 0px;
  }
  :deep(.van-tabs) {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .van-tabs__content {
      flex-grow: 1;
      height: 0px;

      .van-tab__panel {
        height: 100%;
        box-sizing: border-box;
        border-top: 1px solid #fafafa;
      }
    }
  }
}
</style>
