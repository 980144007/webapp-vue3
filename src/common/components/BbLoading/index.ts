import type { App } from "vue";
import { Loading } from "vant";
import "vant/lib/loading/style/index";
import BbLoadingFun from "./BbLoadingFun";

const fn = new BbLoadingFun();

function install(app: App) {
  if (!app) return;
  app.component("BbLoading", Loading);
  app.provide("$loading", fn);
  window.$loading = fn;
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  Loading: fn,
};
