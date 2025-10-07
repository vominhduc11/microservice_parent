import { useState, useEffect, createContext, useContext } from 'react'

// Toast Context
const ToastContext = createContext()

// Toast types
const TOAST_TYPES = {
  success: {
    icon: '✅',
    bgColor: 'bg-success-50 dark:bg-success-900/20',
    borderColor: 'border-success-200 dark:border-success-800',
    textColor: 'text-success-800 dark:text-success-200',
    iconColor: 'text-success-600 dark:text-success-400'
  },
  error: {
    icon: '❌',
    bgColor: 'bg-danger-50 dark:bg-danger-900/20',
    borderColor: 'border-danger-200 dark:border-danger-800',
    textColor: 'text-danger-800 dark:text-danger-200',
    iconColor: 'text-danger-600 dark:text-danger-400'
  },
  warning: {
    icon: '⚠️',
    bgColor: 'bg-warning-50 dark:bg-warning-900/20',
    borderColor: 'border-warning-200 dark:border-warning-800',
    textColor: 'text-warning-800 dark:text-warning-200',
    iconColor: 'text-warning-600 dark:text-warning-400'
  },
  info: {
    icon: 'ℹ️',
    bgColor: 'bg-info-50 dark:bg-info-900/20',
    borderColor: 'border-info-200 dark:border-info-800',
    textColor: 'text-info-800 dark:text-info-200',
    iconColor: 'text-info-600 dark:text-info-400'
  }
}

// Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const type = TOAST_TYPES[toast.type] || TOAST_TYPES.info

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto remove
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${type.bgColor} ${type.borderColor} ${type.textColor}
        max-w-sm w-full pointer-events-auto
      `}>
        <div className={`text-lg ${type.iconColor} flex-shrink-0 mt-0.5`}>
          {type.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className="font-semibold text-sm mb-1">
              {toast.title}
            </div>
          )}
          <div className="text-sm leading-relaxed">
            {toast.message}
          </div>
        </div>

        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            hover:bg-black/5 dark:hover:bg-white/5
            ${type.textColor}
          `}
          aria-label="Đóng thông báo"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  // Helper methods
  const showSuccess = (message, options = {}) => {
    return addToast({ type: 'success', message, ...options })
  }

  const showError = (message, options = {}) => {
    return addToast({ type: 'error', message, duration: 7000, ...options })
  }

  const showWarning = (message, options = {}) => {
    return addToast({ type: 'warning', message, duration: 6000, ...options })
  }

  const showInfo = (message, options = {}) => {
    return addToast({ type: 'info', message, ...options })
  }

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hook for common patterns
export const useNotification = () => {
  const toast = useToast()

  const notifySuccess = (message) => toast.showSuccess(message)
  const notifyError = (message) => toast.showError(message)
  const notifyWarning = (message) => toast.showWarning(message)
  const notifyInfo = (message) => toast.showInfo(message)

  const notifyApiError = (error) => {
    const message = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi không xác định'
    toast.showError(message)
  }

  const notifyFormValidation = (errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(error => toast.showError(error))
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(error => toast.showError(error))
    } else {
      toast.showError(errors)
    }
  }

  return {
    notifySuccess,
    notifyError, 
    notifyWarning,
    notifyInfo,
    notifyApiError,
    notifyFormValidation
  }
}

export default ToastProvider