import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
const pinia = createPinia()
const app = createApp(App)

console.log('环境变量:', import.meta.env)

if (import.meta.env.VITE_USE_MOCK === 'true') {
  const { worker } = await import('./mocks/browser')
  await worker.start()
}
app.use(pinia)
app.use(router)
app.mount('#app')
