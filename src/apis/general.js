import axios from "axios";
import { useUserInfo } from 'stores';

function useAxios() {
    const store = useUserInfo();
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 10000
    })

    // 请求拦截器  
    instance.interceptors.request.use(
        (config) => {  
            // 在发送请求之前做些什么，例如添加 token 到 headers  
            const token = store.token;
            if (token) {  
                config.headers.Authorization = `Bearer ${token}`;  
            }  
            return config;  
        },
        (error) => {  
            // 对请求错误做些什么  
            return Promise.reject(error);
        }  
    );  
    
    // 响应拦截器  
    instance.interceptors.response.use(  
        (response) => {  
            // 对响应数据做点什么，例如统一处理错误格式  
            return response.data;  
        },  
        (error) => {  
            // 对响应错误做点什么，例如统一处理错误状态码  
            if (error.response && error.response.status === 401) {  
                // 处理未授权错误，例如重定向到登录页面或清除 token  
            }  
            return Promise.reject(error);
        }  
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
        if(!options.params && options.data) {
            options.params = options.data;
        }
        return options;
    }
    function fn(options) {
        const defultOptions = {

        };
        return instance({...defultOptions, ...makeOptions(options)});
    }
    fn.post = function(options) {
        const defultOptions = {

        };
        return instance({...defultOptions, ...makeOptions({...options}), method: "post"})
    }
    fn.get = function(options) {
        const defultOptions = {

        };
        return instance({...defultOptions, ...makeOptions({...options, method: "get"}), method: "get"})
    }
    return fn;
}

// 导出 axios 实例  
export default useAxios;