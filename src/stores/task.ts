import { defineStore } from 'pinia'
import { taskService } from '@/api/task'

interface Task {
  id: string
  title: string
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'
  completed?: boolean
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    completedTasks: [] as Task[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    quadrants: (state) => ({
      q1: state.tasks.filter((t) => t.quadrant === 'q1'),
      q2: state.tasks.filter((t) => t.quadrant === 'q2'),
      q3: state.tasks.filter((t) => t.quadrant === 'q3'),
      q4: state.tasks.filter((t) => t.quadrant === 'q4'),
    }),
  },

  actions: {
    // 获取所有未完成任务，用于四象限矩阵页面
    async fetchTasks() {
      try {
        this.loading = true
        const allTasks = await taskService.getAll()
        // 过滤出未完成的任务
        this.tasks = allTasks.filter((task: Task) => !task.completed)
      } catch (error: unknown) {
        this.error = '获取任务失败'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 获取所有任务（包括已完成和未完成）
    async fetchAllTasks() {
      try {
        this.loading = true
        return await taskService.getAll()
      } catch (error: unknown) {
        this.error = '获取所有任务失败'
        console.error(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // 原有的获取已完成任务的方法，现在可以直接使用 getAll 并过滤
    async fetchCompletedTasks() {
      try {
        this.loading = true
        const allTasks = await taskService.getAll()
        this.completedTasks = allTasks.filter((task: Task) => task.completed)
      } catch (error: unknown) {
        this.error = '获取已完成任务失败'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async addTask(payload: { title: string; quadrant: string }) {
      try {
        const newTask = await taskService.create(payload)
        this.tasks.push(newTask)
        return newTask
      } catch (error) {
        this.error = '创建任务失败'
        throw error
      }
    },

    async deleteTask(id: string) {
      try {
        await taskService.delete(id)
        this.tasks = this.tasks.filter((t) => t.id !== id)
      } catch (error) {
        this.error = '删除任务失败'
        throw error
      }
    },

    async updateTaskQuadrant(id: string, quadrant: string) {
      try {
        const task = this.tasks.find((t) => t.id === id)
        if (task) task.quadrant = quadrant as Task['quadrant']

        taskService.update(id, { quadrant }).catch((error) => {
          console.error('更新任务象限失败', error)
          this.error = '更新任务失败'
        })
      } catch (error: unknown) {
        this.error = '更新任务失败'
        console.error(error)
      }
    },

    // Add this method to your useTaskStore
    async updateTask(
      id: string,
      payload: Partial<{ title: string; quadrant: string; completed: boolean }>,
    ) {
      try {
        this.loading = true
        // Call the taskService to update the task
        const updatedTask = await taskService.update(id, payload)

        // Update the task in the local state
        const index = this.tasks.findIndex((task) => task.id === id)
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updatedTask }
        }

        return updatedTask
      } catch (error) {
        console.error('更新任务失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeTask(id: string) {
      try {
        const task = this.tasks.find((t) => t.id === id)
        if (!task) return

        await taskService.update(id, { completed: true })
        // 移除活动任务列表中的任务
        this.tasks = this.tasks.filter((t) => t.id !== id)
        // 添加到已完成任务列表
        this.completedTasks.unshift({ ...task, completed: true })
      } catch (error) {
        this.error = '完成任务失败'
        throw error
      }
    },

    async restoreTask(id: string) {
      try {
        const task = this.completedTasks.find((t) => t.id === id)
        if (!task) return

        await taskService.update(id, { completed: false })
        // 移除已完成任务列表中的任务
        this.completedTasks = this.completedTasks.filter((t) => t.id !== id)
        // 添加到活动任务列表
        this.tasks.push({ ...task, completed: false })
      } catch (error) {
        this.error = '恢复任务失败'
        throw error
      }
    },
  },
})
