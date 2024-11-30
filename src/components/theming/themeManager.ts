import { ref } from 'vue'
import { themes } from './themes'
import { useFont } from '@/composables/useFont'

export const currentTheme = ref('')
const { loadFont, updateFontLink } = useFont()

export const generateTailwindStyles = (theme: string, radius: string) => {
  const themeConfig = themes.find(t => t.name === theme)
  if (!themeConfig) return ''
  
  const lightVars = Object.entries(themeConfig.cssVars.light)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join('\n')
    
  const darkVars = Object.entries(themeConfig.cssVars.dark)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join('\n')

  return `@layer base {
  :root {
${lightVars}
    --radius: ${radius};
  }

  .dark {
${darkVars}
  }
}`
}

export const initializeTheme = () => {
  const currentState = JSON.parse(localStorage.getItem('currentState') || '{}')
  const storedTheme = currentState?.sceleton?.theme || 'green'
  const storedRadius = currentState?.sceleton?.radius || '0.5rem'
  const storedFont = currentState?.sceleton?.config?.theme?.fontFamily?.sans?.[0] || 'Nunito'
  
  if (!currentState.sceleton) currentState.sceleton = {}
  if (!currentState.sceleton.config) currentState.sceleton.config = {}
  
  currentState.sceleton.config = {
    ...currentState.sceleton.config,
    theme: {
      fontFamily: { sans: [storedFont, 'sans-serif'] }
    },
    darkMode: 'class'
  }
  
  currentState.sceleton.theme = storedTheme
  currentState.sceleton.radius = storedRadius
  currentState.sceleton.tailwindStyles = generateTailwindStyles(storedTheme, storedRadius)
  
  currentTheme.value = storedTheme
  document.documentElement.style.setProperty('--radius', storedRadius)
  
  updateFontLink(storedFont)
  loadFont(storedFont)
  
  localStorage.setItem('currentState', JSON.stringify(currentState))
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