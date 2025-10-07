import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { getDealerInfo } from '../services/api'
import { UI_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, TAB_NAMES, CSS_CLASSES, DEFAULTS } from '../constants'
import './ProductDetail.css'

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const { isLoading: cartLoading } = useCart()
  const [selectedTier, setSelectedTier] = useState(0)

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
        console.error('Failed to parse image JSON:', error)
        return null
      }
    }

    return null
  }
  const [quantity, setQuantity] = useState(() => {
    if (product?.wholesalePrice && product.wholesalePrice.length > 0) {
      return product.wholesalePrice[0]?.quantity || 1
    }
    return 1
  })
  const [activeTab, setActiveTab] = useState(TAB_NAMES.DESCRIPTION)
  const [showNotification, setShowNotification] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteFormData, setQuoteFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    message: ''
  })

  if (!product) {
    return (
        <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <div className="error-message">
          <p>{ERROR_MESSAGES.PRODUCT_NOT_FOUND}</p>
          <button className="btn btn-primary" onClick={onBack}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleTierChange = (tierIndex) => {
    if (!product?.wholesalePrice || tierIndex >= product.wholesalePrice.length) return

    setSelectedTier(tierIndex)
    const tier = product.wholesalePrice[tierIndex]
    if (tier?.quantity) {
      setQuantity(tier.quantity)
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (!product?.wholesalePrice || !product.wholesalePrice[selectedTier]) return

    const currentTier = product.wholesalePrice[selectedTier]
    const nextTier = product.wholesalePrice[selectedTier + 1]

    // Ensure quantity meets minimum for current tier
    const minQuantity = currentTier?.quantity || 1
    const maxQuantity = nextTier ? nextTier.quantity - 1 : 999999

    if (newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const getCurrentPrice = () => {
    // If no wholesale pricing, return original price
    if (!product?.wholesalePrice) {
      return product?.price || 0
    }

    // Parse wholesale price if it's a string
    let wholesalePrices = product.wholesalePrice
    if (typeof wholesalePrices === 'string') {
      try {
        wholesalePrices = JSON.parse(wholesalePrices)
      } catch {
        return product?.price || 0
      }
    }

    // Validate wholesale prices array
    if (!Array.isArray(wholesalePrices) || wholesalePrices.length === 0) {
      return product?.price || 0
    }

    // Get selected tier data
    const tierData = wholesalePrices[selectedTier]

    if (!tierData || typeof tierData.price !== 'number') {
      return product?.price || 0
    }

    return tierData.price
  }

  const getTotalPrice = () => {
    return getCurrentPrice() * quantity
  }

  const handleQuoteFormChange = (e) => {
    const { name, value } = e.target
    setQuoteFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuoteSubmit = async (e) => {
    e.preventDefault()

    // Quote data structure for API submission
    const _quoteData = {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku
      },
      tier: selectedTier,
      tierInfo: product?.wholesalePrice?.[selectedTier] || null,
      quantity,
      unitPrice: getCurrentPrice(),
      totalPrice: getTotalPrice(),
      contact: quoteFormData
    }

    try {
      // Simulate API call - replace with actual API when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success notification
      setShowNotification(true)
      setShowQuoteModal(false)

      // Reset form
      setQuoteFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        message: ''
      })

      setTimeout(() => {
        setShowNotification(false)
      }, UI_CONSTANTS.QUOTE_NOTIFICATION_TIMEOUT)
    } catch (error) {
      console.error('Error submitting quote:', error)
      // Handle error
    }
  }

  const handleAddToCart = async () => {
    try {
      // Pass the current unit price based on selected tier
      const unitPrice = getCurrentPrice()

      // Get dealer info using utility function
      const dealerInfo = getDealerInfo()

      // Cart body structure for API submission
      const _cartBody = {
        dealerId: dealerInfo?.accountId || "UNKNOWN_DEALER",
        productId: product.id,
        quantity: quantity,
        unitPrice: unitPrice
      }

      await onAddToCart(product, quantity, unitPrice)
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, UI_CONSTANTS.NOTIFICATION_TIMEOUT)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null

    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }

    return url // Return original URL if not YouTube
  }

  const getProductSpecs = () => {
    // Use specifications from API if available, otherwise fallback to basic info
    if (product.specifications && (product.specifications.general || product.specifications.technical)) {
      const specs = {}

      // Add general specs
      if (product.specifications.general) {
        product.specifications.general.forEach(spec => {
          specs[spec.label] = spec.value
        })
      }

      // Add technical specs
      if (product.specifications.technical) {
        product.specifications.technical.forEach(spec => {
          specs[spec.label] = spec.value
        })
      }

      // Add basic product info
      specs['SKU'] = product.sku
      specs['Giá'] = formatPrice(product.price)
      specs['Tồn kho'] = `${product.stock} sản phẩm`
      specs['Bảo hành'] = `${product.warranty} tháng`

      return specs
    }

    // Fallback to basic specs
    return {
      'SKU': product.sku,
      'Tên sản phẩm': product.name,
      'Giá': formatPrice(product.price),
      'Tồn kho': `${product.stock} sản phẩm`,
      'Bảo hành': `${product.warranty} tháng`,
      'Mô tả': product.description
    }
  }

  const specs = getProductSpecs()

  return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-8 max-w-6xl mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(() => {
              const imageUrl = getImageUrl(product.image)
              return imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-slate-400">
                  📱
                </div>
              )
            })()}
          </div>
        </div>

        <div className="space-y-6">
          {product.sku && (
            <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
              {product.sku}
            </span>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {product.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {product.description}
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Giá sỉ theo số lượng</div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(getCurrentPrice())}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Giá lẻ</div>
                  <div className="text-lg text-slate-400 dark:text-slate-500 line-through">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Giá sỉ ưu đãi cho đơn hàng số lượng lớn
              </div>
            </div>

            <div className="flex items-center justify-end">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                🛡️ Bảo hành {product.warranty} tháng
              </span>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
            {product.wholesalePrice && product.wholesalePrice.length > 0 ? (
              <>
                {/* Tier Selection */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Chọn gói số lượng:</span>
                  <div className="grid gap-2">
                    {product.wholesalePrice.map((tier, index) => (
                      <button
                        key={`tier-${index}`}
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
                              {formatPrice(tier.price)}/sản phẩm
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
                      disabled={quantity <= (product?.wholesalePrice?.[selectedTier]?.quantity || 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || (product?.wholesalePrice?.[selectedTier]?.quantity || 1))}
                      min={product?.wholesalePrice?.[selectedTier]?.quantity || 1}
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
                    Tối thiểu: {product?.wholesalePrice?.[selectedTier]?.quantity || 1}
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Tổng thanh toán:</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {formatPrice(getTotalPrice())}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {quantity} × {formatPrice(getCurrentPrice())}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToCart()
                  }}
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
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Liên hệ để biết thêm thông tin
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 mb-6 -mb-px">
          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'description'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('description')}
          >
            📝 Mô tả chi tiết
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'specs'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('specs')}
          >
            ⚙️ Thông số kỹ thuật
          </button>
          {product.videos && product.videos.length > 0 && (
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'videos'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => setActiveTab('videos')}
            >
              🎥 Video
            </button>
          )}
          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'warranty'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveTab('warranty')}
          >
            🛡️ Bảo hành
          </button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Mô tả chi tiết sản phẩm</h3>
              {product.descriptions && product.descriptions.length > 0 ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {product.descriptions.map((desc, index) => {
                    if (desc.type === 'title') {
                      return (
                        <h4 key={`desc-title-${index}`} className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3 first:mt-0">
                          {desc.text}
                        </h4>
                      )
                    } else if (desc.type === 'image') {
                      const imageUrl = getImageUrl(desc.imageUrl || desc.link?.url || desc.url)
                      return imageUrl ? (
                        <div key={`desc-image-${index}`} className="my-4 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Mô tả sản phẩm"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ) : null
                    } else if (desc.type === 'video') {
                      const videoUrl = desc.videoUrl || desc.link?.url || desc.url
                      if (!videoUrl) return null

                      const embedUrl = getYouTubeEmbedUrl(videoUrl)
                      return (
                        <div key={`desc-video-${index}`} className="my-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          {desc.title && (
                            <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                              {desc.title}
                            </h5>
                          )}
                          {desc.text && (
                            <p className="text-slate-600 dark:text-slate-400 mb-3 text-sm">
                              {desc.text}
                            </p>
                          )}
                          <div className="rounded-lg overflow-hidden">
                            <iframe
                              src={embedUrl}
                              title={desc.title || 'Video mô tả sản phẩm'}
                              className="w-full h-64 md:h-80"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )
                    } else if (desc.type === 'description') {
                      return (
                        <div
                          key={`desc-text-${index}`}
                          className="prose prose-slate dark:prose-invert prose-lg"
                          dangerouslySetInnerHTML={{__html: desc.text}}
                        />
                      )
                    }
                    return null
                  })}
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Thông số kỹ thuật</h3>
              <div className="grid gap-3">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{key}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-right">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'videos' && product.videos && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Video sản phẩm</h3>
              <div className="grid gap-6">
                {product.videos.map((video, index) => (
                  <div key={`video-${index}`} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{video.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-3 text-sm">{video.description}</p>
                    <div className="rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(video.videoUrl)}
                        title={video.title}
                        className="w-full h-64 md:h-80 lg:h-96"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === 'warranty' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Chính sách bảo hành</h3>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Thời gian bảo hành</h4>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{product.warranty} tháng</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    ✅ Điều kiện bảo hành
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {product.warranty > 0 ? `Bảo hành ${product.warranty} tháng theo chính sách nhà sản xuất` : 'Không có thông tin bảo hành'}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    🔄 Quy trình bảo hành
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Vui lòng liên hệ để biết thêm chi tiết về quy trình bảo hành.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Yêu cầu báo giá sỉ
                </h3>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4">
              {/* Product Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Chi tiết đơn hàng</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p><strong>Sản phẩm:</strong> {product.name}</p>
                  <p><strong>SKU:</strong> {product.sku}</p>
                  <p><strong>Số lượng:</strong> {quantity} sản phẩm</p>
                  <p><strong>Đơn giá:</strong> {formatPrice(getCurrentPrice())}</p>
                  <p><strong>Tổng tiền:</strong> {formatPrice(getTotalPrice())}</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tên công ty *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={quoteFormData.companyName}
                    onChange={handleQuoteFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tên công ty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Người liên hệ *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={quoteFormData.contactName}
                    onChange={handleQuoteFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tên người liên hệ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={quoteFormData.email}
                    onChange={handleQuoteFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập email liên hệ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={quoteFormData.phone}
                    onChange={handleQuoteFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tin nhắn
                  </label>
                  <textarea
                    name="message"
                    value={quoteFormData.message}
                    onChange={handleQuoteFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Thông tin bổ sung (tuỳ chọn)"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Đã thêm vào giỏ hàng!</h4>
              <p className="text-sm opacity-90">{quantity} sản phẩm đã được thêm.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail