import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { LazyImage, LoadingButton } from './LoadingStates'
import { useNotification } from './ToastNotification'

const QuickViewModal = ({ product, isOpen, onClose, onViewDetails }) => {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart } = useCart()
  const { notifySuccess, notifyError } = useNotification()

  // Utility function to get image URL from JSON string or direct URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null

    // If it's already a URL string
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData
    }

    // If it's a JSON string, parse it
    if (typeof imageData === 'string' && imageData.startsWith('{')) {
      try {
        const parsed = JSON.parse(imageData)
        return parsed.imageUrl || null
      } catch (error) {
        console.warn('Failed to parse image JSON:', error)
        return null
      }
    }

    return null
  }

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
    }
  }, [isOpen, product])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addToCart(product, quantity)
      notifySuccess(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`)
      onClose()
    } catch {
      notifyError('Không thể thêm sản phẩm vào giỏ hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !product) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👁️</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Xem nhanh sản phẩm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white dark:bg-slate-700 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                <LazyImage
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  placeholder={<div className="text-6xl text-slate-400">📱</div>}
                />
                <div className="absolute top-4 right-4 bg-primary-500/90 text-white px-3 py-1 text-sm rounded-full font-medium">
                  {product.sku}
                </div>
              </div>
              
              {/* Stock indicator */}
              <div className="flex items-center justify-center">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10 
                    ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                    : product.stock > 0
                    ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300'
                    : 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock > 10 ? 'bg-success-500' : product.stock > 0 ? 'bg-warning-500' : 'bg-danger-500'
                  }`}></div>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Giá đã bao gồm VAT
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">SKU:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Bảo hành:</span>
                  <span className="text-slate-900 dark:text-white">{product.warranty} tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Trạng thái:</span>
                  <span className={`font-medium ${
                    product.stock > 0 
                      ? 'text-success-600 dark:text-success-400' 
                      : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium text-slate-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Tối đa: {product.stock}
                    </div>
                  </div>
                </div>
              )}

              {/* Total Price */}
              {product.stock > 0 && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 dark:text-slate-300">Tổng tiền:</span>
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onViewDetails}
            className="flex-1 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            📄 Xem chi tiết
          </button>
          
          {product.stock > 0 ? (
            <LoadingButton
              onClick={handleAddToCart}
              loading={isLoading}
              loadingText="Đang thêm..."
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              🛒 Thêm vào giỏ ({quantity})
            </LoadingButton>
          ) : (
            <button
              disabled
              className="flex-1 px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
            >
              ❌ Hết hàng
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal