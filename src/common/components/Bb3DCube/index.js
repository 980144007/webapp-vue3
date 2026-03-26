import Bb3DCube from "./Bb3DCube.vue";


function install(vm) {
    if (!vm) return;
    vm.component("Bb3DCube", Bb3DCube);
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install
}