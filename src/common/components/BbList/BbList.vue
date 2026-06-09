<script setup name="BbList">
import {
  ref,
  onActivated,
  onDeactivated,
  nextTick,
  onMounted,
  onBeforeUnmount,
  toRefs
} from "vue";
const props = defineProps({
  useBackTop: {
    type: Boolean,
    default: true,
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  onRefresh: {
    type: Function,
  },
  onLoadMore: {
    type: Function,
  },
  errorText: {
    type: String,
    default: "加载失败，点击此处重新加载"
  },
  delay: {
    type: [Number, String],
    default: 200,
    validator(str) {
      if (isNaN(str)) {
        console.warn("延迟时间为>=0的数字");
        return false;
      }
      return str >= 0;
    }
  }
})
const {
  onRefresh,
  onLoadMore,
} = props;
const {
  autoLoad,
  errorText,
  delay,
} = toRefs(props)
const cmRefresh = ref(null);
const cmLoadMore = ref(null);
const refreshing = ref(false);
const loadingMore = ref(false);
const refreshError = ref(false);
const loadMoreError = ref(false);
const finished = ref(false);
const shouldnotLoad = ref(autoLoad.value ? false : true);
let observer = null;
let loadIndex = 0;
let scrollTop = 0;
let scrollTimer = null;
let initTimer = null;

const init = (destroyed = false) => {
  cmRefresh.value?.$el?.removeEventListener("scroll", onScroll);
  if (destroyed) {
    observer?.disconnect();
    observer = null;
    return;
  }
  cmRefresh.value?.$el?.addEventListener("scroll", onScroll);
  if (observer) return;
  if (onLoadMore) {
    observer = new ResizeObserver(() => {
      if (!refreshError.value) {
        nextTick(() => {
          if (!delay.value) {
            check(true);
          }
          clearTimeout(initTimer);
          initTimer = setTimeout(() => {
            check(true);
          }, Number(delay.value));
        })
      }
    });
    const dom = cmLoadMore.value?.$el;
    if (dom) {
      observer.observe(dom);
    }
  }
}

const myRefresh = () => {
  if (loadingMore.value || refreshing.value || !onRefresh) return;
  const nLoadIndex = ++loadIndex;
  // console.log("刷新");
  shouldnotLoad.value = false;
  refreshing.value = true;
  refreshError.value = false;
  finished.value = false;
  loadMoreError.value = false;
  cmRefresh.value.$el.scrollTop = 0;
  onRefresh()
    .then((onMore = false) => {
      if (nLoadIndex === loadIndex) {
        refreshing.value = false;
        finished.value = onMore;
        check(true);
      }
    })
    .catch(() => {
      if (nLoadIndex === loadIndex) {
        refreshing.value = false;
        refreshError.value = true;
        finished.value = false;
      }
    });
}

const myLoadMore = () => {
  if (loadingMore.value || refreshing.value || !onLoadMore) return;
  const nLoadIndex = ++loadIndex;
  loadingMore.value = true;
  shouldnotLoad.value = false;
  refreshError.value = false;
  loadMoreError.value = false;
  onLoadMore()
    .then((onMore = false) => {
      if (nLoadIndex === loadIndex) {
        loadingMore.value = false;
        finished.value = onMore;
      }
    })
    .catch(() => {
      loadingMore.value = false;
      loadMoreError.value = true;
    });
}

const check = (isSingle = false) => {
  if (!isSingle) shouldnotLoad.value = false;
  cmLoadMore.value?.check();
}

const refresh = () => {
  refreshing.value = false;
  loadingMore.value = false;
  myRefresh();
}

const onScroll = (e) => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    scrollTop = e.target.scrollTop;
  }, 80)
}

onActivated(() => {
  init();
  nextTick(() => {
    cmRefresh.value.$el.scrollTop = scrollTop;
  });
})
onDeactivated(() => {
  init(true);
})
onMounted(() => {
  init();
})
onBeforeUnmount(() => {
  init(true);
})
defineExpose({
  refresh,
  check
})

</script>


<template>
  <van-pull-refresh ref="cmRefresh" class="list" :modelValue="refreshing" :success-duration="800" :pull-distance="80"
    @refresh="myRefresh" :disabled="loadingMore.value || !onRefresh">
    <template #loading>
      <BbLoadingIcon size="50px" />
    </template>
    <van-list ref="cmLoadMore" :disabled="refreshing || shouldnotLoad || !onLoadMore" :loading="loadingMore"
      :finished="finished" :error-text="errorText" :error="loadMoreError || refreshError" finished-text="没有更多了"
      @load="myLoadMore">
      <template #loading>
        <BbLoadingIcon size="50px" />
      </template>
      <div class="bb-list-content" ref="content-box">
        <van-back-top v-if="useBackTop" offset="50" right="10vw" bottom="20vh" />
        <slot></slot>
      </div>
      <template #error>
        <div @click="() => {
          loadMoreError = false;
          refreshError = false;
          if (onLoadMore) {
            check()
          } else {
            refresh()
          }

        }">
          {{ refreshError ? '获取数据失败，点击此处继续加载' : errorText }}
        </div>
      </template>
    </van-list>
  </van-pull-refresh>
</template>
<style lang="less" scoped>
.list {
  width: 100%;
  height: 100%;
  flex-grow: 1;
  overflow-y: auto;
}
</style>