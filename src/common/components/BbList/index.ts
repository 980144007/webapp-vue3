import type { App } from "vue";
import BbList from "./BbList.vue";

function install(app: App) {
  if (!app) return;
  app.component("BbList", BbList);
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
};
