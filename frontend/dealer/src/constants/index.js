// Application Constants

// UI Constants
export const UI_CONSTANTS = {
  NOTIFICATION_TIMEOUT: 3000,
  QUOTE_NOTIFICATION_TIMEOUT: 5000,
  LOADING_TIMEOUT: 30000,
  MAX_QUANTITY: 999999,
  DEFAULT_WARRANTY_MONTHS: 12
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080'),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: {
    AUTH: '/api/auth',
    PRODUCTS: '/api/product/products',
    ORDERS: '/api/order/orders',
    CART: '/api/cart',
    WARRANTY: '/api/warranty',
    DEALER: '/api/dealer',
    CUSTOMERS: '/api/admin/customers'
  }
}

// Product Serial Status
export const SERIAL_STATUS = {
  IN_STOCK: 'IN_STOCK',
  ALLOCATED_TO_DEALER: 'ALLOCATED_TO_DEALER',
  SOLD: 'SOLD',
  RETURNED: 'RETURNED',
  DAMAGED: 'DAMAGED'
}

// Error Messages (Vietnamese)
export const ERROR_MESSAGES = {
  NETWORK: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  AUTH: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTHORIZATION: 'Bạn không có quyền thực hiện tác vụ này.',
  VALIDATION: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  NOT_FOUND: 'Không tìm thấy tài nguyên được yêu cầu.',
  SERVER: 'Lỗi server. Vui lòng thử lại sau.',
  GENERIC: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  PRODUCT_NOT_FOUND: 'Không tìm thấy thông tin sản phẩm',
  CART_ADD_FAILED: 'Failed to add to cart'
}

// Success Messages (Vietnamese)
export const SUCCESS_MESSAGES = {
  CART_ADDED: 'Đã thêm vào giỏ hàng!',
  QUOTE_SENT: 'Yêu cầu báo giá đã được gửi!',
  WARRANTY_REGISTERED: 'Bảo hành đã được đăng ký thành công!'
}

// Form Field Names
export const FORM_FIELDS = {
  CUSTOMER_NAME: 'customerName',
  CUSTOMER_PHONE: 'customerPhone',
  CUSTOMER_EMAIL: 'customerEmail',
  CUSTOMER_ADDRESS: 'customerAddress',
  PRODUCT_ID: 'productId',
  PURCHASE_DATE: 'purchaseDate',
  SERIAL_NUMBERS: 'serialNumbers',
  COMPANY_NAME: 'companyName',
  CONTACT_NAME: 'contactName',
  EMAIL: 'email',
  PHONE: 'phone',
  MESSAGE: 'message'
}

// Tab Names
export const TAB_NAMES = {
  DESCRIPTION: 'description',
  SPECS: 'specs',
  VIDEOS: 'videos',
  WARRANTY: 'warranty'
}

// Component CSS Classes (for consistency)
export const CSS_CLASSES = {
  PRIMARY_BUTTON: 'bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors',
  SECONDARY_BUTTON: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
  INPUT_FIELD: 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
  CARD: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg',
  NOTIFICATION: 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  DEALER_LOGIN: 'dealerLogin',
  CUSTOMER_INFO: 'customerInfo',
  CART_DATA: 'cartData'
}

// Default Values
export const DEFAULTS = {
  QUANTITY: 1,
  WARRANTY_MONTHS: 12,
  RETRY_DELAY: 1000,
  PAGINATION_LIMIT: 20
}