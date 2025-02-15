<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, computed, nextTick } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/solid'

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

// 新增响应式状态
const newTask = ref<NewTask>({
  title: '',
  quadrant: ''
})
const inputRef = ref<HTMLInputElement | null>(null)
// 新增任务方法
const addTask = () => {
  if (!newTask.value.title.trim() || !newTask.value.quadrant) {
    alert('请填写任务标题并选择象限')
    return
  }

  tasks.value.push({
    id: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    title: newTask.value.title.trim(),
    quadrant: newTask.value.quadrant
  })

  // 重置表单并聚焦输入框
  newTask.value = { title: '', quadrant: '' }
  nextTick(() => inputRef.value?.focus())
}

// 新增删除方法
const deleteTask = (taskId: string) => {
  if (!confirm('确定要删除这个任务吗？\n['+
    tasks.value.filter(t => t.id === taskId)[0].id+'] '+
    tasks.value.filter(t => t.id === taskId)[0].title
  )) return
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}
// 初始化任务数据（为每个任务添加quadrant标识）
const tasks = ref<Task[]>([
  { id: '1', title: '紧急项目', quadrant: 'q1' },
  { id: '2', title: '临时会议', quadrant: 'q2' },
  { id: '3', title: '技能提升', quadrant: 'q3' },
  { id: '4', title: '社交媒体', quadrant: 'q4' }
])
// 新增响应式状态
const draggingTask = ref<Task | null>(null)
const currentTargetQuadrant = ref<string | null>(null)
// 新增最后移动记录
const lastDraggedTask = ref<Task | null>(null)

// 根据象限分类的响应式数据
const quadrants = computed(() => ({
  q1: tasks.value.filter(t => t.quadrant === 'q1'),
  q2: tasks.value.filter(t => t.quadrant === 'q2'),
  q3: tasks.value.filter(t => t.quadrant === 'q3'),
  q4: tasks.value.filter(t => t.quadrant === 'q4'),
}))

// 处理跨象限拖拽
// 更新后的 handleChange 函数
const handleChange = (
  event: {
    added?: { element: Task, newIndex: number },  // 新增 newIndex
    moved?: { oldIndex: number, newIndex: number }
  },
  quadrant: 'q1' | 'q2' | 'q3' | 'q4'
) => {
  if (event.added) {
    const task = event.added.element;
    const targetIndex = event.added.newIndex; // 获取目标位置索引

    // 创建新数组（深拷贝避免引用问题）
    const newTasks = JSON.parse(JSON.stringify(tasks.value));

    // 从原位置移除
    const sourceIndex = newTasks.findIndex((t: Task) => t.id === task.id);
    if (sourceIndex > -1) {
      newTasks.splice(sourceIndex, 1);
    }

    // 插入到目标位置
    const quadrantTasks = newTasks.filter((t: Task) => t.quadrant === quadrant);
    const otherTasks = newTasks.filter((t: Task) => t.quadrant !== quadrant);

    // 计算实际插入位置
    const insertIndex = Math.min(targetIndex, quadrantTasks.length);
    quadrantTasks.splice(insertIndex, 0, { ...task, quadrant });

    // 合并数组
    tasks.value = [...otherTasks, ...quadrantTasks];

  } else if (event.moved) {
    // 处理同一象限内的移动
    const quadrantTasks = tasks.value.filter(t => t.quadrant === quadrant);
    const reordered = arrayMove(quadrantTasks, event.moved.oldIndex, event.moved.newIndex);
    tasks.value = [
      ...tasks.value.filter(t => t.quadrant !== quadrant),
      ...reordered
    ];
  }
};



// 使用独立工具函数处理数组移动
const arrayMove = <T>(arr: T[], from: number, to: number): T[] => {
  const copy = [...arr];
  const [removed] = copy.splice(from, 1);
  copy.splice(to, 0, removed);
  return copy;
};

// 修改后的拖拽事件处理
const onDragStart = (e: any) => {
  const task = e.item.__draggable_context.element;
  draggingTask.value = task;
}

const onDragEnd = () => {
  lastDraggedTask.value = draggingTask.value? draggingTask.value : lastDraggedTask.value;
  draggingTask.value = null
  currentTargetQuadrant.value = null
  console.log(lastDraggedTask.value)
}

