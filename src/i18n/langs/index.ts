import zhCN from './zh-CN'
import enUS from './en-US'

const list = [zhCN, enUS]
export default list.reduce((acc, lang) => {
  acc[lang.code] = lang
  return acc
}, {})

export const languages = list.map(lang => ({
  code: lang.code,
  name: lang.name
}))
