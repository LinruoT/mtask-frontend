<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
  >
    <header class="bg-white dark:bg-slate-800 shadow-md">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <h1
            class="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight"
          >
            四象限任务管理
          </h1>
          <nav class="mt-4 sm:mt-0">
            <RouterLink
              to="/"
              class="px-4 py-2 mx-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-700"
              active-class="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-slate-700"
            >
              首页
            </RouterLink>
            <RouterLink
              to="/completed-tasks"
              class="px-4 py-2 mx-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-700"
              active-class="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-slate-700"
            >
              已完成任务
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>© {{ new Date().getFullYear() }} 四象限任务管理 - 让时间管理更高效</p>
    </footer>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 基础变量设置 */
:root {
  --color-primary: #3b82f6;
  --color-primary-light: #93c5fd;
  --color-text: #334155;
  --color-text-light: #64748b;
  --color-background: #f8fafc;
  --color-border: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #60a5fa;
    --color-primary-light: #3b82f6;
    --color-text: #f1f5f9;
    --color-text-light: #cbd5e1;
    --color-background: #0f172a;
    --color-border: #334155;
  }
}
</style>
