/**
 * Toast Notification Utilities
 * Centralized toast notification system using react-hot-toast
 */

import toast from 'react-hot-toast';

/**
 * Toast configuration defaults
 */
const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'var(--toast-bg)',
    color: 'var(--toast-text)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    maxWidth: '500px',
  },
};

/**
 * Success toast notification
 * @param {string} message - The success message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    icon: '✅',
    style: {
      ...defaultOptions.style,
      ...options.style,
    },
  });
};

/**
 * Error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    duration: 5000, // Errors stay longer
    ...options,
    icon: '❌',
    style: {
      ...defaultOptions.style,
      ...options.style,
    },
  });
};

/**
 * Warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: '⚠️',
    style: {
      ...defaultOptions.style,
      background: '#fef3c7',
      color: '#92400e',
      ...options.style,
    },
  });
};

/**
 * Info toast notification
 * @param {string} message - The info message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: 'ℹ️',
    style: {
      ...defaultOptions.style,
      background: '#dbeafe',
      color: '#1e40af',
      ...options.style,
    },
  });
};

/**
 * Loading toast notification
 * @param {string} message - The loading message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Promise toast notification
 * Automatically shows loading, success, or error based on promise state
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Messages for each state (loading, success, error)
 * @param {object} options - Additional toast options
 * @returns {Promise} The original promise
 */
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra!',
    },
    {
      ...defaultOptions,
      ...options,
    }
  );
};

/**
 * Custom toast notification with full control
 * @param {string} message - The message to display
 * @param {object} options - Toast options
 * @returns {string} Toast ID
 */
export const showCustom = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
  toast.dismiss();
};

/**
 * Update an existing toast
 * @param {string} toastId - The ID of the toast to update
 * @param {object} options - New toast options
 */
export const updateToast = (toastId, options) => {
  toast.dismiss(toastId);
  return toast(options.message, options);
};

/**
 * API Error toast handler
 * Automatically formats API errors for display
 * @param {Error} error - The error object from API
 * @param {string} fallbackMessage - Fallback message if error has no message
 */
export const showAPIError = (error, fallbackMessage = 'Có lỗi xảy ra khi kết nối tới máy chủ') => {
  let errorMessage = fallbackMessage;

  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return showError(errorMessage);
};

/**
 * Network error toast handler
 */
export const showNetworkError = () => {
  return showError('Không có kết nối mạng. Vui lòng kiểm tra kết nối Internet của bạn.', {
    duration: 6000,
  });
};

/**
 * Validation error toast handler
 * @param {object|array} errors - Validation errors object or array
 */
export const showValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach((error) => showError(error));
  } else if (typeof errors === 'object') {
    Object.values(errors).forEach((error) => showError(error));
  } else {
    showError(errors);
  }
};

// Export toast instance for advanced usage
export { toast };
