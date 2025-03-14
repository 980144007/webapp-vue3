import '@vant/touch-emulator';
import { createApp } from 'vue'
import App from './App.vue'
import router from 'router'
import piniaPersist from 'pinia-plugin-persist'
import { showToast, showSuccessToast, showFailToast } from 'vant';
import 'vant/es/toast/style';
import { createPinia } from 'pinia'
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
window.$lodash = lodash;
window.$cloneDeep = lodash.cloneDeep;
window.$moment = moment;
window.$toast = showToast;
window.$successToast = showSuccessToast;
window.$failToast = showFailToast;
// import babyScroll from 'components/baby-scroll/index.js';
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
    getUrlParam
}

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
