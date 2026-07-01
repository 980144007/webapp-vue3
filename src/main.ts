import { createApp } from 'vue'
import '@vant/touch-emulator';
import App from './App.vue'
import router from 'router'
import piniaPersist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'
import { showSuccessToast, showFailToast, Toast } from 'vant';
import i18n, { setupI18n } from './i18n'

import {
    useAxios,
    useFileFetch
} from "apis";
import lodash from "lodash";
import qs from "qs";
import directives from "directives"
import {
    decodeUri,
    getUrlParam
} from "common/js/commonMethods";
import BbLoading from "components/BbLoading"
import { useLanguage } from 'stores'
const vm = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersist);
vm.use(router).use(pinia).use(i18n);

const languageStore = useLanguage()
setupI18n(languageStore)
const axios = useAxios();
const fileFetch = useFileFetch();

const commonFns = {
  post: axios.post,
  get: axios.get,
  uploadFile: fileFetch.upload,
  downloadFile: fileFetch.download,
  axios,
  lodash,
  cloneDeep: lodash.cloneDeep,
  dayjs,
  qs,
  decodeUri,
  getUrlParam,
  failToast: showFailToast,
  successToast: showSuccessToast,
  toast: Toast,
  getFileType: (suffix?: string) => {
    const types: Record<string, string[]> = {
      image: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
    };
    for (let key in types) {
      const checked = types[key].some((item) => {
        return item === suffix?.toLowerCase();
      });
      if (checked) {
        return key;
      }
    }
    return "other";
  },
};

for(const key in commonFns) {
    const name = /^\$/.test(key) ? key : `$${key}`;
    const fn = commonFns[key as keyof typeof commonFns];
    vm.provide(name, fn);
    window[name as keyof Window] = fn as never;
}

for(let key in directives) {
    const directive = directives[key as keyof typeof directives];
    const name = directive.name;
    if(!name) continue;
    vm.directive(name, directive)
}
vm.use(BbLoading);
vm.mount('#app');
