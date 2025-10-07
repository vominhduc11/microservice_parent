import { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { ordersAPI, productsAPI, dealerAPI, handleAPIError } from '../services/api'
import { LoadingSpinner } from './LoadingStates'

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [orderDetail, setOrderDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [productInfoCache, setProductInfoCache] = useState({})
  const [dealerInfo, setDealerInfo] = useState(null)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadge = (paymentStatus) => {
    const statusConfig = {
      UNPAID: { label: 'Chưa thanh toán', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' },
      PAID: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' }
    }

    const config = statusConfig[paymentStatus] || statusConfig.UNPAID
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const fetchProductInfo = async (productId) => {
    if (productInfoCache[productId]) {
      return productInfoCache[productId]
    }

    try {
      const response = await productsAPI.getBasicInfo(productId, 'name,image,sku')
      const productInfo = response.data || response

      // Parse image JSON string to get imageUrl
      let imageUrl = null
      if (productInfo.image) {
        try {
          const imageData = JSON.parse(productInfo.image)
          imageUrl = imageData.imageUrl
        } catch {
          // If not JSON, use as direct URL
          imageUrl = productInfo.image
        }
      }

      const processedInfo = {
        name: productInfo.name,
        sku: productInfo.sku,
        image: imageUrl
      }

      setProductInfoCache(prev => ({
        ...prev,
        [productId]: processedInfo
      }))
      return processedInfo
    } catch (error) {
      console.error(`Failed to fetch product info for ID ${productId}:`, error)
      return { name: `Sản phẩm ${productId}`, image: null, sku: '' }
    }
  }

  const fetchDealerInfo = async (dealerId) => {
    try {
      const response = await dealerAPI.getById(dealerId, 'companyName')
      if (response.success && response.data) {
        setDealerInfo(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch dealer info:', error)
    }
  }

  const fetchOrderDetail = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      setError(null)

      const response = await ordersAPI.getById(orderId)

      if (response.success && response.data) {
        setOrderDetail(response.data)

        // Fetch dealer info
        if (response.data.idDealer) {
          fetchDealerInfo(response.data.idDealer)
        }

        // Fetch product info for all order items
        if (response.data.orderItems && response.data.orderItems.length > 0) {
          for (const item of response.data.orderItems) {
            if (item.idProduct && !productInfoCache[item.idProduct]) {
              fetchProductInfo(item.idProduct).catch(err =>
                console.error(`Failed to fetch product ${item.idProduct}:`, err)
              )
            }
          }
        }
      } else {
        setError('Không thể tải chi tiết đơn hàng')
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error)
      setError('Không thể tải chi tiết đơn hàng')
      handleAPIError(error, false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail()
    }
  }, [isOpen, orderId])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current overflow styles
      const originalBodyOverflow = window.getComputedStyle(document.body).overflow
      const originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow

      // Disable scroll for both html and body
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      // Cleanup function to restore original overflow
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [isOpen])

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },
    content: {
      position: 'relative',
      inset: 'auto',
      border: 'none',
      background: 'transparent',
      overflow: 'visible',
      borderRadius: 0,
      outline: 'none',
      padding: 0,
      maxWidth: '56rem',
      width: '100%',
      maxHeight: '90vh'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      ariaHideApp={true}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chi tiết đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button
                onClick={fetchOrderDetail}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : orderDetail ? (
            <div className="p-6 space-y-6">

              {/* Order Info */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        #{orderDetail.orderCode}
                      </h3>
                      {getStatusBadge(orderDetail.paymentStatus)}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Ngày đặt:</span>
                        <span>{formatDate(orderDetail.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🏢 Công ty:</span>
                        <span>{dealerInfo?.companyName || 'Đang tải...'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Tổng tiền
                    </div>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(orderDetail.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  📦 Sản phẩm đã đặt ({orderDetail.orderItems?.length || 0} sản phẩm)
                </h4>

                <div className="space-y-3">
                  {orderDetail.orderItems?.map((item) => {
                    const productInfo = productInfoCache[item.idProduct]
                    return (
                      <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                        <div className="flex items-center gap-4">

                          {/* Product Image */}
                          {productInfo?.image ? (
                            <img
                              src={productInfo.image}
                              alt={productInfo.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 dark:text-white">
                              {productInfo?.name || `Sản phẩm ${item.idProduct}`}
                            </h5>
                            {productInfo?.sku && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                SKU: {productInfo.sku}
                              </p>
                            )}
                          </div>

                          {/* Quantity & Price */}
                          <div className="text-right">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Số lượng: <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Đơn giá: <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                            </div>
                            <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {formatPrice(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  📊 Tóm tắt đơn hàng
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Tổng số sản phẩm:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {orderDetail.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Số loại sản phẩm:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {orderDetail.orderItems?.length || 0}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-slate-900 dark:text-white">Tổng cộng:</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {formatPrice(orderDetail.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default OrderDetailModal