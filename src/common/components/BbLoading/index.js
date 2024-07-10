import { Loading } from 'vant';
import "vant/lib/loading/style/index"
import BbLoadingFun from "./BbLoadingFun";
const fn = new BbLoadingFun();

function install(vm) {
    if (!vm) return;
    vm.component("BbLoading", Loading);
    vm.provide("$loading", fn);
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install,
    Loading: fn
}