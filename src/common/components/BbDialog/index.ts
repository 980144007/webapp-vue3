import type { App } from "vue";
import { createVNode, render } from "vue";
import BbDialog from "./BbDialog.vue";

type DialogOptions = Record<string, any> | string;
type DialogCallback = (...args: any[]) => void;

interface BbDialogCancelError extends Error {
  type: "cancel";
  canceled: true;
}

interface BbDialogPromise<T = any> extends Promise<T> {
  close: () => void;
}

function pickCallback(options: Record<string, any>, name: string): DialogCallback | undefined {
  const callback = options[name];
  delete options[name];
  return typeof callback === "function" ? callback : undefined;
}

function resolveOptions(options: DialogOptions = {}): Record<string, any> {
  if (typeof options === "string") {
    return { message: options };
  }
  return { ...options };
}

function createCancelError(): BbDialogCancelError {
  const error = new Error("BbDialog canceled") as BbDialogCancelError;
  error.name = "BbDialogCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

export function showBbDialog<T = any>(options: DialogOptions = {}): BbDialogPromise<T> {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError()) as BbDialogPromise<T>;
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
  let cleanupTimer: number | undefined;
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason?: unknown) => void;
  let visible = false;

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

  function renderDialog(show: boolean) {
    visible = show;
    const vnode = createVNode(BbDialog, {
      ...dialogProps,
      show,
      "onUpdate:show": (nextVisible: boolean) => {
        onUpdateShow?.(nextVisible);
        if (!nextVisible && !settled) {
          finish(undefined as T, false);
        }
      },
      onConfirm: () => {
        finish("confirm" as T, true);
      },
      onCancel: () => {
        finish(undefined as T, false);
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

  function finish(value: T, confirmed: boolean) {
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

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  }) as BbDialogPromise<T>;

  promise.catch(() => {});
  promise.close = () => finish(undefined as T, false);
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

function install(app: App) {
  if (!app) return;
  app.component("BbDialog", BbDialog);

  if (app.config?.globalProperties) {
    app.config.globalProperties.$bbDialog = showBbDialog;
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
