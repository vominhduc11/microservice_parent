import { useNavigate } from 'react-router-dom'

const Cart = ({ cart, onUpdateItem, onRemoveItem, onCheckout, totalAmount, isLoadingProductInfo = false }) => {
  const navigate = useNavigate()
  const VAT_RATE = 0.1

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

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

  const calculateVAT = (amount) => amount * VAT_RATE
  const calculateTotal = (amount) => amount + calculateVAT(amount)

  const handleQuantityChange = (cartId, action, quantity = null) => {
    onUpdateItem(cartId, action, quantity)
  }

  if (cart.length === 0) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Giỏ hàng của bạn đang trống</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <button 
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 flex items-center gap-2"
            onClick={() => navigate('/products')}
          >
            📱 Xem sản phẩm
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Giỏ hàng ({cart.length} sản phẩm)
        </h1>
        {isLoadingProductInfo && (
          <div className="mt-2 text-sm text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            Đang tải thông tin sản phẩm...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`cart-item-${item.cartId || item.id}`} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {(() => {
                    const imageUrl = getImageUrl(item.image)
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name || 'Sản phẩm'}
                        className="w-full sm:w-24 h-32 sm:h-24 object-contain rounded-lg bg-slate-50 dark:bg-slate-700"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null
                  })()}
                  <div className="w-full sm:w-24 h-32 sm:h-24 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400" style={{display: getImageUrl(item.image) ? 'none' : 'flex'}}>
                    📦
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {item.name || 'Tên sản phẩm'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {item.description || 'Không có mô tả'}
                  </p>
                  <div className="space-y-1">
                    {item.price && item.unitPrice && item.price !== item.unitPrice && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 line-through">
                        Giá gốc: {formatPrice(item.price)}
                      </div>
                    )}
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      Giá sỉ: {formatPrice(item.unitPrice || item.price)}
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex flex-col items-end gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(item.cartId, 'decrement')}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value)
                        if (newQuantity >= 1) {
                          handleQuantityChange(item.cartId, 'set', newQuantity)
                        }
                      }}
                      className="w-12 text-center font-medium text-slate-900 dark:text-white bg-transparent border-none outline-none focus:bg-slate-50 dark:focus:bg-slate-600 rounded"
                    />
                    <button
                      className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(item.cartId, 'increment')}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Tổng tiền
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => onRemoveItem(item.cartId)}
                    title="Xóa sản phẩm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Tóm tắt đơn hàng
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tạm tính (giá sỉ):</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600 dark:text-green-400">Miễn phí</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>VAT ({Math.round(VAT_RATE * 100)}%):</span>
                <span>{formatPrice(calculateVAT(totalAmount))}</span>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(calculateTotal(totalAmount))}</span>
                </div>
              </div>
            </div>
            
            <button
              className="w-full mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 flex items-center justify-center gap-2"
              onClick={onCheckout}
            >
              📦 Đặt hàng
            </button>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Lưu ý:</strong> Giá đã bao gồm VAT và phí vận chuyển miễn phí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart