<script setup lang="ts">
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { storeToRefs } from 'pinia'
import { CheckCircleIcon, ArrowPathIcon, TrashIcon } from '@heroicons/vue/24/solid'

const taskStore = useTaskStore()
const { completedTasks, loading } = storeToRefs(taskStore)

// 删除已完成任务
const deleteTask = async (taskId: string) => {
  if (!confirm('确定要删除这个已完成任务吗？')) return
  try {
    await taskStore.deleteTask(taskId)
    // 删除后从完成任务列表中移除
    completedTasks.value = completedTasks.value.filter((t) => t.id !== taskId)
  } catch (error: unknown) {
    alert('删除失败')
    console.error(error)
  }
}

// 恢复已完成任务
const restoreTask = async (taskId: string) => {
  if (!confirm('确定要恢复这个任务吗？')) return
  try {
    await taskStore.restoreTask(taskId)
  } catch (error: unknown) {
    alert('恢复失败')
    console.error(error)
  }
}

// 手动刷新已完成任务数据
const refreshCompletedTasks = async () => {
  await taskStore.fetchCompletedTasks()
}

// 加载已完成任务
onMounted(async () => {
  await taskStore.fetchCompletedTasks()
})

// 按照象限名称获取中文描述
const getQuadrantName = (quadrant: string) => {
  const quadrantMap: Record<string, string> = {
    q1: '重要且紧急',
    q2: '紧急不重要',
    q3: '重要不紧急',
    q4: '不重要不紧急',
  }
  return quadrantMap[quadrant] || '未分类'
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">已完成任务</h1>
      <div class="flex gap-2">
        <button
          @click="refreshCompletedTasks"
          class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
          :disabled="loading"
        >
          <ArrowPathIcon class="size-4" :class="{ 'animate-spin': loading }" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <div
      v-else-if="completedTasks.length === 0"
      class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200"
    >
      <CheckCircleIcon class="size-16 mx-auto text-gray-300" />
      <p class="mt-4 text-gray-500 text-lg">暂无已完成任务</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="task in completedTasks"
        :key="task.id"
        class="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <CheckCircleIcon class="size-5 text-green-500" />
              <h3 class="font-medium">{{ task.title }}</h3>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {{ getQuadrantName(task.quadrant) }}
              </span>
              <span class="text-xs text-gray-500">ID: {{ task.id }}</span>
            </div>
            <span v-if="task.completedAt" class="text-xs text-gray-500 block mt-1">
              完成时间: {{ new Date(task.completedAt).toLocaleString() }}
            </span>
          </div>
          <div class="flex gap-1">
            <button
              @click="restoreTask(task.id)"
              class="p-1 text-blue-500 hover:text-blue-700 transition-colors"
              title="恢复任务"
            >
              <ArrowPathIcon class="size-5" />
            </button>
            <button
              @click="deleteTask(task.id)"
              class="p-1 text-red-500 hover:text-red-700 transition-colors"
              title="删除任务"
            >
              <TrashIcon class="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
