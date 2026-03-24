
import { defineStore } from 'pinia'

import {
    getRunningEnv,
    isPC,
    getUrlParam
} from "common/js/commonMethods";
import userInfo from "./user";
import deviceInfo from "./device";

const actions = {

}

const state = {
    runningEnv: getRunningEnv(),
    isPc: isPC(),
}

const config = import.meta.env;
const getters = {
    corpId: () => {
        return VITE_CORP_ID;
    },
    fileHead: () => {
        return config.VITE_API_FILE_URL;
    },
}

export const useMain = defineStore('main', {
    state: () => ({...state}),
    getters,
    actions
})

export const useUserInfo = userInfo;
export const useDeviceInfo = deviceInfo;
