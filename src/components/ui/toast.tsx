'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-orange-500',
    info: 'bg-primary-600',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[260px] animate-slide-in`}>
      <span className="font-bold text-sm">{icons[toast.type]}</span>
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-white/70 hover:text-white text-xs ml-2">✕</button>
    </div>
  )
}
