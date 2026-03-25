<template>
  <div class="page-about-monitor-container">
    <BbTabs v-model="activeName">
      <component
        v-for="item in tabsList"
        :key="item.name"
        :is="item.component"
        :name="item.name"
        :title="item.title"
      >
      </component>
    </BbTabs>
  </div>
</template>

<script setup name="Home">
import PageMin from "pages/Mine/Index.vue";
import { useRoute, useRouter } from "vue-router";

import {
  shallowReactive,
  computed,
  ref,
  defineAsyncComponent,
  watch,
  nextTick,
} from "vue";
import { useUserInfo } from "stores";
const { user } = useUserInfo();

const route = useRoute();
const router = useRouter();
const show = ref(false);
setTimeout(() => {
  show.value = true;
}, 3000);
const tabsList = computed(() => {
  return [
    {
      name: "ToDo",
      title: "待办",
      icon: "friends-o",
      component: defineAsyncComponent(() => import("pages/Mine/Index.vue")),
    },
    {
      name: "Mine",
      title: "我的",
      icon: "friends-o",
      component: defineAsyncComponent(() => import("pages/Mine/Index.vue")),
    },
  ];
});
const urlTabName = computed(() => route.query.tabbarName);
const activeName = computed({
  get() {
    const urlName = urlTabName.value;
    return urlName || "ToDo";
  },
  set(val) {
    router.replace({ query: { tabbarName: val } });
  },
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
