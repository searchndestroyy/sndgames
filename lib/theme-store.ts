export type Theme = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'snd_theme'

/** Returns the stored theme preference (defaults to 'system'). */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
}

/** Persists the theme and applies it to the document. */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

/** Applies dark/light class to <html> based on the given theme. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.remove('dark', 'light')

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    root.classList.add(theme)
  }
}

/** Initialises the theme on page load and watches for system changes. */
export function initTheme(): () => void {
  const theme = getStoredTheme()
  applyTheme(theme)

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (getStoredTheme() === 'system') applyTheme('system')
  }

  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
