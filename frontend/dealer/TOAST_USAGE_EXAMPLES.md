# Toast Notification System - Usage Examples

This document provides examples of how to use the toast notification system in the Dealer Frontend application.

## Table of Contents
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Dark Mode Support](#dark-mode-support)
- [Best Practices](#best-practices)

---

## Installation

The toast system is already configured in `App.jsx` and ready to use throughout the application.

```jsx
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showPromise,
  showAPIError,
  showNetworkError,
  showValidationErrors
} from '../utils/toast'
```

---

## Basic Usage

### Success Toast

Use for successful operations:

```jsx
import { showSuccess } from '../utils/toast'

const handleSave = () => {
  // Save data...
  showSuccess('Lưu thành công!')
}

// With custom duration
showSuccess('Đã thêm vào giỏ hàng!', { duration: 3000 })
```

### Error Toast

Use for error messages:

```jsx
import { showError } from '../utils/toast'

const handleDelete = () => {
  try {
    // Delete operation
  } catch (error) {
    showError('Không thể xóa mục này!')
  }
}

// Error stays longer (5 seconds by default)
showError('Có lỗi xảy ra khi xử lý yêu cầu')
```

### Warning Toast

Use for warnings:

```jsx
import { showWarning } from '../utils/toast'

const handleCheckout = () => {
  if (cartItems.length === 0) {
    showWarning('Giỏ hàng trống! Vui lòng thêm sản phẩm.')
    return
  }
  // Proceed with checkout
}
```

### Info Toast

Use for informational messages:

```jsx
import { showInfo } from '../utils/toast'

const handleView = () => {
  showInfo('Đang tải dữ liệu sản phẩm...')
}
```

---

## Advanced Usage

### Loading Toast

Show loading state and update when complete:

```jsx
import { showLoading, dismissToast, showSuccess } from '../utils/toast'

const handleUpload = async () => {
  const toastId = showLoading('Đang tải file lên...')

  try {
    await uploadFile(file)
    dismissToast(toastId)
    showSuccess('Tải file lên thành công!')
  } catch (error) {
    dismissToast(toastId)
    showError('Tải file lên thất bại!')
  }
}
```

### Promise Toast

Automatically handle loading, success, and error states:

```jsx
import { showPromise } from '../utils/toast'

const handleSubmitOrder = async () => {
  const orderPromise = submitOrder(orderData)

  showPromise(orderPromise, {
    loading: 'Đang xử lý đơn hàng...',
    success: 'Đặt hàng thành công! Mã đơn: #12345',
    error: 'Đặt hàng thất bại. Vui lòng thử lại.'
  })
}
```

### API Error Toast

Automatically format and display API errors:

```jsx
import { showAPIError } from '../utils/toast'
import { productAPI } from '../services/api'

const fetchProducts = async () => {
  try {
    const response = await productAPI.getProducts()
    return response.data
  } catch (error) {
    // Automatically extracts error message from API response
    showAPIError(error, 'Không thể tải danh sách sản phẩm')
  }
}
```

### Network Error Toast

Show network connectivity errors:

```jsx
import { showNetworkError } from '../utils/toast'

window.addEventListener('offline', () => {
  showNetworkError()
})
```

### Validation Errors

Display multiple validation errors:

```jsx
import { showValidationErrors } from '../utils/toast'

const handleFormSubmit = (formData) => {
  const errors = validateForm(formData)

  if (errors.length > 0) {
    // Array of errors
    showValidationErrors(errors)
    return
  }

  // Or object of errors
  const errorObj = {
    email: 'Email không hợp lệ',
    password: 'Mật khẩu phải có ít nhất 8 ký tự'
  }
  showValidationErrors(errorObj)
}
```

---

## Custom Toast Options

### Custom Duration

```jsx
showSuccess('Thông báo ngắn', { duration: 2000 }) // 2 seconds
showError('Thông báo dài', { duration: 8000 })   // 8 seconds
```

### Custom Position

```jsx
showInfo('Thông báo ở giữa màn hình', {
  position: 'top-center'
})

// Available positions:
// 'top-left', 'top-center', 'top-right'
// 'bottom-left', 'bottom-center', 'bottom-right'
```

### Custom Styling

```jsx
showSuccess('Thông báo tùy chỉnh', {
  style: {
    background: '#4ade80',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
  }
})
```

### Custom Icon

```jsx
import { toast } from '../utils/toast'

toast('Thông báo tùy chỉnh', {
  icon: '🎉',
  duration: 4000
})
```

---

## Dark Mode Support

The toast system automatically adapts to dark mode using CSS variables:

```css
/* Light mode (default) */
--toast-bg: #ffffff;
--toast-text: #363636;
--toast-success-bg: #ecfdf5;
--toast-success-text: #065f46;
--toast-error-bg: #fef2f2;
--toast-error-text: #991b1b;

/* Dark mode */
--toast-bg: #1e293b;
--toast-text: #f1f5f9;
--toast-success-bg: #064e3b;
--toast-success-text: #d1fae5;
--toast-error-bg: #7f1d1d;
--toast-error-text: #fecaca;
```

---

## Best Practices

### ✅ Do's

1. **Use appropriate toast types**
   ```jsx
   // Good - Clear intent
   showSuccess('Sản phẩm đã được thêm vào giỏ hàng')
   showError('Không thể xóa sản phẩm')
   showWarning('Bạn có chắc muốn tiếp tục?')
   ```

2. **Keep messages concise**
   ```jsx
   // Good - Short and clear
   showSuccess('Lưu thành công!')

   // Avoid - Too verbose
   showSuccess('Thông tin sản phẩm của bạn đã được lưu thành công vào cơ sở dữ liệu và bạn có thể tiếp tục thêm sản phẩm mới hoặc quay lại trang danh sách.')
   ```

3. **Use Vietnamese messages**
   ```jsx
   // Good - Vietnamese for user-facing messages
   showError('Không tìm thấy sản phẩm')

   // Avoid - English for UI messages
   showError('Product not found')
   ```

4. **Provide actionable feedback**
   ```jsx
   // Good - Tells user what to do
   showError('Email không hợp lệ. Vui lòng kiểm tra lại.')

   // Avoid - Vague error
   showError('Lỗi!')
   ```

5. **Use showPromise for async operations**
   ```jsx
   // Good - Automatic state handling
   showPromise(saveData(), {
     loading: 'Đang lưu...',
     success: 'Đã lưu!',
     error: 'Lưu thất bại'
   })
   ```

### ❌ Don'ts

1. **Don't spam toasts**
   ```jsx
   // Bad - Too many toasts
   items.forEach(item => {
     showSuccess(`Đã thêm ${item.name}`) // Creates 10 toasts!
   })

   // Good - Single summary toast
   showSuccess(`Đã thêm ${items.length} sản phẩm vào giỏ hàng`)
   ```

2. **Don't use toasts for critical errors**
   ```jsx
   // Bad - User might miss it
   showError('Tài khoản bị khóa')

   // Good - Use modal or dedicated error page
   navigate('/account-locked')
   ```

3. **Don't override default durations unnecessarily**
   ```jsx
   // Bad - Error disappears too fast
   showError('Lỗi quan trọng', { duration: 1000 })

   // Good - Use default 5 seconds for errors
   showError('Lỗi quan trọng')
   ```

4. **Don't use toast for every action**
   ```jsx
   // Bad - Too noisy
   showInfo('Bạn đã click vào nút này')
   showInfo('Bạn đang di chuyển chuột')

   // Good - Only for meaningful actions
   showSuccess('Đơn hàng đã được đặt')
   ```

---

## Real-World Examples

### Example 1: Add to Cart

```jsx
import { showSuccess, showError } from '../utils/toast'

const handleAddToCart = async (product) => {
  try {
    await cartAPI.addItem(product.id, quantity)
    showSuccess(`Đã thêm ${product.name} vào giỏ hàng`)
  } catch (error) {
    showAPIError(error, 'Không thể thêm sản phẩm vào giỏ hàng')
  }
}
```

### Example 2: Form Submission

```jsx
import { showPromise } from '../utils/toast'

const handleSubmit = async (formData) => {
  const submitPromise = api.submitForm(formData)

  await showPromise(submitPromise, {
    loading: 'Đang gửi thông tin...',
    success: 'Đã gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.',
    error: 'Gửi thất bại. Vui lòng thử lại sau.'
  })

  navigate('/thank-you')
}
```

### Example 3: Delete Confirmation

```jsx
import { showSuccess, showError, showWarning } from '../utils/toast'

const handleDelete = async (itemId) => {
  const confirmDelete = window.confirm('Bạn có chắc muốn xóa?')

  if (!confirmDelete) {
    showWarning('Đã hủy thao tác xóa')
    return
  }

  try {
    await api.deleteItem(itemId)
    showSuccess('Đã xóa thành công!')
  } catch (error) {
    showAPIError(error, 'Không thể xóa mục này')
  }
}
```

### Example 4: File Upload with Progress

```jsx
import { showLoading, dismissToast, showSuccess, showError } from '../utils/toast'

const handleFileUpload = async (file) => {
  const toastId = showLoading('Đang tải file lên...')

  try {
    await uploadFile(file)
    dismissToast(toastId)
    showSuccess('Tải file lên thành công!')
  } catch (error) {
    dismissToast(toastId)

    if (error.code === 'FILE_TOO_LARGE') {
      showError('File quá lớn! Kích thước tối đa là 10MB.')
    } else {
      showAPIError(error, 'Tải file lên thất bại')
    }
  }
}
```

---

## Accessibility

The toast system is accessible by default:

- ✅ Keyboard navigable
- ✅ Screen reader compatible
- ✅ Respects `prefers-reduced-motion`
- ✅ High contrast mode support
- ✅ ARIA labels included

---

## Troubleshooting

### Toast not showing?

1. Check `App.jsx` has `<Toaster />` component
2. Verify toast utility is imported correctly
3. Check browser console for errors

### Toast appearing in wrong position?

Update position in `App.jsx`:

```jsx
<Toaster position="top-center" /> // Change position here
```

### Dark mode colors not working?

Ensure CSS variables are defined in `index.css`:

```css
:root { /* Light mode variables */ }
.dark { /* Dark mode variables */ }
```

---

## API Reference

### Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `showSuccess(message, options)` | Show success toast | `message: string, options?: object` |
| `showError(message, options)` | Show error toast | `message: string, options?: object` |
| `showWarning(message, options)` | Show warning toast | `message: string, options?: object` |
| `showInfo(message, options)` | Show info toast | `message: string, options?: object` |
| `showLoading(message, options)` | Show loading toast | `message: string, options?: object` |
| `showPromise(promise, messages, options)` | Show promise toast | `promise: Promise, messages: object, options?: object` |
| `showAPIError(error, fallback)` | Show API error toast | `error: Error, fallback?: string` |
| `showNetworkError()` | Show network error toast | None |
| `showValidationErrors(errors)` | Show validation errors | `errors: array \| object` |
| `dismissToast(toastId)` | Dismiss specific toast | `toastId: string` |
| `dismissAll()` | Dismiss all toasts | None |

---

## Support

For questions or issues, please check the documentation or contact the development team.

**Happy Toasting! 🎉**
