import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

import {
    getUrlParam,
    // getIsWxClient
} from "common/js/commonMethods"

const state = {
    havePower: false, // 是否有用户权限
    loginFail: false, // 是否登录失败（登录接口走了catch回调）
    logined: false,
    token:  getUrlParam("token") || null,
    
}

const getters = {
    user: (state) => {
        const {
            logined,
            havePower,
        } = state;
        return {   
            logined,
            havePower,
        }
    },
}

const actions = {
    
}

const useUserInfoInfo = defineStore('userInfo', {
    state: () => ({...state}),
    getters,
    actions,
    persist: {
        enabled: true,
        // strategies: [
        //     { storage: sessionStorage, paths: ['firstName', 'lastName'] },
        //     { storage: localStorage, paths: ['accessToken'] },
        // ],
        serializer: {
            deserialize: parse,
            serialize: stringify
        }
    },
})

export default useUserInfoInfo;