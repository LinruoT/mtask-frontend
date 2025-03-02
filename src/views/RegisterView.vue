<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)

const register = async () => {
  // 简单的表单验证
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    errorMessage.value = '请输入有效的电子邮箱'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await auth.register(username.value, email.value, password.value)
    // 注册成功后跳转到登录页
    router.push('/login')
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : '注册失败，请稍后重试'
    errorMessage.value = errorMsg
    console.error('注册失败', error)
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
      <h1 class="text-3xl font-bold text-center text-blue-600 mb-6">用户注册</h1>

      <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="register" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请设置用户名"
            autocomplete="username"
            required
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入邮箱"
            autocomplete="email"
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
            placeholder="请设置密码"
            autocomplete="new-password"
            required
          />
        </div>

        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1"
            >确认密码</label
          >
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="pt-2">
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
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <span class="text-gray-600">已有账号?</span>
        <router-link to="/login" class="text-blue-600 hover:text-blue-500 ml-1"
          >立即登录</router-link
        >
      </div>
    </div>
  </div>
</template>
