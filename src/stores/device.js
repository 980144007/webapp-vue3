import { defineStore } from 'pinia'

import {
  rotateScreenView,
  resetScreenView
} from "dingtalk-jsapi";
// console.log(999,runtime)
import {
  getUrlParam,
  getRunningEnv
} from "common/js/commonMethods"

const initialState = {
  isLandscape: false,
  isFullScreen: false,
}

const getters = {

}

const actions = {
  change(obj = {}) {
    for (let key in obj) {
      if (!(key in initialState)) continue;
      this[key] = obj[key];
    }
  },
  changeFullScreen(isFullScreen = !this.isFullScreen) {
    this.change({
      isFullScreen
    })
  },
  rotateScreen(isLandscape = !this.isLandscape) {
    if(isLandscape) {
      rotateScreenView({
        clockwise: true,
        showStatusBar: true,
        success: () => {
          this.change({
            isLandscape
          })
        },
      })
    } else {
      resetScreenView({
        success: () => {
          this.change({
            isLandscape
          })
        },
      });
    }

  }
}

const deviceInfo = defineStore('device', {
  state: () => ({ ...initialState }),
  getters,
  actions,

})

export default deviceInfo;
