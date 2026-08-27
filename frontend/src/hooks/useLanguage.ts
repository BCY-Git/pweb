import { create } from 'zustand'

export type Language = 'zh' | 'en'

interface LanguageStore {
  language: Language
  toggle: () => void
}

function getInitialLanguage(): Language {
  return 'zh'
}

/** 导航默认中文；用户可在当前浏览中切换为英文。 */
export const useLanguage = create<LanguageStore>((set, get) => ({
  language: getInitialLanguage(),
  toggle: () => {
    const language = get().language === 'zh' ? 'en' : 'zh'
    set({ language })
  },
}))
