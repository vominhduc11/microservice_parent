import { useState } from 'react'
import PropTypes from 'prop-types'
import ProductDetailHeader from './ProductDetailHeader'
import TierSelector from './TierSelector'
import ProductDetailTabs from './ProductDetailTabs'
import NotificationToast from './NotificationToast'

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({ message: '', quantity: 0 })

  if (!product) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <div className="error-message">
          <p>Không tìm thấy thông tin sản phẩm</p>
          <button className="btn btn-primary" onClick={onBack}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const handleAddToCart = async (product, quantity, unitPrice) => {
    try {
      await onAddToCart(product, quantity, unitPrice)
      setNotificationData({
        message: 'Đã thêm vào giỏ hàng!',
        quantity
      })
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setNotificationData({
        message: 'Có lỗi xảy ra khi thêm vào giỏ hàng',
        quantity: 0
      })
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    }
  }

  return (
    <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-8 max-w-6xl mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <ProductDetailHeader product={product} onBack={onBack} />
          <TierSelector product={product} onAddToCart={handleAddToCart} />
        </div>
      </div>

      {/* Product Details Tabs */}
      <ProductDetailTabs product={product} />

      {/* Notification Toast */}
      <NotificationToast
        show={showNotification}
        message={notificationData.message}
        quantity={notificationData.quantity}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}

ProductDetail.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.number.isRequired,
    sku: PropTypes.string,
    warranty: PropTypes.number,
    stock: PropTypes.number,
    wholesalePrice: PropTypes.arrayOf(PropTypes.shape({
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired
    })),
    specifications: PropTypes.object,
    descriptions: PropTypes.array,
    videos: PropTypes.array
  }),
  onBack: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired
}

export default ProductDetail