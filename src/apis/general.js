import axios from "axios";
import { useUserInfo } from 'stores';
const {
  PROD,
  VITE_API_BASE_URL
} = import.meta.env;
function useAxios() {
    // console.log(99,import.meta.env)
    const store = useUserInfo();
    const instance = axios.create({
        // baseURL: `${!PROD ? "/" : ""}${VITE_API_BASE_URL}`,
        timeout: 60000
    })

    // 请求拦截器  
    instance.interceptors.request.use(
        ({url, ...other}) => {   
            // const token = store.token;
            // if (token) {  
            //     other.headers.Authorization = `Bearer ${token}`;  
            // }
            return {
              url: !PROD ? /^http/.test(url) ? `/${url}` : `/${VITE_API_BASE_URL}${url}` : /^http/.test(url) ? url : `${VITE_API_BASE_URL}${url}`,
              ...other,
            };
        },
        (error) => {  
            // 对请求错误做些什么  
            return Promise.reject(error);
        }  
    );  
    
    // 响应拦截器  
    instance.interceptors.response.use(  
        (response) => {  
            // console.log(1001, response)
            if (response.data.code == 207) {  
                // 处理未授权错误，例如重定向到登录页面或清除 token  
                showToast(response.data.message);
                store.change({
                    logined: false,
                    token: null
                })
            }  
            // 对响应数据做点什么，例如统一处理错误格式  
            return response.data;  
        },  
        (error) => {  
            // console.log(1002, error)
            // 对响应错误做点什么，例如统一处理错误状态码  
            if (error.status === 302 || error.status === 404) {  
                // 处理未授权错误，例如重定向到登录页面或清除 token  
                store.change({
                    logined: false,
                    token: null
                })
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
        // console.log(898,options)
        // if(!options.params && options.data) {
        //     options.params = options.data;
        // }
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