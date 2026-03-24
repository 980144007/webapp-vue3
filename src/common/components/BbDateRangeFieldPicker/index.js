import BbRotate from "./BbDateRangeFieldPicker.vue";

function install(Vue) {
    if (!Vue) return;
    Vue.component('BbDateRangeFieldPicker', BbDateRangeFieldPicker);
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install,
}
