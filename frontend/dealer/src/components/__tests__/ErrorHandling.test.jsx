import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { 
  ErrorFallback, 
  NetworkError, 
  EmptyState, 
  Toast,
  ToastProvider,
  useToast 
} from '../ErrorHandling'

describe('ErrorHandling Components', () => {
  describe('ErrorFallback', () => {
    const mockError = new Error('Test error')
    const mockResetError = vi.fn()

    beforeEach(() => {
      mockResetError.mockClear()
    })

    it('renders error message', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />)
      
      expect(screen.getByText('Oops! Có lỗi xảy ra')).toBeInTheDocument()
    })

    it('calls resetError when retry button is clicked', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />)
      
      fireEvent.click(screen.getByText('🔄 Thử lại'))
      expect(mockResetError).toHaveBeenCalledTimes(1)
    })

    it('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      render(<ErrorFallback error={mockError} resetError={mockResetError} />)
      
      expect(screen.getByText('Chi tiết lỗi (Development)')).toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })

    it('reloads page when reload button is clicked', () => {
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })
      
      render(<ErrorFallback error={mockError} resetError={mockResetError} />)
      
      fireEvent.click(screen.getByText('🔃 Tải lại trang'))
      expect(mockReload).toHaveBeenCalledTimes(1)
    })
  })

  describe('NetworkError', () => {
    const mockOnRetry = vi.fn()

    beforeEach(() => {
      mockOnRetry.mockClear()
    })

    it('renders default error message', () => {
      render(<NetworkError onRetry={mockOnRetry} />)
      
      expect(screen.getByText('Không thể kết nối mạng')).toBeInTheDocument()
    })

    it('renders custom error message', () => {
      const customMessage = 'Custom network error'
      render(<NetworkError onRetry={mockOnRetry} message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      render(<NetworkError onRetry={mockOnRetry} />)
      
      fireEvent.click(screen.getByText('🔄 Thử lại'))
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('EmptyState', () => {
    it('renders with default props', () => {
      render(<EmptyState />)
      
      expect(screen.getByText('📭')).toBeInTheDocument()
      expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
      expect(screen.getByText('Chưa có thông tin để hiển thị')).toBeInTheDocument()
    })

    it('renders with custom props', () => {
      const action = <button>Custom Action</button>
      render(
        <EmptyState 
          icon="🔍"
          title="Custom Title"
          description="Custom Description"
          action={action}
        />
      )
      
      expect(screen.getByText('🔍')).toBeInTheDocument()
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom Description')).toBeInTheDocument()
      expect(screen.getByText('Custom Action')).toBeInTheDocument()
    })
  })

  describe('Toast', () => {
    const mockOnClose = vi.fn()

    beforeEach(() => {
      mockOnClose.mockClear()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('renders success toast', () => {
      render(<Toast type="success" message="Success message" onClose={mockOnClose} />)
      
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('renders error toast', () => {
      render(<Toast type="error" message="Error message" onClose={mockOnClose} />)
      
      expect(screen.getByText('❌')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      render(<Toast type="info" message="Test message" onClose={mockOnClose} />)
      
      fireEvent.click(screen.getByText('×'))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('auto-closes after duration', () => {
      render(<Toast type="info" message="Test message" onClose={mockOnClose} duration={1000} />)
      
      vi.advanceTimersByTime(1000)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('ToastProvider and useToast', () => {
    const TestComponent = () => {
      const { showSuccess, showError } = useToast()
      
      return (
        <div>
          <button onClick={() => showSuccess('Success!')}>Show Success</button>
          <button onClick={() => showError('Error!')}>Show Error</button>
        </div>
      )
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('provides toast functions', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success!')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Show Error'))
      expect(screen.getByText('Error!')).toBeInTheDocument()
    })

    it('removes toasts after duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByText('Show Success'))
      expect(screen.getByText('Success!')).toBeInTheDocument()
      
      vi.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(screen.queryByText('Success!')).not.toBeInTheDocument()
      })
    })
  })
})
