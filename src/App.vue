<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

// 初始化认证状态
onMounted(() => {
  auth.initAuth()
})

// 用户信息
const user = computed(() => auth.userInfo)
const isLoggedIn = computed(() => auth.isAuthenticated)

// 登出 - 修改为异步函数
const logout = async () => {
  try {
    await auth.logout()
    // 确保登出操作完成后再跳转
    router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 当前年份
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="brand-and-nav">
          <h1 class="brand-title">
            <span class="text-gradient">四象限任务管理</span>
          </h1>
          <nav class="main-nav">
            <template v-if="isLoggedIn">
              <RouterLink to="/" class="nav-link" active-class="nav-link-active"> 首页 </RouterLink>
              <RouterLink to="/completed-tasks" class="nav-link" active-class="nav-link-active">
                已完成任务
              </RouterLink>

              <!-- 用户信息 -->
              <div class="user-info">
                <div class="avatar">
                  {{ user?.username?.charAt(0).toUpperCase() }}
                </div>
                <span class="username">{{ user?.username }}</span>
              </div>

              <!-- 退出登录按钮 -->
              <button @click="logout" class="logout-button">退出登录</button>
            </template>

            <template v-else>
              <RouterLink to="/login" class="nav-link" active-class="nav-link-active">
                登录
              </RouterLink>
              <RouterLink to="/register" class="register-link" active-class="register-link-active">
                注册
              </RouterLink>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p class="copyright">© {{ currentYear }} 四象限任务管理 - 让时间管理更高效</p>
        <p class="icp-info">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            class="icp-link"
          >
            蜀ICP备19008903号-1 | linruotian.com
          </a>
        </p>
      </div>
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
  scroll-behavior: smooth;
}

/* 基础变量设置 */
:root {
  /* 颜色变量 */
  --color-primary: #4f46e5;
  --color-primary-light: #818cf8;
  --color-primary-dark: #3730a3;
  --color-secondary: #f43f5e;
  --color-secondary-light: #fb7185;
  --color-accent: #0ea5e9;
  --color-accent-light: #38bdf8;
  --color-text: #1e293b;
  --color-text-light: #64748b;
  --color-background: #f8fafc;
  --color-background-alt: #f1f5f9;
  --color-border: #e2e8f0;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* 阴影变量 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* 布局与间距变量 */
  --animation-speed: 0.3s;
  --border-radius: 0.5rem;
  --border-radius-sm: 0.25rem;
  --border-radius-lg: 0.75rem;
  --container-padding: 1rem;
  --header-height: 60px;
  --footer-height: 60px;
  --content-width-full: 95%;
  --content-width-half: 92%;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #818cf8;
    --color-primary-light: #a5b4fc;
    --color-primary-dark: #4f46e5;
    --color-secondary: #fb7185;
    --color-secondary-light: #fda4af;
    --color-accent: #38bdf8;
    --color-accent-light: #7dd3fc;
    --color-text: #f1f5f9;
    --color-text-light: #94a3b8;
    --color-background: #0f172a;
    --color-background-alt: #1e293b;
    --color-border: #334155;
  }
}

/* 全局容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background-alt) 100%);
  color: var(--color-text);
  overflow-x: hidden;
  overflow-y: auto;
}

/* 页头 */
.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--animation-speed) ease;
  height: var(--header-height);
  display: flex;
  align-items: center;
}

.header-content {
  width: var(--content-width-full);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.brand-and-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand-title {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .brand-title {
    font-size: 1.6rem;
  }
}

@media (min-width: 1024px) {
  .brand-title {
    font-size: 1.75rem;
  }
}

.nav-link {
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  color: var(--color-text);
  text-decoration: none;
  transition: all var(--animation-speed) ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
  }
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: all var(--animation-speed) ease;
  transform: translateX(-50%);
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link:hover::after {
  width: 80%;
}

.nav-link-active {
  color: var(--color-primary);
  background-color: rgba(79, 70, 229, 0.1);
  font-weight: 600;
}

.nav-link-active::after {
  width: 80%;
}

.register-link {
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--animation-speed) ease;
  font-weight: 500;
  border: 1px solid var(--color-primary);
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .register-link {
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
  }
}

.register-link:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.register-link-active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all var(--animation-speed) ease;
  font-size: 0.8rem;
}

@media (min-width: 768px) {
  .avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }
}

.avatar:hover {
  transform: scale(1.1);
}

.username {
  font-weight: 500;
  color: var(--color-primary);
  display: none;
}

@media (min-width: 768px) {
  .username {
    display: inline;
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .username {
    font-size: 1rem;
  }
}

.logout-button {
  margin-left: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
  cursor: pointer;
  transition: all var(--animation-speed) ease;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .logout-button {
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
  }
}

.logout-button:hover {
  background-color: var(--color-secondary);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

/* 主内容区 */
.main-content {
  flex: 1 0 auto;
  padding: 0.5rem;
  width: var(--content-width-full);
  margin: 0 auto;
  margin-bottom: var(--footer-height);
  display: flex;
  flex-direction: column;
}

@media (min-width: 640px) {
  .main-content {
    padding: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 1rem;
  }
}

/* 针对半屏幕调整 */
@media (max-width: 960px) {
  :root {
    --content-width-full: 98%;
  }

  .main-content {
    padding: 0.5rem;
  }
}

/* 对1080p全屏的特别优化 */
@media (min-width: 1920px) {
  :root {
    --content-width-full: 90%;
  }

  .header-content,
  .main-content,
  .footer-content {
    max-width: 1800px;
  }
}

/* 页脚 */
.footer {
  background-color: var(--color-background-alt);
  padding: 0.5rem var(--container-padding);
  width: 100%;
  height: var(--footer-height);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.footer-content {
  width: var(--content-width-full);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.copyright,
.icp-info {
  margin: 0;
  color: var(--color-text-light);
  font-size: 0.8rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .copyright,
  .icp-info {
    font-size: 0.9rem;
  }
}

.icp-link {
  color: var(--color-text-light);
  text-decoration: none;
  transition: color var(--animation-speed) ease;
}

.icp-link:hover {
  color: var(--color-primary);
}

/* 页面切换动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition:
    opacity var(--animation-speed) ease,
    transform var(--animation-speed) ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(15, 23, 42, 0.8);
  }
}

/* 提供一些辅助类 */
.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1rem;
  transition: all var(--animation-speed) ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn {
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  transition: all var(--animation-speed) ease;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

/* 高分辨率屏幕优化 */
@media (min-width: 2560px) {
  :root {
    --content-width-full: 80%;
  }

  .header-content,
  .main-content,
  .footer-content {
    max-width: 2200px;
  }
}

/* 精简模式 - 当窗口高度较小时 */
@media (max-height: 800px) {
  :root {
    --header-height: 50px;
    --footer-height: 40px;
    --container-padding: 0.5rem;
  }

  .main-content {
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
  }

  .brand-title {
    font-size: 1.2rem;
  }
}
</style>
