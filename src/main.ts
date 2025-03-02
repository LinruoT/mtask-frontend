import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// 创建应用和状态管理
const pinia = createPinia()
const app = createApp(App)

console.log('环境变量:', import.meta.env)

// 启动 mock 服务器（如果启用）
if (import.meta.env.VITE_USE_MOCK === 'true') {
  const { worker } = await import('./mocks/browser')
  await worker.start()
}

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth().catch((error) => {
  console.error('初始化认证状态失败:', error)
})
