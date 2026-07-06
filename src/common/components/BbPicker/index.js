import { createVNode, render } from "vue";
import BbPicker from "./BbPicker.vue";

function pickCallback(options, name) {
  const callback = options[name];
  delete options[name];
  return typeof callback === "function" ? callback : undefined;
}

function resolveOptions(options = {}) {
  if (Array.isArray(options)) {
    return { options };
  }
  if (options === null || typeof options !== "object") {
    return { modelValue: options };
  }
  return { ...options };
}

function createCancelError() {
  const error = new Error("BbPicker canceled");
  error.name = "BbPickerCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

export function showBbPicker(options = {}) {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError());
  }

  const pickerProps = resolveOptions(options);
  const onConfirm = pickCallback(pickerProps, "onConfirm");
  const onCancel = pickCallback(pickerProps, "onCancel");
  const onClose = pickCallback(pickerProps, "onClose");
  const onVisible = pickCallback(pickerProps, "onVisible");
  const onUpdateShow =
    pickCallback(pickerProps, "onUpdateShow") ||
    pickCallback(pickerProps, "onUpdate:show");

  const container = document.createElement("div");
  document.body.appendChild(container);

  let settled = false;
  let cleaned = false;
  let visible = false;
  let cleanupTimer;
  let resolvePromise;
  let rejectPromise;

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    window.clearTimeout(cleanupTimer);
    render(null, container);
    container.parentNode?.removeChild(container);
    onClose?.();
  }

  function scheduleCleanupFallback() {
    cleanupTimer = window.setTimeout(cleanup, 400);
  }

  function renderPicker(show) {
    visible = show;
    const vnode = createVNode(BbPicker, {
      ...pickerProps,
      show,
      showField: false,
      clearable: false,
      "onUpdate:show": (nextVisible) => {
        onUpdateShow?.(nextVisible);
        if (!nextVisible && !settled) {
          finish(undefined, false);
        }
      },
      onVisible: (nextVisible) => {
        onVisible?.(nextVisible);
      },
      onConfirm: (value) => {
        finish(value, true);
      },
      onClosed: cleanup,
    });

    render(vnode, container);
  }

  function closePicker() {
    if (!visible) {
      cleanup();
      return;
    }

    renderPicker(false);
    scheduleCleanupFallback();
  }

  function finish(value, confirmed) {
    if (settled) return;
    settled = true;

    if (confirmed) {
      onConfirm?.(value);
      resolvePromise(value);
    } else {
      const cancelError = createCancelError();
      onCancel?.(cancelError);
      rejectPromise(cancelError);
    }

    closePicker();
  }

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });


  promise.close = () => finish(undefined, false);
  renderPicker(false);

  const openPicker =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame
      : window.setTimeout;

  openPicker(() => {
    if (!settled && !cleaned) {
      renderPicker(true);
    }
  });

  return promise;
}

function install(Vue) {
  if (!Vue) return;
  Vue.component("BbPicker", BbPicker);

  if (Vue.config?.globalProperties) {
    Vue.config.globalProperties.$bbPicker = showBbPicker;
  }
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { BbPicker };

export default {
  install,
  show: showBbPicker,
};
