import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/completed-tasks',
      name: 'completedTasks',
      component: () => import('../components/CompletedTasks.vue'),
    },
  ],
})

export default router
