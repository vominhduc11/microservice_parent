import { useState } from 'react'

const CheckoutForm = ({ cart, totalAmount, onPaymentLater, onPaymentNow }) => {
  const [paymentMethod, setPaymentMethod] = useState('later')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  })
  const [errors, setErrors] = useState({})
  
  const deliveryDate = (() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toLocaleDateString('vi-VN')
  })()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên khách hàng'
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const orderData = {
        customerInfo,
        cart,
        totalAmount: totalAmount + totalAmount * 0.1,
        paymentMethod,
        orderDate: new Date().toISOString()
      }

      if (paymentMethod === 'later') {
        await onPaymentLater(orderData)
      } else {
        await onPaymentNow(orderData)
      }
    } catch (error) {
      console.error('Error processing order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const finalTotal = totalAmount + totalAmount * 0.1

  return (
    <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          💳 Thanh toán đơn hàng
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Vui lòng điền thông tin để hoàn tất đơn hàng của bạn
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 sm:p-6 md:p-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-primary-500 mb-6">
                  👤 Thông tin khách hàng
                </h3>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                        errors.name 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100`}
                      placeholder="Nhập họ tên khách hàng"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                          errors.phone 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100`}
                        placeholder="0912345678"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 resize-none ${
                        errors.address 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100`}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={customerInfo.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg transition-all duration-300 resize-none hover:border-slate-400 dark:hover:border-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Ghi chú thêm cho đơn hàng..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-primary-500 mb-6">
                  💰 Phương thức thanh toán
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="later"
                      checked={paymentMethod === 'later'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        💳 Thanh toán sau
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="now"
                      checked={paymentMethod === 'now'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        📱 Thanh toán ngay
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Thanh toán qua QR Code
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-primary-500 mb-6">
                  📋 Tóm tắt đơn hàng
                </h3>
                
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white dark:bg-slate-600"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Tạm tính:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">VAT (10%):</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(totalAmount * 0.1)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-slate-300 dark:border-slate-600">
                  <span className="text-slate-900 dark:text-slate-100">Tổng cộng:</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  📅 Dự kiến giao hàng: {deliveryDate}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'later' ? '📦 Đặt hàng' : '💳 Thanh toán ngay'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutForm