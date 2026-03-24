import '@vant/touch-emulator';
import { createApp } from 'vue'
import App from './App.vue'
import router from 'router'
import piniaPersist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'
import { showSuccessToast, showFailToast, Toast } from 'vant';

import {
    useAxios,
    useFileFetch
} from "apis";
import lodash from "lodash";
import moment from "moment";
import qs from "qs";
import directives from "directives"
import {
    decodeUri,
    getUrlParam
} from "common/js/commonMethods";
import BbLoading from "components/BbLoading"
const vm = createApp(App);
const pinia = createPinia(); 
pinia.use(piniaPersist);
vm.use(router).use(pinia);
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
  moment,
  qs,
  decodeUri,
  getUrlParam,
  failToast: showFailToast,
  successToast: showSuccessToast,
  toast: Toast,
  getFileType: (suffix) => {
    const types = {
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
    const fn = commonFns[key];
    vm.provide(name, fn);
    window[name] = fn;
}

for(let key in directives) {
    const name = directives[key].name;
    if(!name) continue;
    vm.directive(name, directives[key])
}
vm.use(BbLoading);
vm.mount('#app');
