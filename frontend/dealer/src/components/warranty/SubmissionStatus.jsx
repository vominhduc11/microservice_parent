import { SUCCESS_MESSAGES } from '../../constants'

const SubmissionStatus = ({
  isSubmitting,
  submitStatus,
  warrantyCode,
  onReset
}) => {
  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Đăng ký thành công!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {SUCCESS_MESSAGES.WARRANTY_REGISTERED}
            </p>
            {warrantyCode && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mã bảo hành:</p>
                <p className="text-lg font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {warrantyCode}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Đăng ký sản phẩm khác
          </button>
        </div>
      </div>
    )
  }

  if (submitStatus === 'error') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Có lỗi xảy ra!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Không thể đăng ký bảo hành. Vui lòng thử lại sau.
            </p>
          </div>
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center max-w-sm w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Đang xử lý...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default SubmissionStatus