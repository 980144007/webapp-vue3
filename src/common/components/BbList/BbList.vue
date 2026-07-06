<script setup name="BbList">
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
  refreshing: {
    default: null,
  },
  loadingMore: {
    default: null,
  },
  finished: {
    default: null,
  },
  onLoadMore: {
    type: Function,
  },
  errorText: {
    type: String,
    default: "加载失败，点击此处重新加载"
  },
  hideNoMore: {
    type: Boolean,
    default: false,
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
const emit = defineEmits(["update:refreshing", "update:loadingMore", "update:finished"])
const cmRefresh = ref(null);
const cmLoadMore = ref(null);
const innerRefreshing = ref(false);
const innerLoadingMore = ref(false);
const innerFinished = ref(false);
const refreshError = ref(false);
const loadMoreError = ref(false);
const shouldnotLoad = ref(autoLoad.value ? false : true);
let observer = null;
let loadIndex = 0;
let scrollTop = 0;
let scrollTimer = null;
let initTimer = null;

const refreshingValue = computed(() => {
  if (props.refreshing === null || props.refreshing === undefined) {
    return innerRefreshing.value
  }

  return props.refreshing
})

const loadingMoreValue = computed(() => {
  if (props.loadingMore === null || props.loadingMore === undefined) {
    return innerLoadingMore.value
  }

  return props.loadingMore
})

const finishedValue = computed(() => {
  if (props.finished === null || props.finished === undefined) {
    return innerFinished.value
  }

  return props.finished
})

const setRefreshing = (value) => {
  innerRefreshing.value = value
  emit("update:refreshing", value)
}

const setLoadingMore = (value) => {
  innerLoadingMore.value = value
  emit("update:loadingMore", value)
}

const setFinished = (value) => {
  innerFinished.value = value
  emit("update:finished", value)
}

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

const myRefresh = (force = false) => {
  const shouldForceRefresh = force === true
  if (!shouldForceRefresh && (loadingMoreValue.value || refreshingValue.value)) return;
  if (!onRefresh) return;
  const nLoadIndex = ++loadIndex;
  // console.log("刷新");
  shouldnotLoad.value = false;
  setRefreshing(true);
  refreshError.value = false;
  setFinished(false);
  loadMoreError.value = false;
  cmRefresh.value.$el.scrollTop = 0;
  onRefresh()
    .then((onMore = false) => {
      if (nLoadIndex === loadIndex) {
        setRefreshing(false);
        setFinished(onMore);
        check(true);
      }
    })
    .catch(() => {
      if (nLoadIndex === loadIndex) {
        setRefreshing(false);
        refreshError.value = true;
        setFinished(false);
      }
    });
}

const myLoadMore = () => {
  if (loadingMoreValue.value || refreshingValue.value || !onLoadMore) return;
  const nLoadIndex = ++loadIndex;
  setLoadingMore(true);
  shouldnotLoad.value = false;
  refreshError.value = false;
  loadMoreError.value = false;
  onLoadMore()
    .then((onMore = false) => {
      if (nLoadIndex === loadIndex) {
        setLoadingMore(false);
        setFinished(onMore);
      }
    })
    .catch(() => {
      setLoadingMore(false);
      loadMoreError.value = true;
    });
}

const check = (isSingle = false) => {
  if (!isSingle) shouldnotLoad.value = false;
  cmLoadMore.value?.check();
}

const refresh = () => {
  setRefreshing(false);
  setLoadingMore(false);
  myRefresh(true);
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
  <van-pull-refresh ref="cmRefresh" class="list" :modelValue="refreshingValue" :success-duration="800" :pull-distance="80"
    @refresh="myRefresh" :disabled="loadingMoreValue || refreshingValue || !onRefresh">
    <template #loading>
      <BbLoadingIcon size="14px">●●●</BbLoadingIcon>
    </template>
    <van-list ref="cmLoadMore" :disabled="refreshingValue || shouldnotLoad || !onLoadMore" :loading="loadingMoreValue"
      :finished="finishedValue" :error-text="errorText" :error="loadMoreError || refreshError" :finished-text="hideNoMore ? '' : '没有更多了' "
      @load="myLoadMore">
      <template #loading>
        <BbLoadingIcon size="14px">●●●</BbLoadingIcon>
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
  :deep(.van-pull-refresh__head) {
    display: flex;
    justify-content: center;
  }
}
</style>
