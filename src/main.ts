import { createApp } from 'vue'
import '@/assets/index.css'
import App from './App.vue'
import router from './router'
import { initializeTheme } from '@/components/theming/themeManager'
import './components/theming/themes.css'
import { useCollecty } from '@/composables/useCollecty'
import { isOnline } from './composables/useState'

// Initialize theme and collecty store
initializeTheme()
useCollecty()

const app = createApp(App)
app.use(router)
app.mount('#app')

isOnline.value = navigator.onLine
window.addEventListener('online', () => {
    isOnline.value = true
    console.log('[online]', isOnline.value)
})
window.addEventListener('offline', () => {
    isOnline.value = false
    console.log('[offline]', isOnline.value)
})
    