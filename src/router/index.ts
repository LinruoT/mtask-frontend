import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authService } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/completed-tasks',
      name: 'completedTasks',
      component: () => import('../components/CompletedTasks.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true },
    },
  ],
})

// 全局路由守卫，检查身份验证状态
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = await authService.isAuthenticated()

  // 如果页面需要身份验证但用户未登录，重定向到登录页
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' })
  }
  // 如果是游客页面（登录/注册）但用户已登录，重定向到首页
  else if (to.matched.some((record) => record.meta.guest) && isAuthenticated) {
    next({ name: 'home' })
  }
  // 否则正常导航
  else {
    next()
  }
})

export default router
