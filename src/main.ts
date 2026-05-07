import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAuthStore } from './stores/auth.store'
import { useCompareStore } from './stores/compare.store'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)

const authStore = useAuthStore()
authStore.init()
const compareStore = useCompareStore()
compareStore.init()

app.mount('#app')
