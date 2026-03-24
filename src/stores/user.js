import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'
import {
  runtime
} from "dingtalk-jsapi";
// console.log(999,runtime)
import axios from "axios";
import {
  getUrlParam,
  getRunningEnv
  // getIsWxClient
} from "common/js/commonMethods"

const initialState = {
  info: {}, // 用户信息
  havePower: false, // 是否有用户权限
  loginFail: false, // 是否登录失败（登录接口走了catch回调）
  logined: false,
  token: getUrlParam("token") || null,
}
const { VITE_CORP_ID, VITE_API_BASE_URL } = import.meta.env;
// console.log(client)
const getters = {
  user: (state) => {
    const {
      info = {},
      logined,
      havePower,
    } = state;
    return {
      ...info,
      empCode: info.vappUsercode,
      orgId: info.vappOrgid,
      logined,
      havePower,
    };
  },
}

const actions = {
  change(obj = {}) {
    for (let key in obj) {
      if (!(key in initialState)) continue;
      this[key] = obj[key];
    }
  },
  reset(obj = {}) {
    const initialObj = window.$lodash.cloneDeep(initialState);
    for (let key in initialObj) {
      this[key] = key in obj ? obj[key] : initialObj[key];
    }
  },
  login(useLatest = true) {
    return new Promise((resolve, reject) => {
      if (getRunningEnv() === 0) {
        if (!import.meta.env.DEV) {
          this.change({
            logined: true,
            havePower: false,
          });
          resolve({
            flag: false,
            message: "请在钉钉环境中访问本页面",
          });
          return;
        }
        const obj = {
          info: {
            appJobnumber: "",
            appUserid: "",
            appUsername: "",
            vappOrgid: "",
            vappUsercode: "",
          },
          logined: true,
          havePower: true,
        };
        this.change(obj);
        resolve(obj);
        return;
      }
      alert(9)
      // if (this.logined && useLatest) {
      //   resolve({
      //     info: this.info,
      //     logined: this.logined,
      //     havePower: this.havePower,
      //   });
      //   return;
      // }
      this.getCode()
        .then(this.getUserInfoByCode)
        .then((res) => {
          const { flag, data, message } = res
          const obj = {
            info: data,
            message,
            logined: true,
            havePower: flag,
          }
          this.change(obj)
          resolve(obj)
        })
        .catch(reject);
    });
  },
  getUserInfoByCode(authcode) {
    return new Promise((resolve, reject) => {
      // console.log(authCode)
      $get({
        url: `${VITE_API_BASE_URL}/cn.mb.basic.BasicPkg.userDetail.biz.ext`,
        params: { authcode },
      })
        .then(({ errCode, errMsg, user }) => {
          if (errCode !== "S") {
            reject(errMsg);
            return
          } else if (!user || !user.vappUsercode) {
            resolve({flag: false, message: "无此用户"});
            return
          }
          resolve({ flag: true, data: user });
        })
        .catch((err) => {
          console.log(222, err);
          reject("获取用户信息失败");
        });
    });
  },
  getCode() {
    return new Promise((resolve, reject) => {
      runtime.permission.requestAuthCode({
        corpId: VITE_CORP_ID,
        onSuccess: function ({ code }) {
          resolve(code);
        },
        onFail: function (err) {
          runtime.permission.requestAuthCode({
            corpId: VITE_CORP_ID,
            onSuccess: function ({ code }) {
              resolve(code);
            },
            onFail: function (err) {
              alert(VITE_CORP_ID);
              reject("请求授权码失败");
            },
          });
        },
      });
    });
  },
};

const userInfo = defineStore('userInfo', {
  state: () => ({ ...initialState }),
  getters,
  actions,
  persist: {
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

export default userInfo;