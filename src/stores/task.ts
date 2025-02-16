import { defineStore } from 'pinia'
import { taskService } from '@/api/task'

interface Task {
  id: string
  title: string
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    quadrants: (state) => ({
      q1: state.tasks.filter(t => t.quadrant === 'q1'),
      q2: state.tasks.filter(t => t.quadrant === 'q2'),
      q3: state.tasks.filter(t => t.quadrant === 'q3'),
      q4: state.tasks.filter(t => t.quadrant === 'q4'),
    })
  },

  actions: {
    async fetchTasks() {
      try {
        this.loading = true
        this.tasks = await taskService.getAll()
      } catch (error) {
        this.error = '获取任务失败'
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
        this.tasks = this.tasks.filter(t => t.id !== id)
      } catch (error) {
        this.error = '删除任务失败'
        throw error
      }
    },

    async updateTaskQuadrant(id: string, quadrant: string) {
      try {
        await taskService.update(id, { quadrant })
        const task = this.tasks.find(t => t.id === id)
        if (task) task.quadrant = quadrant as Task['quadrant']
      } catch (error) {
        this.error = '更新任务失败'
        throw error
      }
    }
  }
})
