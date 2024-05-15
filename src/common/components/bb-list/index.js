import bBList from "./bb-list.vue";


function install(vm) {
    if (!vm) return;
    vm.component('bb-list', bBList);
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install
}