import { createApp } from 'vue'
import '@/assets/index.css'
import App from './App.vue'
import router from './router'
import { initializeTheme } from '@/components/theming/themeManager'
import './components/theming/themes.css'

import { isOnline } from './composables/useState'
import { ensureEmbeddingsExistForRecipes } from './composables/useEmbeddings'
import {getHistory} from '@/composables/useDexie'

// Initialize theme and collecty store
initializeTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')

isOnline.value = navigator.onLine
window.addEventListener('online', async () => {
    if (isOnline.value) return;

    isOnline.value = true
    console.log('[online]', isOnline.value)

    const history = await getHistory()
    ensureEmbeddingsExistForRecipes(history.map(h => h.recipeId))
})

window.addEventListener('offline', () => {
    if (!isOnline.value) return;
    isOnline.value = false
    console.log('[offline]', isOnline.value)
})
    