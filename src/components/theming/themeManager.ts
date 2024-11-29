import { ref } from 'vue'

export const currentTheme = ref('')

export const initializeTheme = () => {
  const currentState = JSON.parse(localStorage.getItem('currentState') || '{}')
  const storedTheme = currentState?.sceleton?.theme || 'green'
  const storedRadius = currentState?.sceleton?.radius || '0.5rem'
  
  currentTheme.value = storedTheme
  document.documentElement.style.setProperty('--radius', storedRadius)
  applyThemeClass(storedTheme)
}

export const applyThemeClass = (theme: string) => {
  document.documentElement.classList.forEach(className => {
    if (className.startsWith('theme-')) {
      document.documentElement.classList.remove(className)
    }
  })
  document.documentElement.classList.add(`theme-${theme}`)
} 