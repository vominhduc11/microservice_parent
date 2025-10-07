import { useState, useEffect } from 'react'
import { ordersAPI, productsAPI, getDealerInfo, handleAPIError } from '../services/api'
import { LoadingSpinner } from '../components/LoadingStates'
import OrderDetailModal from '../components/OrderDetailModal'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [productInfoCache, setProductInfoCache] = useState({})
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const dealerInfo = getDealerInfo()

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
      minute: '2-digit'
    })
  }

  const getStatusBadge = (paymentStatus) => {
    const statusConfig = {
      UNPAID: { label: 'Chưa thanh toán', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' },
      PAID: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' },
      PENDING: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' }
    }

    const config = statusConfig[paymentStatus] || statusConfig.UNPAID
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  // Fetch product info for order items
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

  const fetchOrders = async (page = 1, status = 'all') => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        includeDeleted: true
      }

      // Add status filter to API params if not 'all'
      if (status !== 'all') {
        params.status = status
      }

      // Use specific dealer endpoint with server-side filtering
      const response = await ordersAPI.getByDealer(dealerInfo?.accountId, params)

      if (response.success && response.data) {
        setOrders(response.data)
        setTotalPages(Math.ceil(response.data.length / 10))
        setCurrentPage(page)

        // Fetch product info for all order items
        for (const order of response.data) {
          if (order.orderItems && order.orderItems.length > 0) {
            for (const item of order.orderItems) {
              if (item.idProduct && !productInfoCache[item.idProduct]) {
                // Don't await to avoid blocking UI
                fetchProductInfo(item.idProduct).catch(err =>
                  console.error(`Failed to fetch product ${item.idProduct}:`, err)
                )
              }
            }
          }
        }
      } else {
        setOrders([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setError('Không thể tải danh sách đơn hàng')
      handleAPIError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dealerInfo?.accountId) {
      fetchOrders(currentPage, statusFilter)
    }
  }, [dealerInfo?.accountId, currentPage, statusFilter])

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrderId(null)
  }

  if (loading) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20">
        <div className="max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20">
        <div className="max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={() => fetchOrders(currentPage, statusFilter)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20">
      <div className="max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            📦 Đơn hàng của tôi
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'UNPAID', label: 'Chưa thanh toán' },
              { value: 'PAID', label: 'Đã thanh toán' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              🛍️ Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        #{order.orderCode || order.id}
                      </h3>
                      {getStatusBadge(order.paymentStatus)}
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📅 Đặt ngày:</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>

                      {order.orderItems && order.orderItems.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>📦 Sản phẩm:</span>
                          <span>{order.orderItems.length} sản phẩm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                      {formatPrice(order.totalPrice)}
                    </div>
                    <button
                      onClick={() => handleViewDetail(order.id)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.orderItems.slice(0, 3).map((item, index) => {
                        const productInfo = productInfoCache[item.idProduct]
                        return (
                          <div key={item.id || index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            {productInfo?.image && (
                              <img
                                src={productInfo.image}
                                alt={productInfo.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {productInfo?.name || `Sản phẩm ${item.idProduct}`}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                SL: {item.quantity} × {formatPrice(item.unitPrice)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                Tổng: {formatPrice(item.subtotal)}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {order.orderItems.length > 3 && (
                        <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            +{order.orderItems.length - 3} sản phẩm khác
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          orderId={selectedOrderId}
        />
      </div>
    </div>
  )
}

export default OrdersPage