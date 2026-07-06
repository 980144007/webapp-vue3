import { createVNode, render } from "vue";
import BbImagesPicker from "./BbImagesPicker.vue";

function createCancelError() {
  const error = new Error("BbImagesPicker canceled");
  error.name = "BbImagesPickerCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

// 缓存容器，避免每次调用都重新创建
let container = null;

function ensureContainer() {
  if (container) return;

  container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "0";
  container.style.height = "0";
  container.style.overflow = "hidden";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);
}

/**
 * 通过方法调起文件选择器，选择图片后自动上传，返回上传后的 URL 数组
 * 复用 BbImagesPicker.vue 组件的上传逻辑
 * @param {Object} options
 * @returns {Promise<string[]>} 上传成功后的 URL 数组（upload:false 时返回 base64 数组）
 */
export function showBbImagesPicker(options = {}) {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError());
  }

 ;

  const cancelError = createCancelError();

  ensureContainer();

  let settled = false;
  let resolvePromise;
  let rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });



  // 渲染组件到缓存容器中
  const vnode = createVNode(BbImagesPicker, {
    "onUpdate:modelValue": (value) => {
      if (settled) return;
      settled = true;
      options.onConfirm?.(value);
      resolvePromise(value);
    },
    "onCancel": () => {
      if (settled) return;
      settled = true;
      options.onCancel?.(cancelError);
      rejectPromise(cancelError);
    },
    ...options,
  });

  render(vnode, container);

  // render 是同步的，render 之后 vnode.component.exposed 已就绪，通过组件的 defineExpose 方法触发文件选择
  const exposed = vnode.component?.exposed;
  if (exposed?.triggerUpload) {
    exposed.triggerUpload();
  }



  return promise;
}

function install(Vue) {
  if (!Vue) return;
  Vue.component("BbImagesPicker", BbImagesPicker);
  if (Vue.config?.globalProperties) {
    Vue.config.globalProperties.$bbImagesPicker = showBbImagesPicker;
  }
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { BbImagesPicker };

export default {
  install,
  show: showBbImagesPicker,
};
