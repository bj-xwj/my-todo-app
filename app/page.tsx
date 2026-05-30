'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: number
  task: string
  completed: boolean
  created_at: string
}

type FilterType = 'all' | 'completed' | 'active'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  // 获取所有 todos
  const fetchTodos = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setTodos(data || [])
      }
    } catch (err) {
      setError('Failed to fetch todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 根据过滤条件获取任务
  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed
    if (filter === 'active') return !todo.completed
    return true
  })

  // 添加新任务
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      setSubmitting(true)
      const { error: insertError } = await supabase
        .from('todos')
        .insert({ task: newTask.trim(), completed: false })

      if (insertError) {
        setError(insertError.message)
      } else {
        setNewTask('')
        await fetchTodos()
      }
    } catch (err) {
      setError('Failed to add todo')
    } finally {
      setSubmitting(false)
    }
  }

  // 切换完成状态
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)

      if (updateError) {
        setError(updateError.message)
      } else {
        await fetchTodos()
      }
    } catch (err) {
      setError('Failed to update todo')
    }
  }

  // 删除任务
  const deleteTodo = async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (deleteError) {
        setError(deleteError.message)
      } else {
        await fetchTodos()
      }
    } catch (err) {
      setError('Failed to delete todo')
    }
  }

  // 全选/取消全选
  const toggleAll = async () => {
    if (todos.length === 0) return
    const allCompleted = todos.every(t => t.completed)
    try {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ completed: !allCompleted })
        .in('id', todos.map(t => t.id))

      if (updateError) {
        setError(updateError.message)
      } else {
        await fetchTodos()
      }
    } catch (err) {
      setError('Failed to toggle all todos')
    }
  }

  // 清除已完成的任务
  const clearCompleted = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true)

      if (deleteError) {
        setError(deleteError.message)
      } else {
        await fetchTodos()
      }
    } catch (err) {
      setError('Failed to clear completed todos')
    }
  }

  // 统计数据
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  }

  // 是否有已完成的任务
  const hasCompleted = todos.some(t => t.completed)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* 主卡片 */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-[#1a237e] px-6 py-8 text-center rounded-t-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">我的待办事项</h1>
          <p className="text-blue-200 text-sm">高效管理每一天</p>
        </div>

        {/* 添加任务表单 */}
        <form onSubmit={addTodo} className="p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] text-gray-700"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newTask.trim()}
              className="px-5 py-2.5 bg-[#1976d2] text-white rounded-lg font-medium hover:bg-[#1565c0] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '添加中' : '添加'}
            </button>
          </div>
        </form>

        {/* 错误提示 */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 工具栏：全选 + 过滤器 */}
        <div className="px-4 pb-3 flex items-center justify-between">
          {/* 全选按钮 */}
          <button
            onClick={toggleAll}
            disabled={todos.length === 0}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1976d2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              todos.length > 0 && todos.every(t => t.completed)
                ? 'bg-[#1976d2] border-[#1976d2]'
                : 'border-gray-300'
            }`}>
              {todos.length > 0 && todos.every(t => t.completed) && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            全选
          </button>

          {/* 过滤器 */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-[#1976d2] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? '全部' : filterType === 'active' ? '未完成' : '已完成'}
              </button>
            ))}
          </div>
        </div>

        {/* 任务列表 */}
        <div className="min-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {filter === 'completed' ? '暂无已完成的任务' :
                 filter === 'active' ? '暂无未完成的任务' : '暂无任务'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* 复选框 */}
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-[#1976d2] border-[#1976d2]'
                        : 'border-gray-300 hover:border-[#1976d2]'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* 任务文本 */}
                  <span
                    className={`flex-1 text-base ${
                      todo.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700'
                    }`}
                  >
                    {todo.task}
                  </span>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 底部统计 + 清除已完成 */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            共 {stats.total} 项任务 · 已完成 {stats.completed} 项
          </span>
          {hasCompleted && (
            <button
              onClick={clearCompleted}
              className="text-red-500 hover:text-red-600 hover:underline transition-colors"
            >
              清除已完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
