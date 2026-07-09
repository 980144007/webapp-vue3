import type { App } from "vue";
import { createVNode, render } from "vue";
import BbPicker from "./BbPicker.vue";

type PickerOptions = Record<string, any> | any[] | null;
type PickerCallback = (...args: any[]) => void;

interface BbPickerCancelError extends Error {
  type: "cancel";
  canceled: true;
}

interface BbPickerPromise<T = any> extends Promise<T> {
  close: () => void;
}

function pickCallback(options: Record<string, any>, name: string): PickerCallback | undefined {
  const callback = options[name];
  delete options[name];
  return typeof callback === "function" ? callback : undefined;
}

function resolveOptions(options: PickerOptions = {}): Record<string, any> {
  if (Array.isArray(options)) {
    return { options };
  }
  if (options === null || typeof options !== "object") {
    return { modelValue: options };
  }
  return { ...options };
}

function createCancelError(): BbPickerCancelError {
  const error = new Error("BbPicker canceled") as BbPickerCancelError;
  error.name = "BbPickerCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

export function showBbPicker<T = any>(options: PickerOptions = {}): BbPickerPromise<T> {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError()) as BbPickerPromise<T>;
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
  let cleanupTimer: number | undefined;
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason?: unknown) => void;

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

  function renderPicker(show: boolean) {
    visible = show;
    const vnode = createVNode(BbPicker, {
      ...pickerProps,
      show,
      showField: false,
      clearable: false,
      "onUpdate:show": (nextVisible: boolean) => {
        onUpdateShow?.(nextVisible);
        if (!nextVisible && !settled) {
          finish(undefined as T, false);
        }
      },
      onVisible: (nextVisible: boolean) => {
        onVisible?.(nextVisible);
      },
      onConfirm: (value: T) => {
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

    closePicker();
  }

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  }) as BbPickerPromise<T>;

  promise.close = () => finish(undefined as T, false);
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

function install(app: App) {
  if (!app) return;
  app.component("BbPicker", BbPicker);

  if (app.config?.globalProperties) {
    app.config.globalProperties.$bbPicker = showBbPicker;
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
