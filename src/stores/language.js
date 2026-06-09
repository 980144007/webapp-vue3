import { defineStore } from 'pinia'
import { languages } from 'langs/index.js'

const initialState = {
  currentLanguage: 'zh-CN',
  browserLanguage: navigator.language || 'zh-CN'
}

const getters = {
  language: (state) => state.currentLanguage,
}

const actions = {
  setLanguage(language) {
    this.currentLanguage = language || this.browserLanguage
  },
  toggleLanguage() {
    const currentIndex = languages.findIndex(lang => lang.code === this.currentLanguage)
    const nextIndex = (currentIndex + 1) % languages.length
    this.currentLanguage = languages[nextIndex].code
  }
}

const languageStore = defineStore('language', {
  state: () => ({ ...initialState }),
  getters,
  actions,
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'language',
        storage: localStorage
      }
    ]
  }
})

export default languageStore