const onDragOver = (quadrant: string) => {
  currentTargetQuadrant.value = quadrant
}
</script>

<template>
  <div class="container mx-auto p-2 min-w-[800px] max-w-[90vw]">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold whitespace-nowrap">四象限任务矩阵</h1>
      <span v-if="draggingTask" class="text-gray-500 text-lg whitespace-nowrap">
        正在移动：{{ draggingTask.title }}
      </span>
    </div>
    <!-- 新增任务表单 -->
    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <input
        ref="inputRef"
        v-model="newTask.title"
        type="text"
        placeholder="输入任务标题"
        class="px-4 py-2 border rounded-lg flex-grow sm:w-48 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        @keyup.enter="addTask"
      >
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
    </div>
    <div class="grid grid-cols-2 grid-rows-[quadrant] gap-4 h-[800px] w-full">
      <!-- 第一象限：重要且紧急 -->
      <div class="bg-red-50 p-2 rounded-lg border-2 border-red-200 flex flex-col"
           :class="[
          currentTargetQuadrant === 'q1' ? 'border-dashed border-red-400' : 'border-red-200',
          quadrants.q1.length === 0 ? 'min-h-[200px]' : ''
        ]"
           @dragover.prevent="onDragOver('q1')"
      >
        <h2 class="text-xl font-semibold mb-4 text-red-600">重要且紧急</h2>
        <draggable
          :list="quadrants.q1"
          group="tasks"
          item-key="id"
          class="drag-area h-full min-h-[200px] relative rounded-lg border-2 border-red-200"
          @change="handleChange($event, 'q1')"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="draggable-item bg-white p-3 mb-2 rounded shadow-lg
              transition-transform duration-150
              hover:scale-[1.02] hover:shadow-xl
              active:scale-100 active:opacity-80 flex items-center gap-2 group relative">
              <span class="flex items-center w-full">
                <!-- ID 标签 - 固定 4 字符宽度 -->
                <span class="font-mono text-gray-600 bg-gray-100/80 rounded px-1 mr-2 text-right min-w-[3.5ch] max-w-[4ch] flex-none">
                  {{ element.id }}
                </span>

                <!-- 标题 - 自动截断 -->
                <span class="truncate flex-1">
                  {{ element.title }}
                </span>
              </span>
              <!-- 删除按钮 -->
              <button
                @click.stop="deleteTask(element.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity
                 text-red-500 hover:text-red-700 p-1 -mr-2"
                title="删除任务"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
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
              v-if="quadrants.q1.length === 0 && currentTargetQuadrant !== 'q1'"
              class="text-gray-400 text-sm h-full flex items-center justify-center py-4"
            >
              拖动任务到这里
            </div>
          </template>
        </draggable>
      </div>

      <!-- 第二象限：紧急不重要 -->
      <div class="bg-yellow-50 p-2 rounded-lg border-2 border-yellow-200 flex flex-col"
           :class="[
          currentTargetQuadrant === 'q2' ? 'border-dashed border-yellow-400' : 'border-yellow-200',
          quadrants.q2.length === 0 ? 'min-h-[200px]' : ''
        ]"
           @dragover.prevent="onDragOver('q2')"
      >
        <h2 class="text-xl font-semibold mb-4 text-yellow-600">紧急不重要</h2>
        <draggable
          :list="quadrants.q2"
          group="tasks"
          item-key="id"
          class="drag-area h-full min-h-[200px] relative rounded-lg border-2 border-yellow-200"
          @change="handleChange($event, 'q2')"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="draggable-item bg-white p-3 mb-2 rounded shadow-lg
              transition-transform duration-150
              hover:scale-[1.02] hover:shadow-xl
              active:scale-100 active:opacity-80 flex items-center gap-2 group relative">
              <!-- 新增绿点指示 -->
              <span class="flex items-center w-full">
                <!-- ID 标签 - 固定 4 字符宽度 -->
                <span class="font-mono text-gray-600 bg-gray-100/80 rounded px-1 mr-2 text-right min-w-[3.5ch] max-w-[4ch] flex-none">
                  {{ element.id }}
                </span>

                <!-- 标题 - 自动截断 -->
                <span class="truncate flex-1">
                  {{ element.title }}
                </span>
              </span>
              <!-- 删除按钮 -->
              <button
                @click.stop="deleteTask(element.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity
                 text-red-500 hover:text-red-700 p-1 -mr-2"
                title="删除任务"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
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
              v-if="quadrants.q2.length === 0 && currentTargetQuadrant !== 'q2'"
              class="text-gray-400 text-sm h-full flex items-center justify-center py-4"
            >
              拖动任务到这里
            </div>
          </template>
        </draggable>
      </div>

      <!-- 第三象限：重要不紧急 -->
      <div class="bg-green-50 p-2 rounded-lg border-2 border-green-200 flex flex-col"
           :class="[
          currentTargetQuadrant === 'q3' ? 'border-dashed border-green-400' : 'border-green-200',
          quadrants.q3.length === 0 ? 'min-h-[200px]' : ''
        ]"
           @dragover.prevent="onDragOver('q3')"
      >
        <h2 class="text-xl font-semibold mb-4 text-green-600">重要不紧急</h2>
        <draggable
          :list="quadrants.q3"
          group="tasks"
          item-key="id"
          class="drag-area h-full min-h-[200px] relative rounded-lg border-2 border-green-200"
          @change="handleChange($event, 'q3')"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="draggable-item bg-white p-3 mb-2 rounded shadow-lg
              transition-transform duration-150
              hover:scale-[1.02] hover:shadow-xl
              active:scale-100 active:opacity-80 flex items-center gap-2 group relative">
              <!-- 新增绿点指示 -->
              <!-- 标题文本 -->
              <span class="flex items-center w-full">
                <!-- ID 标签 - 固定 4 字符宽度 -->
                <span class="font-mono text-gray-600 bg-gray-100/80 rounded px-1 mr-2 text-right min-w-[3.5ch] max-w-[4ch] flex-none">
                  {{ element.id }}
                </span>

                <!-- 标题 - 自动截断 -->
                <span class="truncate flex-1">
                  {{ element.title }}
                </span>
              </span>
              <!-- 删除按钮 -->
              <button
                @click.stop="deleteTask(element.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity
                 text-red-500 hover:text-red-700 p-1 -mr-2"
                title="删除任务"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
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
              v-if="quadrants.q3.length === 0 && currentTargetQuadrant !== 'q3'"
              class="text-gray-400 text-sm h-full flex items-center justify-center py-4"
            >
              拖动任务到这里
            </div>
          </template>
        </draggable>
      </div>

      <!-- 第四象限：不重要不紧急 -->
      <div class="bg-blue-50 p-2 rounded-lg border-2 border-blue-200 flex flex-col"
           :class="[
          currentTargetQuadrant === 'q4' ? 'border-dashed border-blue-400' : 'border-blue-200',
          quadrants.q4.length === 0 ? 'min-h-[200px]' : ''
        ]"
           @dragover.prevent="onDragOver('q4')"
      >
        <h2 class="text-xl font-semibold mb-4 text-blue-600">不重要不紧急</h2>
        <draggable
          :list="quadrants.q4"
          group="tasks"
          item-key="id"
          class="drag-area h-full min-h-[200px] relative rounded-lg border-2 border-blue-200"
          @change="handleChange($event, 'q4')"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="draggable-item bg-white p-3 mb-2 rounded shadow-lg
              transition-transform duration-150
              hover:scale-[1.02] hover:shadow-xl
              active:scale-100 active:opacity-80 flex items-center gap-2 group relative">
              <!-- 新增绿点指示 -->
              <!-- 标题文本 -->
              <span class="flex items-center w-full">
                <!-- ID 标签 - 固定 4 字符宽度 -->
                <span class="font-mono text-gray-600 bg-gray-100/80 rounded px-1 mr-2 text-right min-w-[3.5ch] max-w-[4ch] flex-none">
                  {{ element.id }}
                </span>

                <!-- 标题 - 自动截断 -->
                <span class="truncate flex-1">
                  {{ element.title }}
                </span>
              </span>
              <!-- 删除按钮 -->
              <button
                @click.stop="deleteTask(element.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity
                 text-red-500 hover:text-red-700 p-1 -mr-2"
                title="删除任务"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
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
              v-if="quadrants.q4.length === 0 && currentTargetQuadrant !== 'q4'"
              class="text-gray-400 text-sm h-full flex items-center justify-center py-4"
            >
              拖动任务到这里
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style>

</style>
