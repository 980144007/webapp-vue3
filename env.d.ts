/// <reference types="vite/client" />

declare const VITE_CORP_ID: string;
declare const $uploadFile: (...args: any[]) => any;
declare const $downloadFile: (...args: any[]) => any;
declare const $cloneDeep: <T>(value: T) => T;
declare const $post: (...args: any[]) => any;
declare const $get: (...args: any[]) => any;
declare const $loading: any;
declare const $failToast: (...args: any[]) => any;
declare const $successToast: (...args: any[]) => any;
declare const $toast: (...args: any[]) => any;

declare module 'stores' {
  export const useMain: any;
  export const useUserInfo: any;
  export const useDeviceInfo: any;
  export const useLanguage: any;
}

declare module 'apis' {
  export const useAxios: any;
  export const useFileFetch: any;
}

declare module 'router' {
  const router: any;
  export default router;
}

declare module 'directives' {
  const directives: Record<string, any>;
  export default directives;
}

declare module 'components/BbLoading' {
  const plugin: any;
  export default plugin;
}

declare module 'common/js/commonMethods' {
  export const decodeUri: any;
  export const getUrlParam: any;
  export const getRunningEnv: any;
  export const isPC: any;
  export const toString: any;
  export const getType: any;
  export const getFileTypeByUrl: any;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

interface Window {
  Vue: any;
  [key: `$${string}`]: unknown;
}
