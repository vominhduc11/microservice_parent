import { useState, memo, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useCart } from '../../context/CartContext'

const TierSelector = memo(({ product, onAddToCart }) => {
  const { isLoading: cartLoading } = useCart()
  const [selectedTier, setSelectedTier] = useState(0)
  const [quantity, setQuantity] = useState(product?.wholesalePrice?.[0]?.quantity || 1)

  // Memoize price formatter
  const formatPrice = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })
  }, [])

  // Memoize current price calculation
  const currentPrice = useMemo(() => {
    return product.wholesalePrice?.[selectedTier]?.price || product.price
  }, [product.wholesalePrice, selectedTier, product.price])

  // Memoize total price calculation
  const totalPrice = useMemo(() => {
    return currentPrice * quantity
  }, [currentPrice, quantity])

  // Memoize tier quantity limits
  const quantityLimits = useMemo(() => {
    const currentTier = product.wholesalePrice?.[selectedTier]
    const nextTier = product.wholesalePrice?.[selectedTier + 1]

    return {
      min: currentTier?.quantity || 1,
      max: nextTier ? nextTier.quantity - 1 : 999999
    }
  }, [product.wholesalePrice, selectedTier])

  const handleTierChange = useCallback((tierIndex) => {
    setSelectedTier(tierIndex)
    const tier = product.wholesalePrice[tierIndex]
    setQuantity(tier.quantity)
  }, [product.wholesalePrice])

  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity >= quantityLimits.min && newQuantity <= quantityLimits.max) {
      setQuantity(newQuantity)
    }
  }, [quantityLimits])

  const handleAddToCart = useCallback(async () => {
    try {
      await onAddToCart(product, quantity, currentPrice)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }, [onAddToCart, product, quantity, currentPrice])

  if (!product.wholesalePrice || product.wholesalePrice.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Liên hệ để biết thêm thông tin
        </div>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
      {/* Tier Selection */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Chọn gói số lượng:</span>
        <div className="grid gap-2">
          {product.wholesalePrice.map((tier, index) => (
            <button
              key={index}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedTier === index
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              onClick={() => handleTierChange(index)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {tier.quantity}+ sản phẩm
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {formatPrice.format(tier.price)}/sản phẩm
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Giá sỉ
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Input */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng:</span>
        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
          <button
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= quantityLimits.min}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || quantityLimits.min)}
            min={quantityLimits.min}
            className="w-20 px-3 py-2 text-center border-0 bg-white dark:bg-slate-800 focus:outline-none"
          />
          <button
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            +
          </button>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Tối thiểu: {quantityLimits.min}
        </div>
      </div>

      {/* Total Price */}
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-600 dark:text-slate-400">Tổng thanh toán:</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatPrice.format(totalPrice)}
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {quantity} × {formatPrice.format(currentPrice)}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        onClick={handleAddToCart}
        disabled={cartLoading}
      >
        {cartLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Đang thêm...
          </>
        ) : (
          <>
            🛒 Thêm vào giỏ hàng
          </>
        )}
      </button>
    </div>
  )
})

TierSelector.propTypes = {
  product: PropTypes.shape({
    price: PropTypes.number.isRequired,
    wholesalePrice: PropTypes.arrayOf(PropTypes.shape({
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired
    }))
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired
}

TierSelector.displayName = 'TierSelector'

export default TierSelector