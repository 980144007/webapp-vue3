import axios from "axios";
import { useUserInfo } from 'stores';

function useAxios() {
    const store = useUserInfo();
    const download = axios.create({
        baseURL: import.meta.env.VITE_API_FILE_URL,
        timeout: 10000,
    });
    const upload = axios.create({
      baseURL: import.meta.env.VITE_API_FILE_UPLOAD_URL,
      timeout: 10000,
    });
    const reqConfig = (config) => {
      const token = store.token;
      if (token) {  
          config.headers.Authorization = `Bearer ${token}`;  
      }  
      return config;  
    }
    const reqError = (error) => {  
      // 对请求错误做些什么  
      return Promise.reject(error);
    }
    const resConfig = (response) => {  
      // 对响应数据做点什么，例如统一处理错误格式  
      return response.data;  
    }
    const resError = (error) => {  
      // 对响应错误做点什么，例如统一处理错误状态码  
      if (error.response && error.response.status === 401) {  
          // 处理未授权错误，例如重定向到登录页面或清除 token  
      }  
      return Promise.reject(error);
    } 
    // 请求拦截器  
    download.interceptors.request.use(
      reqConfig,
      reqError    
    );  
    upload.interceptors.request.use(
      reqConfig,
      reqError    
    ); 
    // 响应拦截器  
    download.interceptors.response.use(  
      resConfig,  
      resError
    );
    upload.interceptors.response.use(  
      resConfig,  
      resError
    );
    function makeOptions(options) {
        if(options?.onUpload) {
            options.onUploadProgress = function (progressEvent) {
                // 处理原生进度事件
                options?.onUpload?.(progressEvent);
            }
        }
        if(options?.onDownload) {
            options.onDownloadProgress = function (progressEvent) {
                // 处理原生进度事件
                options?.onDownload?.(progressEvent);
            }
        }
        const form = new FormData();
        const data = options.data;
        if(data) {
          if(Array.isArray(data)) {
            data.forEach(({name: name = "file", value, fileName}) => {
              if(value && value.constructor && value.constructor.name === "File") {
                form.append(name, value, fileName || fileName === 0 ? fileName : value.name);
              } else {
                form.append(name, value);
              }
            })
          } else if(data !== null && typeof data === 'object'){
            const {
              name: name = "file", 
              value, 
              fileName
            } = data;
            if(val && val.constructor && val.constructor.name === "File") {
              form.append(name, value, fileName || fileName === 0 ? fileName : value.name);
            } else {
              form.append(name, value);
            }
            
          }
          options.data = form;
        }
        if(options.method === "get" && !options.params && options.data) {
            options.params = options.data;
        }
        return options;
    }
    const fn = {};
    fn.upload = function(options) {
        const defultOptions = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        return upload({...defultOptions, ...makeOptions({...options}), method: "post"})
    }
    fn.download = function(options) {
        const defultOptions = {
          responseType: 'blob'
        };
        return download({...defultOptions, ...makeOptions({...options, method: "get"}), method: "get"})
    }
    return fn;
}

// 导出 axios 实例  
export default useAxios;