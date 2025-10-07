import { FORM_FIELDS, DEFAULTS, SERIAL_STATUS } from '../../constants'

const ProductSelection = ({
  formData,
  errors,
  products,
  loadingProducts,
  availableSerials,
  soldSerials,
  loadingSerials,
  selectedSerials,
  serialViewMode,
  onFormDataChange,
  onDateChange,
  onSerialViewModeChange,
  onSerialToggle
}) => {
  const getCurrentSerials = () => {
    return serialViewMode === SERIAL_STATUS.IN_STOCK ? availableSerials : soldSerials
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Thông tin sản phẩm
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chọn sản phẩm *
          </label>
          {loadingProducts ? (
            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Đang tải sản phẩm...</span>
            </div>
          ) : (
            <select
              name={FORM_FIELDS.PRODUCT_ID}
              value={formData.productId}
              onChange={onFormDataChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Bảo hành: {product.warranty || DEFAULTS.WARRANTY_MONTHS} tháng)
                </option>
              ))}
            </select>
          )}
          {errors.productId && (
            <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ngày mua *
          </label>
          <input
            type="date"
            name={FORM_FIELDS.PURCHASE_DATE}
            value={formData.purchaseDate}
            onChange={onDateChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
          {errors.purchaseDate && (
            <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>
          )}
        </div>
      </div>

      {/* Serial Numbers Selection */}
      {formData.productId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Chọn số serial
            </h3>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onSerialViewModeChange(SERIAL_STATUS.ALLOCATED_TO_DEALER)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  serialViewMode === SERIAL_STATUS.ALLOCATED_TO_DEALER
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Đã phân bổ cho dealer ({soldSerials.length})
              </button>
              <button
                type="button"
                onClick={() => onSerialViewModeChange(SERIAL_STATUS.IN_STOCK)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  serialViewMode === SERIAL_STATUS.IN_STOCK
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Còn lại ({availableSerials.length})
              </button>
            </div>
          </div>

          {loadingSerials ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải serial numbers...</span>
            </div>
          ) : getCurrentSerials().length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {getCurrentSerials().map((serial) => (
                <label
                  key={serial.serialNumber}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSerials.includes(serial.serialNumber)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSerials.includes(serial.serialNumber)}
                    onChange={() => onSerialToggle(serial.serialNumber)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {serial.serialNumber}
                    </div>
                    {serial.createdAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(serial.createdAt)}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Không có serial number nào cho sản phẩm này</p>
            </div>
          )}

          {selectedSerials.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Đã chọn {selectedSerials.length} serial number(s):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSerials.map((serial) => (
                  <span
                    key={serial}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded-md"
                  >
                    {serial}
                    <button
                      type="button"
                      onClick={() => onSerialToggle(serial)}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.serialNumbers && (
            <p className="text-red-500 text-sm">{errors.serialNumbers}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductSelection