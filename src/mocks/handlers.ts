import { http, HttpResponse } from 'msw'

// 定义任务类型
interface Task {
  id: string
  title: string
  quadrant: string
  completed: boolean
}

// 定义用户类型
interface User {
  id: string
  username: string
  email: string
  password: string
}

// 模拟数据存储
const tasks: Task[] = [
  { id: '1001', title: '完成项目计划', quadrant: 'q1', completed: false },
  { id: '1002', title: '回复紧急邮件', quadrant: 'q2', completed: false },
  { id: '1003', title: '学习新技术', quadrant: 'q3', completed: false },
  { id: '1004', title: '整理工作区', quadrant: 'q4', completed: false },
]

// 已完成任务
const completedTasks: Task[] = [
  { id: '2001', title: '团队周会', quadrant: 'q1', completed: true },
  { id: '2002', title: '更新文档', quadrant: 'q3', completed: true },
]

// 用户存储
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'password',
  },
]

// 当前登录的用户会话 (模拟服务器端session)
let currentSession: { userId: string } | null = null

// 生成唯一ID
const generateId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export const handlers = [
  // 用户登录
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = (await request.json()) as { username: string; password: string }

    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      // 设置会话
      currentSession = { userId: user.id }

      // 设置cookie (模拟)
      return new HttpResponse(null, {
        status: 200,
        headers: {
          'Set-Cookie': `sessionId=${generateId()}; Path=/; HttpOnly; SameSite=Strict`,
        },
      })
    }

    return new HttpResponse(JSON.stringify({ message: '用户名或密码错误' }), { status: 401 })
  }),

  // 用户登出
  http.post('/api/auth/logout', () => {
    // 清除会话
    currentSession = null

    // 清除cookie (模拟)
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Set-Cookie':
          'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      },
    })
  }),

  // 获取当前用户
  http.get('/api/auth/current-user', () => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    // 查找用户
    const user = users.find((u) => u.id === currentSession?.userId)

    if (user) {
      const { password, ...userWithoutPassword } = user
      return HttpResponse.json(userWithoutPassword)
    }

    return new HttpResponse(null, { status: 401 })
  }),

  // 用户注册
  http.post('/api/auth/register', async ({ request }) => {
    const newUser = (await request.json()) as Partial<User>

    // 检查用户名是否已存在
    if (users.some((u) => u.username === newUser.username)) {
      return new HttpResponse(JSON.stringify({ message: '用户名已存在' }), { status: 400 })
    }

    // 检查邮箱是否已存在
    if (users.some((u) => u.email === newUser.email)) {
      return new HttpResponse(JSON.stringify({ message: '邮箱已被注册' }), { status: 400 })
    }

    // 创建新用户
    const user: User = {
      id: generateId(),
      username: newUser.username || '',
      email: newUser.email || '',
      password: newUser.password || '',
    }

    users.push(user)

    const { password, ...userWithoutPassword } = user
    return HttpResponse.json(userWithoutPassword, { status: 201 })
  }),

  // 获取所有任务
  http.get('/api/tasks', () => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json(tasks)
  }),

  // 获取已完成任务
  http.get('/api/tasks/completed', () => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json(completedTasks)
  }),

  // 创建任务
  http.post('/api/tasks', async ({ request }) => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    const newTask = (await request.json()) as Partial<Task>
    const taskWithId: Task = {
      id: generateId(),
      title: newTask.title || '新任务',
      quadrant: newTask.quadrant || 'q1',
      completed: false,
    }

    tasks.push(taskWithId)
    return HttpResponse.json(taskWithId, { status: 201 })
  }),

  // 更新任务
  http.put('/api/tasks/:id', async ({ params, request }) => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    const { id } = params
    const updates = (await request.json()) as Partial<Task>

    // 找到要更新的任务
    const taskIndex = tasks.findIndex((t) => t.id === id)
    const completedTaskIndex = completedTasks.findIndex((t) => t.id === id)

    // 如果任务从未完成变为已完成
    if (updates.completed === true && taskIndex !== -1) {
      const task = { ...tasks[taskIndex], ...updates }
      tasks.splice(taskIndex, 1)
      completedTasks.unshift(task)
      return HttpResponse.json(task)
    }

    // 如果任务从已完成变为未完成
    if (updates.completed === false && completedTaskIndex !== -1) {
      const task = { ...completedTasks[completedTaskIndex], ...updates }
      completedTasks.splice(completedTaskIndex, 1)
      tasks.push(task)
      return HttpResponse.json(task)
    }

    // 普通更新
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
      return HttpResponse.json(tasks[taskIndex])
    } else if (completedTaskIndex !== -1) {
      completedTasks[completedTaskIndex] = { ...completedTasks[completedTaskIndex], ...updates }
      return HttpResponse.json(completedTasks[completedTaskIndex])
    }

    return new HttpResponse(null, { status: 404 })
  }),

  // 删除任务
  http.delete('/api/tasks/:id', ({ params }) => {
    // 检查是否有会话
    if (!currentSession) {
      return new HttpResponse(null, { status: 401 })
    }

    const { id } = params

    // 从未完成任务中删除
    const taskIndex = tasks.findIndex((t) => t.id === id)
    if (taskIndex !== -1) {
      const deleted = tasks.splice(taskIndex, 1)[0]
      return HttpResponse.json(deleted)
    }

    // 从已完成任务中删除
    const completedTaskIndex = completedTasks.findIndex((t) => t.id === id)
    if (completedTaskIndex !== -1) {
      const deleted = completedTasks.splice(completedTaskIndex, 1)[0]
      return HttpResponse.json(deleted)
    }

    return new HttpResponse(null, { status: 404 })
  }),
]
