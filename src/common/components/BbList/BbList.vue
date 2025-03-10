
<script setup name="BbList">
import {
  ref,
  toRefs,
  watch,
  onActivated,
  onDeactivated,
  nextTick,
  onMounted,
  onBeforeUnmount
} from "vue";
const {
    autoLoad,
    onRefresh,
    onLoadMore,
    errorText,
    delay,
} = toRefs(defineProps({
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
            if(isNaN(str)) {
                console.warn("延迟时间为>=0的数字");
                return false;
            }
            return str >= 0;
        }
    }
}));
const cmRefresh = ref(null);
const cmLoadMore = ref(null);
const refreshing = ref(false);
const loadingMore = ref(false);
const refreshError = ref(false);
const loadMoreError = ref(false);
const finished = ref(false);
const shouldnotLoad = ref(true);
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
    if(observer) return;
    if (onLoadMore) {
        observer = new ResizeObserver(() => {
            if(!refreshError.value) {
                nextTick(() => {
                    clearTimeout(initTimer);
                    initTimer = setTimeout(() => {
                        shouldnotLoad.value = autoLoad ? ref(false) : ref(true);
                        check(true);
                    }, Number(delay));
                }) 
            }
        });
        const dom = cmLoadMore.value?.$el;
        if(dom) {
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
    // console.log("加载");
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

if(onLoadMore) {
    watch(() => onLoadMore, val => {
        init(!n);
    })
}

onActivated(() => {
    init();
    $nextTick(() => {
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
    <van-pull-refresh
        ref="cmRefresh"
        class="list"
        :model-value="refreshing"
        :success-duration="800"
        :pull-distance="80"
        @refresh="myRefresh"
        :disabled="loadingMore.value || !onRefresh"
    >
        <template #loading>
            <svg
                style="width: 50px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
                class="lds-ellipsis"
            >
                <circle cx="84" cy="50" r="0" fill="#f3b72e">
                    <animate
                        attributeName="r"
                        values="10;0;0;0;0"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                    <animate
                        attributeName="cx"
                        values="84;84;84;84;84"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                </circle>
                <circle cx="84" cy="50" r="0.0170326" fill="#E8574E">
                    <animate
                        attributeName="r"
                        values="0;10;10;10;0"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="-0.85s"
                    ></animate>
                    <animate
                        attributeName="cx"
                        values="16;16;50;84;84"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="-0.85s"
                    ></animate>
                </circle>
                <circle cx="83.9421" cy="50" r="10" fill="#43A976">
                    <animate
                        attributeName="r"
                        values="0;10;10;10;0"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="-0.425s"
                    ></animate>
                    <animate
                        attributeName="cx"
                        values="16;16;50;84;84"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="-0.425s"
                    ></animate>
                </circle>
                <circle cx="49.9421" cy="50" r="10" fill="#304153">
                    <animate
                        attributeName="r"
                        values="0;10;10;10;0"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                    <animate
                        attributeName="cx"
                        values="16;16;50;84;84"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                </circle>
                <circle cx="16" cy="50" r="9.98297" fill="#f3b72e">
                    <animate
                        attributeName="r"
                        values="0;0;10;10;10"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                    <animate
                        attributeName="cx"
                        values="16;16;16;50;84"
                        keyTimes="0;0.25;0.5;0.75;1"
                        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                        calcMode="spline"
                        dur="1.7s"
                        repeatCount="indefinite"
                        begin="0s"
                    ></animate>
                </circle>
            </svg>
        </template>
        <van-list
            ref="cmLoadMore"
            :disabled="refreshing.value || shouldnotLoad.value || !onLoadMore"
            :loading="loadingMore"
            :finished="finished"
            :error-text="errorText"
            :error="loadMoreError || refreshError"
            finished-text="没有更多了"
            @load="myLoadMore"
        >
            <template #loading>
                <svg
                    style="width: 50px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid"
                    class="lds-ellipsis"
                >
                    <circle cx="84" cy="50" r="0" fill="#f3b72e">
                        <animate
                            attributeName="r"
                            values="10;0;0;0;0"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                        <animate
                            attributeName="cx"
                            values="84;84;84;84;84"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                    </circle>
                    <circle cx="84" cy="50" r="0.0170326" fill="#E8574E">
                        <animate
                            attributeName="r"
                            values="0;10;10;10;0"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="-0.85s"
                        ></animate>
                        <animate
                            attributeName="cx"
                            values="16;16;50;84;84"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="-0.85s"
                        ></animate>
                    </circle>
                    <circle cx="83.9421" cy="50" r="10" fill="#43A976">
                        <animate
                            attributeName="r"
                            values="0;10;10;10;0"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="-0.425s"
                        ></animate>
                        <animate
                            attributeName="cx"
                            values="16;16;50;84;84"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="-0.425s"
                        ></animate>
                    </circle>
                    <circle cx="49.9421" cy="50" r="10" fill="#304153">
                        <animate
                            attributeName="r"
                            values="0;10;10;10;0"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                        <animate
                            attributeName="cx"
                            values="16;16;50;84;84"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                    </circle>
                    <circle cx="16" cy="50" r="9.98297" fill="#f3b72e">
                        <animate
                            attributeName="r"
                            values="0;0;10;10;10"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                        <animate
                            attributeName="cx"
                            values="16;16;16;50;84"
                            keyTimes="0;0.25;0.5;0.75;1"
                            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                            calcMode="spline"
                            dur="1.7s"
                            repeatCount="indefinite"
                            begin="0s"
                        ></animate>
                    </circle>
                </svg>
            </template>
            <div class="bb-list-content" ref="content-box">
                <van-back-top offset="50" right="15vw" bottom="10vh" />
                <slot></slot>
            </div>
            <template #error>
                <div @click="() => {
                    loadMoreError = false;
                    refreshError = false;
                    if(onLoadMore) {
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