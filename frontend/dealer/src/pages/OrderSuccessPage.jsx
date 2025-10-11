/**
 * @fileoverview Order success page displaying order confirmation and details
 * @module pages/OrderSuccessPage
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Order success page component showing order confirmation and next steps
 * @component
 * @returns {JSX.Element} Rendered order success page
 * @example
 * <OrderSuccessPage />
 */
const OrderSuccessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get order data from location state or generate mock data
  const orderData = location.state?.orderData || {
    orderId: `TZ${Date.now().toString().slice(-6)}`,
    totalAmount: 0,
    items: []
  }

  /**
   * Formats price value to Vietnamese currency format
   * @param {number} price - Price value to format
   * @returns {string} Formatted price string
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/products')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          🎉 Đặt hàng thành công!
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng và liên hệ với bạn sớm nhất có thể.
        </p>

        {/* Order Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            📋 Thông tin đơn hàng
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Mã đơn hàng:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">#{orderData.orderId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Tổng tiền:</span>
              <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                {formatPrice(orderData.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Trạng thái:</span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                Đang xử lý
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Thời gian đặt:</span>
              <span className="text-slate-900 dark:text-white">
                {new Date().toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📞 Bước tiếp theo
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận đơn hàng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Bạn sẽ nhận được email xác nhận với thông tin chi tiết</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Thời gian giao hàng dự kiến: 3-5 ngày làm việc</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            🛍️ Tiếp tục mua sắm
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            📦 Xem đơn hàng
          </button>
        </div>

        {/* Auto Redirect Notice */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
          Trang sẽ tự động chuyển về danh sách sản phẩm sau 10 giây...
        </p>
      </div>
    </div>
  )
}

export default OrderSuccessPage