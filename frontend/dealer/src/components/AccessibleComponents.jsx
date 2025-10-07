import React, { useRef, useEffect, useState } from 'react'
import { focusManager, keyboardNavigation, aria, screenReader } from '../utils/accessibility'

// Accessible Button Component
export const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}) => {
  const buttonRef = useRef(null)

  const handleKeyDown = (event) => {
    keyboardNavigation.handleActivation(event, onClick)
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500 disabled:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </button>
  )
}

// Accessible Modal Component
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeOnEscape = true,
  closeOnOverlay = true
}) => {
  const modalRef = useRef(null)
  const titleId = useRef(aria.generateId('modal-title'))
  const descriptionId = useRef(aria.generateId('modal-description'))

  useEffect(() => {
    if (isOpen) {
      focusManager.saveFocus()
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          focusManager.focusFirst(modalRef.current)
        }
      }, 100)

      // Announce modal opening
      screenReader.announce(`Đã mở hộp thoại: ${title}`)
    } else {
      focusManager.restoreFocus()
    }

    return () => {
      if (isOpen) {
        focusManager.restoreFocus()
      }
    }
  }, [isOpen, title])

  const handleKeyDown = (event) => {
    if (closeOnEscape) {
      keyboardNavigation.handleEscape(event, onClose)
    }
    
    // Trap focus within modal
    if (modalRef.current) {
      focusManager.trapFocus(modalRef.current, event)
    }
  }

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      aria-describedby={descriptionId.current}
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2
              id={titleId.current}
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h2>
            <AccessibleButton
              onClick={onClose}
              variant="secondary"
              size="sm"
              ariaLabel="Đóng hộp thoại"
              className="!p-2"
            >
              <span aria-hidden="true">×</span>
            </AccessibleButton>
          </div>
          
          {/* Content */}
          <div id={descriptionId.current} className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Accessible Form Field Component
export const AccessibleFormField = ({
  label,
  children,
  error,
  hint,
  required = false,
  className = ''
}) => {
  const fieldId = useRef(aria.generateId('field'))
  const errorId = useRef(aria.generateId('error'))
  const hintId = useRef(aria.generateId('hint'))

  const describedBy = [
    hint ? hintId.current : null,
    error ? errorId.current : null
  ].filter(Boolean).join(' ')

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={fieldId.current}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="bắt buộc">
            *
          </span>
        )}
      </label>
      
      {hint && (
        <p
          id={hintId.current}
          className="text-sm text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      )}
      
      {React.cloneElement(children, {
        id: fieldId.current,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required
      })}
      
      {error && (
        <p
          id={errorId.current}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible Dropdown/Select Component
export const AccessibleDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const listboxId = useRef(aria.generateId('listbox'))

  const selectedOption = options.find(option => option.value === value)

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setFocusedIndex(-1)
    }
  }

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
    screenReader.announce(`Đã chọn ${option.label}`)
  }

  const handleKeyDown = (event) => {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex])
        } else {
          handleToggle()
        }
        break
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
        }
        break
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          keyboardNavigation.handleArrowKeys(
            event,
            options,
            focusedIndex,
            setFocusedIndex
          )
        }
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        className={`w-full px-4 py-2 text-left bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={listboxId.current}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </span>
      </button>

      {isOpen && (
        <ul
          id={listboxId.current}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-label="Danh sách tùy chọn"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 ${
                index === focusedIndex ? 'bg-slate-100 dark:bg-slate-600' : ''
              } ${
                option.value === value ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
              }`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Accessible Toast/Alert Component
export const AccessibleAlert = ({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const alertRef = useRef(null)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  useEffect(() => {
    // Announce alert to screen readers
    screenReader.announce(`${title}: ${message}`, type === 'error' ? 'assertive' : 'polite')
  }, [title, message, type])

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div
      ref={alertRef}
      className={`border rounded-lg p-4 ${typeStyles[type]}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start">
        <span className="text-xl mr-3" aria-hidden="true">
          {icons[type]}
        </span>
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {onClose && (
          <AccessibleButton
            onClick={onClose}
            variant="secondary"
            size="sm"
            ariaLabel="Đóng thông báo"
            className="!p-1 ml-2"
          >
            <span aria-hidden="true">×</span>
          </AccessibleButton>
        )}
      </div>
    </div>
  )
}

// Skip Link Component
export const SkipLink = ({ href = '#main-content', children = 'Chuyển đến nội dung chính' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded-lg z-50 font-medium"
    >
      {children}
    </a>
  )
}
