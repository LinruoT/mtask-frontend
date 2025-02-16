
import { http, HttpResponse } from "msw";

export const handlers = [
  // 获取所有任务
  http.get('/api/tasks', () => {
    return HttpResponse.json([])
  }),

  // 创建任务
  http.post('/api/tasks', () => {
    return HttpResponse.json({})
  }),

  // 更新任务
  http.put('/api/tasks/:id', () => {
    return HttpResponse.json({})
  }),

  // 删除任务
  http.delete('/api/tasks/:id', () => {
    return HttpResponse.json({})
  }),
]
