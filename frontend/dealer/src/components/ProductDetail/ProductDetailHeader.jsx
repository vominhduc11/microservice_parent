const ProductDetailHeader = ({ product, onBack }) => {

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getCurrentPrice = () => {
    return product.wholesalePrice?.[0]?.price || product.price
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <button
            className="text-primary-500 hover:text-primary-600 transition-colors"
            onClick={onBack}
          >
            Sản phẩm
          </button>
          <span>›</span>
          <span className="truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Header Info */}
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
      </div>
    </>
  )
}

export default ProductDetailHeader