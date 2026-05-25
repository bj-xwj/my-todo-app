'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: number
  task: string
  completed: boolean
  created_at: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
            <ul className="divide-y divide-gray-100">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* 复选框 */}
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
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
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 统计 */}
        {!loading && todos.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            共 {todos.length} 个任务，已完成 {todos.filter((t) => t.completed).length} 个
          </div>
        )}

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