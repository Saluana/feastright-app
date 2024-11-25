import { createApp } from 'vue'
import '@/assets/index.css'
import App from './App.vue'
import router from './router'
import { initializeTheme } from './utils/theme'

// Initialize theme before mounting the app
initializeTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
