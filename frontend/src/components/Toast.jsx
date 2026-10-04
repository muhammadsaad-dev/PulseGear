import React, { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-medium backdrop-blur-md ${
              t.type === 'success'
                ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                : t.type === 'error'
                ? 'bg-zinc-900 border-rose-800/80 text-rose-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-100'
            }`}
          >
            <p className="leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      success: (msg) => console.log('Toast:', msg),
      error: (msg) => console.log('Toast error:', msg),
      info: (msg) => console.log('Toast info:', msg),
    }
  }
  return context
}
