import { defineStore } from 'pinia'
import { authService } from '@/api/auth'

interface User {
  id: string
  username: string
  email?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userInfo: (state) => state.user,
  },

  actions: {
    // 初始化认证状态
    async initAuth() {
      try {
        this.loading = true
        const user = await authService.fetchCurrentUser()
        this.user = user
      } catch (error) {
        console.error('初始化认证状态失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 登录
    async login(username: string, password: string) {
      try {
        this.loading = true
        this.error = null
        const user = await authService.login(username, password)
        this.user = user
        return user
      } catch (error: unknown) {
        const errorMessage = typeof error === 'string' ? error : '登录失败'
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(username: string, email: string, password: string) {
      try {
        this.loading = true
        this.error = null
        return await authService.register(username, email, password)
      } catch (error: unknown) {
        const errorMessage = typeof error === 'string' ? error : '注册失败'
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登出
    async logout() {
      try {
        this.loading = true
        await authService.logout()
        this.user = null
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 检查登录状态
    async checkAuthStatus() {
      try {
        this.loading = true
        const user = await authService.fetchCurrentUser()
        this.user = user
        return !!user
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.user = null
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
