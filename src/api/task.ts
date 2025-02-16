import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASEURL,
  timeout: 5000
})

export const taskService = {
  async getAll() {
    const { data } = await api.get('/tasks')
    return data
  },

  async create(payload: { title: string; quadrant: string }) {
    const { data } = await api.post('/tasks', payload)
    return data
  },

  async update(id: string, payload: Partial<{ title: string; quadrant: string }>) {
    const { data } = await api.put(`/tasks/${id}`, payload)
    return data
  },

  async delete(id: string) {
    await api.delete(`/tasks/${id}`)
  }
}
