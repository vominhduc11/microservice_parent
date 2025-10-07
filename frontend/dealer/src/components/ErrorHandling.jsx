import React from 'react'

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      )
    }

    return this.props.children
  }
}

// Error Fallback UI
export const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Oops! Có lỗi xảy ra
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-slate-500 mb-2">
            Chi tiết lỗi (Development)
          </summary>
          <pre className="text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}
      
      <div className="flex gap-3 justify-center">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          🔄 Thử lại
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          🔃 Tải lại trang
        </button>
      </div>
    </div>
  </div>
)

// Network Error Component
export const NetworkError = ({ onRetry, message = 'Không thể kết nối mạng' }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📡</div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
      Lỗi kết nối
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
    >
      🔄 Thử lại
    </button>
  </div>
)

// Empty State Component
export const EmptyState = ({ 
  icon = '📭', 
  title = 'Không có dữ liệu', 
  description = 'Chưa có thông tin để hiển thị',
  action = null 
}) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
      {title}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>
    {action}
  </div>
)

// Toast Notification System
export const Toast = ({ type = 'info', message, onClose, duration = 5000 }) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration]) // Remove onClose from dependencies

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-right ${typeStyles[type]}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Toast Context for global toast management
export const ToastContext = React.createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((type, message, duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message, duration }])
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = React.useCallback((message, duration) => addToast('success', message, duration), [addToast])
  const showError = React.useCallback((message, duration) => addToast('error', message, duration), [addToast])
  const showWarning = React.useCallback((message, duration) => addToast('warning', message, duration), [addToast])
  const showInfo = React.useCallback((message, duration) => addToast('info', message, duration), [addToast])

  const contextValue = React.useMemo(() => ({
    showSuccess,
    showError,
    showWarning,
    showInfo
  }), [showSuccess, showError, showWarning, showInfo])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => {
          const handleClose = () => removeToast(toast.id)
          
          return (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={handleClose}
            />
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Retry Hook for failed operations
export const useRetry = (fn, maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const retry = React.useCallback(async () => {
    if (retryCount >= maxRetries) return

    setLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, delay * retryCount))
      await fn()
      setRetryCount(0)
    } catch (err) {
      setError(err)
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [fn, maxRetries, delay, retryCount])

  return { retry, retryCount, maxRetries, loading, error }
}
