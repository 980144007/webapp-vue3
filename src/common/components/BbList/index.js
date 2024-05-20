import BbList from "./BbList.vue";


function install(vm) {
    if (!vm) return;
    vm.component('BbList', BbList);
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install
}