<script setup lang="ts">
import draggable from 'vuedraggable'
import { SparklesIcon, CheckIcon, TrashIcon } from '@heroicons/vue/24/solid'

// 定义Task接口
interface Task {
  id: string
  title: string
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'
}

// 定义接收的属性
const props = defineProps<{
  // 象限数据
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'
  title: string // 象限标题
  tasks: Task[] // 象限任务列表
  color: string // 象限主题色: red, yellow, green, blue

  // 状态
  currentTargetQuadrant: string | null
  draggingTask: Task | null
  lastDraggedTask: Task | null
}>()

// 定义事件
const emit = defineEmits<{
  change: [
    event: {
      added?: { element: Task; newIndex: number }
      moved?: { oldIndex: number; newIndex: number }
    },
    quadrant: 'q1' | 'q2' | 'q3' | 'q4',
  ]
  'drag-start': [e: { item: { __draggable_context: { element: Task } } }]
  'drag-end': []
  'drag-over': [quadrant: string]
  'complete-task': [taskId: string]
  'delete-task': [taskId: string]
}>()

const handleChange = (event: {
  added?: { element: Task; newIndex: number }
  moved?: { oldIndex: number; newIndex: number }
}) => {
  emit('change', event, props.quadrant)
}

const onDragStart = (event: { item: { __draggable_context: { element: Task } } }) => {
  emit('drag-start', event)
}

const onDragEnd = () => {
  emit('drag-end')
}

const onDragOver = () => {
  emit('drag-over', props.quadrant)
}

const completeTask = (taskId: string) => {
  emit('complete-task', taskId)
}

const deleteTask = (taskId: string) => {
  emit('delete-task', taskId)
}

// 根据颜色生成相应的类名
const getColorClasses = () => {
  const colorMap: Record<
    string,
    {
      bg: string
      border: string
      borderActive: string
      text: string
      dragArea: string
    }
  > = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      borderActive: 'border-red-400',
      text: 'text-red-600',
      dragArea: 'border-red-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      borderActive: 'border-yellow-400',
      text: 'text-yellow-600',
      dragArea: 'border-yellow-200',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      borderActive: 'border-green-400',
      text: 'text-green-600',
      dragArea: 'border-green-200',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      borderActive: 'border-blue-400',
      text: 'text-blue-600',
      dragArea: 'border-blue-200',
    },
  }

  return colorMap[props.color] || colorMap.blue
}

const colorClasses = getColorClasses()
</script>

<template>
  <div
    :class="[
      colorClasses.bg,
      currentTargetQuadrant === quadrant
        ? 'border-dashed ' + colorClasses.borderActive
        : colorClasses.border,
      tasks.length === 0 ? 'min-h-[200px]' : '',
      'p-2 rounded-lg border-2 flex flex-col',
    ]"
    @dragover.prevent="onDragOver"
  >
    <h2 :class="['text-xl font-semibold mb-4', colorClasses.text]">{{ title }}</h2>
    <draggable
      :list="tasks"
      group="tasks"
      item-key="id"
      :class="[
        'drag-area h-full min-h-[200px] relative rounded-lg border-2',
        colorClasses.dragArea,
      ]"
      @change="handleChange"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div
          class="draggable-item bg-white p-3 mb-2 rounded shadow-lg transition-transform duration-150 hover:scale-[1.02] hover:shadow-xl active:scale-100 active:opacity-80 flex items-center gap-2 group relative"
        >
          <span class="flex items-center w-full">
            <!-- ID 标签 - 固定 4 字符宽度 -->
            <span
              class="font-mono text-gray-600 bg-gray-100/80 rounded px-1 mr-2 text-right min-w-[3.5ch] max-w-[4ch] flex-none"
            >
              {{ element.id }}
            </span>

            <!-- 标题 - 自动截断 -->
            <span class="truncate flex-1">
              {{ element.title }}
            </span>
          </span>
          <!-- 完成按钮 -->
          <button
            @click.stop="completeTask(element.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity text-green-500 hover:text-green-700 p-1 -mr-2 rounded-full hover:bg-green-100"
            title="完成任务"
          >
            <CheckIcon class="w-5 h-5" />
          </button>

          <!-- 删除按钮 -->
          <button
            @click.stop="deleteTask(element.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 -mr-2 rounded-full hover:bg-red-100"
            title="删除任务"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
          <!-- 新增绿点指示 -->
          <SparklesIcon
            v-if="lastDraggedTask?.id === element.id"
            class="size-6 shrink-0 text-yellow-400"
          />
          <div
            v-if="draggingTask?.id === element.id"
            class="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg"
          />
        </div>
      </template>
      <!-- 空状态提示 -->
      <template #footer>
        <div
          v-if="tasks.length === 0 && currentTargetQuadrant !== quadrant"
          class="text-gray-400 text-sm h-full flex items-center justify-center py-4"
        >
          拖动任务到这里
        </div>
      </template>
    </draggable>
  </div>
</template>
