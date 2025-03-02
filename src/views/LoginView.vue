<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const login = async () => {
  // 简单的表单验证
  if (!username.value || !password.value) {
    errorMessage.value = '用户名和密码不能为空'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await auth.login(username.value, password.value)
    // 登录成功后跳转到首页
    router.push('/')
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : '登录失败，请检查用户名和密码'
    errorMessage.value = errorMsg
    console.error('登录失败', error)
  } finally {
    loading.value = false
  }
}

// 检查是否已经登录
onMounted(async () => {
  const isAuthenticated = await auth.checkAuthStatus()
  if (isAuthenticated) {
    router.push('/')
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-10">
    <div
      class="w-full sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 bg-white rounded-lg shadow-lg p-8 sm:p-10"
    >
      <h1 class="text-3xl font-bold text-center text-blue-600 mb-6">用户登录</h1>

      <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">记住我</label>
          </div>

          <div class="text-sm">
            <a href="#" class="text-blue-600 hover:text-blue-500">忘记密码?</a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <span class="text-gray-600">还没有账号?</span>
        <router-link to="/register" class="text-blue-600 hover:text-blue-500 ml-1"
          >立即注册</router-link
        >
      </div>
    </div>
  </div>
</template>
