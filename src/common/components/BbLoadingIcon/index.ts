import type { App } from "vue";
import BbLoadingIcon from "./BbLoadingIcon.vue";

function install(app: App) {
  if (!app) return;
  app.component("BbLoadingIcon", BbLoadingIcon);
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
};
