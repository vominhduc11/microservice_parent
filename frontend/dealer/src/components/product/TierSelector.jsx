const TierSelector = ({
  wholesalePrice,
  selectedTier,
  formatPrice,
  onTierChange
}) => {
  if (!wholesalePrice || !wholesalePrice.length) {
    return null
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Chọn gói số lượng:</span>
      <div className="grid gap-2">
        {wholesalePrice.map((tier, index) => (
          <button
            key={`tier-${index}`}
            type="button"
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedTier === index
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
            onClick={() => onTierChange(index)}
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
  )
}

export default TierSelector