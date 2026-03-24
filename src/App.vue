<script setup name="app">
import vconsole from "vconsole";
import {
  ref,
  watch,
  onBeforeMount
} from "vue";
import {
    useUserInfo
} from "stores";
import {
    storeToRefs
} from "pinia";
import {
  useRoute
} from "vue-router";
const route = useRoute();
const userInfo = useUserInfo();
const {
    user
} = storeToRefs(userInfo);
const tip = ref(null);
let vConsole = null;
let vT = null;
const clickNum = ref(0);
const vShow = ref(JSON.parse(window.localStorage.getItem("vShow")) || false);

watch(clickNum, (n) => {
  if(!n) return;
  updateVConsole();
})
watch(vShow, (n) => {
  window.localStorage.setItem("vShow", n);
})
const updateVConsole = () => {
  if(!vShow.value) {
    vConsole?.destroy?.();
    vConsole = null;
    return;
  }
  if(!vConsole) {
    vConsole = new vconsole();
  }
}

const onAppClick = () => {
  clearTimeout(vT);
  clickNum.value++;
  if(clickNum.value >= 5) {
    vShow.value = !vShow.value;
  }
  vT = setTimeout(() => {
    clickNum.value = 0;
  }, 500);
}
updateVConsole();
document.addEventListener("click", onAppClick);
onBeforeMount(() => {
    // if(!user.value.logined) {
        $loading.open();
        userInfo.login().then(({flag, message, info}) => {
          // console.log(333, flag, message, info)
            $loading.close();
            if(!flag) {
                tip.value = message;
                return;
            }
        }).catch(errMsg => {
          $failToast(errMsg)
        })
    // }
})
</script>

<template>
  <div id="app-container" v-overlay="{
    value: user.logined && !user.havePower,
    text: tip
  }">
    <router-view v-if="user.logined && user.havePower" v-slot="{Component}">
      <keep-alive >
        <component v-if="!!route?.meta?.keepAlive" :is="Component" />
      </keep-alive>
      <component v-if="!route?.meta?.keepAlive" :is="Component" />
    </router-view>
  </div>
</template>

<style lang="less">
html,body,#app,#app-container {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
}

.van-cell {
  align-items: center;
}

.van-dialog {
  // width: 320px!important;
  width: var(--van-dialog-width)!important;
}
.van-empty {
  padding: 0px!important;
}
.van-button--mini {
  font-size: 14px!important;
  .van-icon {
    font-size: 16px!important;
  }
  
}
</style>
