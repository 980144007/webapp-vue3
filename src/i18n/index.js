import { createI18n } from 'vue-i18n'
import messages from './langs'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

export const setupI18n = (languageStore) => {
  i18n.global.locale.value = languageStore.currentLanguage
  
  languageStore.$subscribe((mutation, state) => {
    i18n.global.locale.value = state.currentLanguage
  })
}

export default i18n
