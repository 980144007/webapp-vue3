<script setup name="app">
import vconsole from "vconsole";
import {
  ref,
  watch,

} from "vue";


let vConsole = null;
let vT = null;
const clickNum = ref(0);
const vShow = ref(JSON.parse(window.localStorage.getItem("vShow")) || false);

watch(clickNum, (n) => {
  if(!n) return;
  updateVConsole();
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
</script>

<template>
  <div id="app-container">
    <router-view></router-view>
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
</style>
