
import { defineStore } from 'pinia'

import {
    // getRunningEnv,
    isPC,
    // getUrlParam
} from "common/js/commonMethods";
import userInfo from "./user";

const actions = {
    
}

const state = {
    isLocal:  false,
    // runningEnv: getRunningEnv(),
    isPc: isPC(),
}

const config = import.meta.env;

const getters = {
    corpId: () => {
        return config.VITE_CORP_ID;
    },
    
}

export const useMain = defineStore('main', {
    state: () => ({...state}),
    getters,
    actions
})

export const useUserInfo = userInfo;