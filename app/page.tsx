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
  const [showClearCompleted, setShowClearCompleted] = useState(false)

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

  // 更新显示清理按钮的状态
  useEffect(() => {
    setShowClearCompleted(todos.some(t => t.completed))
  }, [todos])

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

  // 切换任务状态（键盘支持）
  const handleKeyDown = (e: React.KeyboardEvent, id: number, completed: boolean) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggleTodo(id, completed)
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
    const allCompleted = todos.every(t => t.completed)
    try {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ completed: !allCompleted })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Todo List</h1>
          <p className="text-gray-600">使用 Next.js + Supabase 构建</p>
        </div>

        {/* 添加任务表单 */}
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newTask.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '添加中...' : '添加'}
            </button>
          </div>
        </form>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">❌ {error}</p>
            <p className="text-sm text-red-600 mt-1">
              请确保 Supabase 的 todos 表已创建且启用了 public 访问权限。
            </p>
          </div>
        )}

        {/* 任务列表 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">🎉 暂无任务</p>
              <p className="text-sm text-gray-400 mt-1">添加你的第一个任务吧！</p>
            </div>
          ) : (
            <>
              {/* 过滤器和批量操作 */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* 全选 */}
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      todos.every(t => t.completed) && todos.length > 0
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}>
                      {todos.every(t => t.completed) && todos.length > 0 && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {todos.every(t => t.completed) && todos.length > 0 ? '取消全选' : '全选'}
                  </button>

                  {/* 过滤器 */}
                  <div className="flex gap-2">
                    {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          filter === filterType
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filterType === 'all' ? '全部' : filterType === 'active' ? '未完成' : '已完成'}
                        <span className="ml-1 opacity-75">
                          {filterType === 'all' ? stats.total :
                           filterType === 'active' ? stats.active : stats.completed}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 任务列表 */}
              <ul className="divide-y divide-gray-100">
                {filteredTodos.length === 0 ? (
                  <li className="text-center py-8">
                    <p className="text-gray-500">
                      {filter === 'completed' ? '暂无已完成的任务' :
                       filter === 'active' ? '暂无未完成的任务' : '暂无任务'}
                    </p>
                  </li>
                ) : (
                  filteredTodos.map((todo) => (
                    <li
                      key={todo.id}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                        todo.completed ? 'opacity-75' : ''
                      }`}
                    >
                      {/* 复选框 - 支持键盘 */}
                      <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        onKeyDown={(e) => handleKeyDown(e, todo.id, todo.completed)}
                        aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
                        tabIndex={0}
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          todo.completed
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* 任务文本 */}
                      <span
                        className={`flex-1 text-base ${
                          todo.completed
                            ? 'text-gray-400 line-through decoration-2 decoration-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.task}
                      </span>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="flex-shrink-0 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="删除任务"
                      >
                        删除
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {/* 底部操作栏 */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {stats.completed > 0 ? (
                      <span>
                        已完成 <strong>{stats.completed}</strong> / <strong>{stats.total}</strong> 个任务
                      </span>
                    ) : (
                      <span>共 <strong>{stats.total}</strong> 个任务</span>
                    )}
                  </span>
                  {showClearCompleted && (
                    <button
                      onClick={clearCompleted}
                      className="text-red-600 hover:text-red-700 hover:underline"
                    >
                      清除已完成
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 技术栈信息 */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-white/50 rounded-lg p-3">
            <span className="font-medium text-gray-700">Next.js 14</span>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <span className="font-medium text-gray-700">Supabase</span>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <span className="font-medium text-gray-700">Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  )
}