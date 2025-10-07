import { DEFAULTS } from '../../constants'

const PriceDisplay = ({
  product,
  currentPrice,
  formatPrice
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Giá sỉ theo số lượng</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(currentPrice)}
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
          🛡️ Bảo hành {product.warranty || DEFAULTS.WARRANTY_MONTHS} tháng
        </span>
      </div>
    </div>
  )
}

export default PriceDisplay