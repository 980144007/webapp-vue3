import type { App } from "vue";
import { createVNode, render } from "vue";
import BbImagesPicker from "./BbImagesPicker.vue";

interface BbImagesPickerCancelError extends Error {
  type: "cancel";
  canceled: true;
}

type BbImagesPickerOptions = Record<string, any>;

type BbImagesPickerPromise = Promise<string[]>;

function createCancelError(): BbImagesPickerCancelError {
  const error = new Error("BbImagesPicker canceled") as BbImagesPickerCancelError;
  error.name = "BbImagesPickerCancel";
  error.type = "cancel";
  error.canceled = true;
  return error;
}

let container: HTMLDivElement | null = null;

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

export function showBbImagesPicker(options: BbImagesPickerOptions = {}): BbImagesPickerPromise {
  if (typeof document === "undefined") {
    return Promise.reject(createCancelError());
  }

  const cancelError = createCancelError();

  ensureContainer();

  let settled = false;
  let resolvePromise!: (value: string[]) => void;
  let rejectPromise!: (reason?: unknown) => void;

  const promise = new Promise<string[]>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const vnode = createVNode(BbImagesPicker, {
    "onUpdate:modelValue": (value: string[]) => {
      if (settled) return;
      settled = true;
      options.onConfirm?.(value);
      resolvePromise(value);
    },
    onCancel: () => {
      if (settled) return;
      settled = true;
      options.onCancel?.(cancelError);
      rejectPromise(cancelError);
    },
    ...options,
  });

  render(vnode, container);

  const exposed = vnode.component?.exposed as { triggerUpload?: () => void } | undefined;
  if (exposed?.triggerUpload) {
    exposed.triggerUpload();
  }

  return promise;
}

function install(app: App) {
  if (!app) return;
  app.component("BbImagesPicker", BbImagesPicker);
  if (app.config?.globalProperties) {
    app.config.globalProperties.$bbImagesPicker = showBbImagesPicker;
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
