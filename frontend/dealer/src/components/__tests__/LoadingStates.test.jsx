import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { 
  SkeletonCard, 
  LoadingSpinner, 
  PageLoading, 
  LoadingButton,
  LazyImage 
} from '../LoadingStates'

describe('LoadingStates Components', () => {
  describe('SkeletonCard', () => {
    it('renders skeleton card with proper structure', () => {
      render(<SkeletonCard />)
      
      const card = screen.getByRole('generic')
      expect(card).toHaveClass('animate-pulse')
    })
  })

  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByRole('generic')
      expect(spinner).toHaveClass('w-6', 'h-6', 'animate-spin')
    })

    it('renders with custom size', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = screen.getByRole('generic')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('includes accessibility text', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('PageLoading', () => {
    it('renders with default message', () => {
      render(<PageLoading />)
      
      expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      const customMessage = 'Custom loading message'
      render(<PageLoading message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('has proper overlay styling', () => {
      render(<PageLoading />)
      
      const overlay = screen.getByText('Đang tải...').closest('div')
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50')
    })
  })

  describe('LoadingButton', () => {
    it('renders children when not loading', () => {
      render(<LoadingButton>Click me</LoadingButton>)
      
      expect(screen.getByText('Click me')).toBeVisible()
    })

    it('shows loading state when loading', () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>)
      
      expect(screen.getByText('Đang xử lý...')).toBeInTheDocument()
      expect(screen.getByText('Click me')).not.toBeVisible()
    })

    it('is disabled when loading', () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('calls onClick when not loading', () => {
      const handleClick = vi.fn()
      render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<LoadingButton loading={true} onClick={handleClick}>Click me</LoadingButton>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('LazyImage', () => {
    it('shows placeholder while loading', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />)
      
      expect(screen.getByText('📷')).toBeInTheDocument()
    })

    it('shows custom placeholder', () => {
      const customPlaceholder = <div>Custom placeholder</div>
      render(<LazyImage src="test.jpg" alt="Test image" placeholder={customPlaceholder} />)
      
      expect(screen.getByText('Custom placeholder')).toBeInTheDocument()
    })

    it('shows error state when image fails to load', async () => {
      render(<LazyImage src="invalid.jpg" alt="Test image" />)
      
      const img = screen.getByRole('img', { hidden: true })
      fireEvent.error(img)
      
      await waitFor(() => {
        expect(screen.getByText('Không thể tải ảnh')).toBeInTheDocument()
      })
    })

    it('hides loading state when image loads successfully', async () => {
      render(<LazyImage src="test.jpg" alt="Test image" />)
      
      const img = screen.getByRole('img', { hidden: true })
      fireEvent.load(img)
      
      await waitFor(() => {
        expect(screen.queryByText('📷')).not.toBeInTheDocument()
      })
    })
  })
})
