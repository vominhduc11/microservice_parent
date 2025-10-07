import { useState } from 'react'

const ProductDetailTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description')

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
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
    if (product.specifications && (product.specifications.general || product.specifications.technical)) {
      const specs = {}

      if (product.specifications.general) {
        product.specifications.general.forEach(spec => {
          specs[spec.label] = spec.value
        })
      }

      if (product.specifications.technical) {
        product.specifications.technical.forEach(spec => {
          specs[spec.label] = spec.value
        })
      }

      specs['SKU'] = product.sku
      specs['Giá'] = formatPrice(product.price)
      specs['Tồn kho'] = `${product.stock} sản phẩm`
      specs['Bảo hành'] = `${product.warranty} tháng`

      return specs
    }

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
    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
      {/* Tab Headers */}
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

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Mô tả chi tiết sản phẩm</h3>
            {product.descriptions && product.descriptions.length > 0 ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {product.descriptions.map((desc, index) => {
                  if (desc.type === 'title') {
                    return (
                      <h4 key={`tabs-desc-title-${index}`} className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3 first:mt-0">
                        {desc.text}
                      </h4>
                    )
                  } else if (desc.type === 'image') {
                    const imageUrl = getImageUrl(desc.imageUrl || desc.link?.url || desc.url)
                    return imageUrl ? (
                      <div key={`tabs-desc-image-${index}`} className="my-4 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt="Mô tả sản phẩm"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ) : null
                  } else if (desc.type === 'description') {
                    return (
                      <div
                        key={`tabs-desc-text-${index}`}
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
                <div key={`tabs-video-${index}`} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
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
  )
}

export default ProductDetailTabs