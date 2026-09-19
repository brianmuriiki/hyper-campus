import { create } from 'zustand'

function getSystemPref() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemPref() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('hc-theme') : null
const initialTheme = stored || 'light'

export const useThemeStore = create((set, get) => ({
  theme: initialTheme, // 'light' | 'dark' | 'system'
  setTheme: (theme) => {
    localStorage.setItem('hc-theme', theme)
    applyTheme(theme)
    set({ theme })
  },
  toggle: () => {
    const isDark = document.documentElement.classList.contains('dark')
    get().setTheme(isDark ? 'light' : 'dark')
  },
}))

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useThemeStore.getState().theme === 'system') applyTheme('system')
  })
}