import { useState } from 'react'
import './Checkout.css'

const Checkout = ({ cart, totalAmount, onPaymentLater, onPaymentNow }) => {
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
  const [deliveryDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toLocaleDateString('vi-VN')
  })

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
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng'
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
      // Handle error appropriately
    } finally {
      setIsSubmitting(false)
    }
  }

  const finalTotal = totalAmount + totalAmount * 0.1

  return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-20 md:pb-5 max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <div className="mt-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Thanh toán đơn hàng</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Vui lòng điền thông tin để hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </span>
                Thông tin đơn hàng
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 sm:p-6 md:p-8">
            {/* Customer Information Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b-2 border-primary-500">
                    Thông tin khách hàng
                  </h3>
                
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Họ và tên *
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Nhập họ tên khách hàng"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="Nhập email"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ giao hàng *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Nhập địa chỉ giao hàng"
                    rows="3"
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3>Phương thức thanh toán</h3>
                
                <div className="payment-options space-y-4">
                  <label className="payment-option block relative p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md dark:hover:shadow-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:-translate-y-0.5">
                    <input
                      type="radio"
                      name="payment"
                      value="later"
                      checked={paymentMethod === 'later'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="absolute opacity-0"
                    />
                    <div className={`option-content ${paymentMethod === 'later' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'} transition-all duration-300`}>
                      <div className="option-header flex items-center mb-2">
                        <span className="option-icon text-2xl mr-3 transition-transform duration-300 group-hover:scale-110">💳</span>
                        <span className="option-title font-medium">Thanh toán sau</span>
                        {paymentMethod === 'later' && (
                          <svg className="w-6 h-6 ml-auto text-blue-600 animate-appear" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <p className="option-description text-sm text-gray-600 dark:text-gray-400">
                        Thanh toán khi nhận hàng (COD). Phí thu hộ: 0đ
                      </p>
                    </div>
                  </label>

                  <label className="payment-option block relative p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md dark:hover:shadow-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:-translate-y-0.5">
                    <input
                      type="radio"
                      name="payment"
                      value="now"
                      checked={paymentMethod === 'now'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="absolute opacity-0"
                    />
                    <div className={`option-content ${paymentMethod === 'now' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      <div className="option-header flex items-center mb-2">
                        <span className="option-icon text-2xl mr-3">📱</span>
                        <span className="option-title font-medium">Thanh toán ngay</span>
                        {paymentMethod === 'now' && (
                          <svg className="w-6 h-6 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <p className="option-description text-sm text-gray-600 dark:text-gray-400">
                        Thanh toán qua QR Code - Nhanh chóng và an toàn
                      </p>
                      <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Giảm ngay 5% khi thanh toán online
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="note">Ghi chú đơn hàng</label>
                <textarea
                  id="note"
                  name="note"
                  value={customerInfo.note}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về đơn hàng (không bắt buộc)"
                  rows="2"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              <div className="delivery-info bg-blue-50 dark:bg-slate-700 p-4 rounded-lg my-4">
                <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2">Thông tin giao hàng</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Dự kiến giao hàng: <strong>{deliveryDate}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Phí ship: <strong>Miễn phí</strong> cho đơn hàng trên 500,000đ
                </p>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    paymentMethod === 'later' ? 'Xác nhận đặt hàng' : 'Thanh toán ngay'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-3">Chính sách mua hàng</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Đổi trả miễn phí trong 7 ngày
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Bảo hành chính hãng 12 tháng
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Hỗ trợ kỹ thuật 24/7
                </li>
              </ul>
            </div>
          </div>

          <div className="order-summary">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="group flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 hover:shadow-md">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-gray-800 dark:text-white truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Số lượng: {item.quantity}</p>
                      <div className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 dark:text-green-400">Miễn phí</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>VAT (10%)</span>
                  <span>{formatPrice(totalAmount * 0.1)}</span>
                </div>
                
                {paymentMethod === 'now' && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Giảm giá thanh toán online</span>
                    <span>-{formatPrice(totalAmount * 0.05)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(paymentMethod === 'now' ? finalTotal * 0.95 : finalTotal)}
                    </span>
                  </div>
                  {paymentMethod === 'now' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-right">
                      Tiết kiệm {formatPrice(finalTotal * 0.05)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phương thức thanh toán</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentMethod === 'later' 
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {paymentMethod === 'later' ? '💳 Thanh toán sau' : '📱 Thanh toán ngay'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout