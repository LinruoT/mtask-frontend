import axios from 'axios'

// 确保所有请求都带上凭证（cookies）
axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASEURL,
  timeout: 5000,
  withCredentials: true, // 确保所有请求都带上凭证（cookies）
})

interface User {
  id: string
  username: string
  email?: string
}

export const authService = {
  // 内部用户状态缓存
  userCache: null as User | null,

  // 用户登录
  async login(username: string, password: string) {
    try {
      await api.post(
        '/auth/login',
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      // 登录成功后获取用户信息
      return await this.fetchCurrentUser()
    } catch (error: unknown) {
      console.error('登录失败:', error)
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || '登录失败'
      }
      throw '登录失败'
    }
  },

  // 用户登出
  async logout() {
    try {
      await api.post('/auth/logout')
      this.userCache = null
    } catch (error) {
      console.error('登出失败:', error)
      throw '登出失败'
    }
  },

  // 用户注册
  async register(username: string, email: string, password: string) {
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      })
      return data
    } catch (error: unknown) {
      console.error('注册失败:', error)
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || '注册失败'
      }
      throw '注册失败'
    }
  },

  // 获取当前登录用户
  async fetchCurrentUser() {
    try {
      const { data } = await api.get('/auth/current-user')
      this.userCache = data
      return data
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      this.userCache = null
      return null
    }
  },

  // 获取当前缓存的用户信息
  getCurrentUser() {
    return this.userCache
  },

  // 检查用户是否已登录
  async isAuthenticated() {
    if (this.userCache) return true

    try {
      const user = await this.fetchCurrentUser()
      return !!user
    } catch {
      return false
    }
  },
}
