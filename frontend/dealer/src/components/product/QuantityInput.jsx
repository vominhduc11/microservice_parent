import { DEFAULTS } from '../../constants'

const QuantityInput = ({
  quantity,
  minQuantity = DEFAULTS.QUANTITY,
  onQuantityChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng:</span>
      <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
        <button
          type="button"
          className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
          onClick={() => onQuantityChange(quantity - 1)}
          disabled={quantity <= minQuantity}
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || minQuantity)}
          min={minQuantity}
          className="w-20 px-3 py-2 text-center border-0 bg-white dark:bg-slate-800 focus:outline-none"
        />
        <button
          type="button"
          className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          onClick={() => onQuantityChange(quantity + 1)}
        >
          +
        </button>
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Tối thiểu: {minQuantity}
      </div>
    </div>
  )
}

export default QuantityInput