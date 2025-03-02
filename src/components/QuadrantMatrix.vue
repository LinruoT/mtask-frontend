<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/solid'
import { useTaskStore } from '@/stores/task'
import { storeToRefs } from 'pinia'
import QuadrantPanel from './QuadrantPanel.vue'

interface Task {
  id: string
  title: string
  quadrant: 'q1' | 'q2' | 'q3' | 'q4' // 新增象限标识
}
// 在原有接口定义后添加新类型
interface NewTask {
  title: string
  quadrant: 'q1' | 'q2' | 'q3' | 'q4' | ''
}

const taskStore = useTaskStore()
const { quadrants, loading } = storeToRefs(taskStore)

// 新增响应式状态
const newTask = ref<NewTask>({
  title: '',
  quadrant: '',
})
const inputRef = ref<HTMLInputElement | null>(null)
// 修改后的addTask方法
const addTask = async () => {
  if (!newTask.value.title.trim() || !newTask.value.quadrant) {
    alert('请填写任务标题并选择象限')
    return
  }

  try {
    await taskStore.addTask({
      title: newTask.value.title.trim(),
      quadrant: newTask.value.quadrant,
    })
    newTask.value = { title: '', quadrant: '' }
    nextTick(() => inputRef.value?.focus())
  } catch (error: unknown) {
    alert('创建任务失败')
    console.error(error)
  }
}

// 修改后的删除方法
const deleteTask = async (taskId: string) => {
  if (!confirm('确定要删除吗？')) return
  try {
    await taskStore.deleteTask(taskId)
  } catch (error: unknown) {
    alert('删除失败')
    console.error(error)
  }
}

// 修改后的完成方法
const completeTask = async (taskId: string) => {
  if (!confirm('确定要完成吗？')) return
  try {
    await taskStore.completeTask(taskId)
  } catch (error: unknown) {
    alert('完成失败')
    console.error(error)
  }
}

const events = ref<Array<{ title: string; category: string }>>([])
// 初始化加载事件数据
onMounted(async () => {
  const response = await fetch('/events.json')
  events.value = await response.json()
  taskStore.fetchTasks()
})

// 新增随机添加方法
const addRandomTask = async () => {
  if (events.value.length === 0) return

  try {
    const randomIndex = Math.floor(Math.random() * events.value.length)
    const randomEvent = events.value[randomIndex]
    const quadrants = ['q1', 'q2', 'q3', 'q4']
    const randomQuadrant = quadrants[Math.floor(Math.random() * 4)] as 'q1' | 'q2' | 'q3' | 'q4'

    // 使用 taskStore.addTask 保存到后端，后端会自动生成ID
    await taskStore.addTask({
      title: `${randomEvent.title} (${randomEvent.category})`,
      quadrant: randomQuadrant,
    })
  } catch (error: unknown) {
    console.error('随机添加任务失败', error)
    alert('随机添加任务失败')
  }
}

// 新增响应式状态
const draggingTask = ref<Task | null>(null)
const currentTargetQuadrant = ref<string | null>(null)
// 新增最后移动记录
const lastDraggedTask = ref<Task | null>(null)

// 处理跨象限拖拽
// 更新后的 handleChange 函数
const handleChange = async (
  event: {
    added?: { element: Task; newIndex: number } // 新增 newIndex
    moved?: { oldIndex: number; newIndex: number }
  },
  quadrant: 'q1' | 'q2' | 'q3' | 'q4',
) => {
  if (event.added) {
    const task = event.added.element

    // 不需要重新更新本地状态，因为 vuedraggable 已经更新了视图
    // draggable 组件监听的是 quadrants.qX 数组，它们是计算属性
    // 只需要更新任务的象限属性，计算属性会自动更新视图

    try {
      // 直接调用 API 更新任务的象限，不更新本地状态
      // 因为 vuedraggable 已经在视图上反映了这个变化
      await taskStore.updateTaskQuadrant(task.id, quadrant)

      // 不要在这里设置 lastDraggedTask，应该在 onDragEnd 里设置
    } catch (error) {
      console.error('更新任务象限失败', error)
      alert('保存更改失败，请刷新页面重试')
      // 如果更新失败，刷新获取最新数据
      await taskStore.fetchTasks()
    }
  } else if (event.moved) {
    // 同象限内的顺序变化，vuedraggable 已经更新了视图
    // 不需要额外处理，也不需要调用 API（因为我们目前没有保存顺序）
  }
}

// 修改后的拖拽事件处理
const onDragStart = (e: { item: { __draggable_context: { element: Task } } }) => {
  const task = e.item.__draggable_context.element
  draggingTask.value = task
}

const onDragEnd = () => {
  // 保存之前拖拽的任务作为最后拖拽的任务
  if (draggingTask.value) {
    lastDraggedTask.value = { ...draggingTask.value }
  }

  // 重置当前拖拽状态
  draggingTask.value = null
  currentTargetQuadrant.value = null
}

const onDragOver = (quadrant: string) => {
  currentTargetQuadrant.value = quadrant
}

// 象限配置
const quadrantConfig = [
  { id: 'q1' as const, title: '重要且紧急', color: 'indigo' },
  { id: 'q2' as const, title: '紧急不重要', color: 'purple' },
  { id: 'q3' as const, title: '重要不紧急', color: 'teal' },
  { id: 'q4' as const, title: '不重要不紧急', color: 'gray' },
]
</script>

<template>
  <div class="container mx-auto p-2 max-w-[90vw]">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
      <div class="text-lg text-gray-500">拖拽任务到不同象限进行分类</div>
      <span v-if="draggingTask" class="text-gray-500 text-lg whitespace-nowrap">
        正在移动：{{ draggingTask.title }}
      </span>
    </div>
    <!-- 新增任务表单 -->
    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4">
      <input
        ref="inputRef"
        v-model="newTask.title"
        type="text"
        placeholder="输入任务标题"
        class="px-4 py-2 border rounded-lg flex-grow sm:w-48 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        @keyup.enter="addTask"
      />
      <select
        v-model="newTask.quadrant"
        class="px-4 py-2 border rounded-lg bg-white sm:w-36 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      >
        <option value="" disabled>选择象限</option>
        <option value="q1">重要且紧急</option>
        <option value="q2">紧急不重要</option>
        <option value="q3">重要不紧急</option>
        <option value="q4">不重要不紧急</option>
      </select>
      <button
        @click="addTask"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
      >
        添加任务
      </button>
      <!-- 新增随机按钮 -->
      <button
        @click="addRandomTask"
        class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap flex items-center gap-1"
      >
        <SparklesIcon class="size-5" />
        <span>随机添加任务</span>
      </button>
    </div>
    <div v-if="loading">加载中...</div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:min-h-[500px]"
      style="grid-template-rows: auto"
    >
      <!-- 使用QuadrantPanel组件 -->
      <QuadrantPanel
        v-for="config in quadrantConfig"
        :key="config.id"
        :quadrant="config.id"
        :title="config.title"
        :color="config.color"
        :tasks="quadrants[config.id]"
        :dragging-task="draggingTask"
        :last-dragged-task="lastDraggedTask"
        :current-target-quadrant="currentTargetQuadrant"
        @change="handleChange"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drag-over="onDragOver"
        @complete-task="completeTask"
        @delete-task="deleteTask"
      />
    </div>
  </div>
</template>

<style></style>
