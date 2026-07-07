import { createVNode, render } from "vue";
import BbDialog from "./BbDialog.vue";

function pickCallback(options, name) {
  const callback = options[name];
  delete options[name];
  return typeof callback === "function" ? callback : undefined;
}

function resolveOptions(options = {}) {
  if (typeof options === "string") {
    return { message: options };
  }
  return { ...options };
}

function createCancelError() {
  const error = new Error("BbDialog canceled");
  error.name = "BbDialogCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

export function showBbDialog(options = {}) {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError());
  }

  const dialogProps = resolveOptions(options);
  const onConfirm = pickCallback(dialogProps, "onConfirm");
  const onCancel = pickCallback(dialogProps, "onCancel");
  const onClose = pickCallback(dialogProps, "onClose");
  const onUpdateShow =
    pickCallback(dialogProps, "onUpdateShow") ||
    pickCallback(dialogProps, "onUpdate:show");

  const container = document.createElement("div");
  document.body.appendChild(container);

  let settled = false;
  let cleaned = false;
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

  function renderDialog(show) {
    const vnode = createVNode(BbDialog, {
      ...dialogProps,
      show,
      "onUpdate:show": (nextVisible) => {
        onUpdateShow?.(nextVisible);
        if (!nextVisible && !settled) {
          finish(undefined, false);
        }
      },
      onConfirm: () => {
        finish("confirm", true);
      },
      onCancel: () => {
        finish(undefined, false);
      },
      onClosed: cleanup,
    });

    render(vnode, container);
  }

  function closeDialog() {
    if (!visible) {
      cleanup();
      return;
    }
    renderDialog(false);
    scheduleCleanupFallback();
  }

  let visible = false;

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

    closeDialog();
  }

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  promise.catch(() => {});
  promise.close = () => finish(undefined, false);
  renderDialog(false);

  const openDialog =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame
      : window.setTimeout;

  openDialog(() => {
    if (!settled && !cleaned) {
      renderDialog(true);
    }
  });

  return promise;
}

function install(Vue) {
  if (!Vue) return;
  Vue.component("BbDialog", BbDialog);

  if (Vue.config?.globalProperties) {
    Vue.config.globalProperties.$bbDialog = showBbDialog;
  }
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { BbDialog };

export default {
  install,
  show: showBbDialog,
};
