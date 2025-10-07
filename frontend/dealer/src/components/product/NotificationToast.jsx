import { SUCCESS_MESSAGES } from '../../constants'

const NotificationToast = ({
  show,
  quantity
}) => {
  if (!show) return null

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium">{SUCCESS_MESSAGES.CART_ADDED}</h4>
          <p className="text-sm opacity-90">{quantity} sản phẩm đã được thêm.</p>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast