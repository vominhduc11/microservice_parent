import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const QRPayment = ({ orderData, onPaymentComplete }) => {
  const [countdown, setCountdown] = useState(300) // 5 minutes countdown
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    // Generate QR code data (in real app, this would be from payment gateway)
    const paymentData = {
      amount: orderData.totalAmount,
      orderId: `TZ${Date.now()}`,
      merchantId: 'TUNEZONE_DEALER',
      description: `Thanh toán đơn hàng ${orderData.cart.length} sản phẩm`
    }
    
    // Simulate QR code generation
    const qrData = `https://qr.tunezone.vn/pay?amount=${paymentData.amount}&orderId=${paymentData.orderId}&merchantId=${paymentData.merchantId}`
    setQrCode(qrData)
  }, [orderData])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const generateQRCodeImage = (data) => {
    // In a real application, you would use a QR code library like qrcode
    // For demo purposes, we'll use a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
        }
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(200px); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
        .status-pulse {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffc107;
          box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
          animation: pulse 2s infinite;
        }
        .scan-line {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          animation: scan 3s linear infinite;
          pointer-events: none;
        }
        .timer-warning {
          color: #dc3545;
          animation: blink 1s infinite;
        }
        @media (max-width: 768px) {
          @keyframes scan {
            0% { transform: translateY(0); }
            100% { transform: translateY(160px); }
          }
        }
      `}</style>
      <div className="p-5 max-w-4xl mx-auto pt-[100px] md:pt-[110px] lg:pt-[120px]">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-600 bg-gradient-to-br from-primary-500 to-primary-700 text-white text-center transition-colors duration-300">
            <h2 className="m-0 mb-4 text-[1.8rem]">Thanh toán QR Code</h2>
            <div className="flex items-center justify-center gap-2.5 text-base">
              <span className="status-pulse"></span>
              <span>Đang chờ thanh toán</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-10">
            <div className="flex flex-col items-center gap-7">
              <div className="relative p-5 bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-xl shadow-md transition-colors duration-300">
                {qrCode && (
                  <img
                    src={generateQRCodeImage(qrCode)}
                    alt="QR Code thanh toán"
                    className="w-[200px] h-[200px] rounded-lg md:w-[160px] md:h-[160px]"
                  />
                )}
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                  <div className="scan-line"></div>
                </div>
              </div>

              <div className="text-center max-w-[300px]">
                <h3 className="m-0 mb-4 text-[var(--text-primary)] text-xl">Hướng dẫn thanh toán</h3>
                <ol className="text-left text-[var(--text-secondary)] leading-relaxed pl-5">
                  <li className="mb-2">Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                  <li className="mb-2">Chọn tính năng quét mã QR</li>
                  <li className="mb-2">Quét mã QR phía trên</li>
                  <li className="mb-2">Xác nhận thông tin và hoàn tất thanh toán</li>
                </ol>
              </div>

              <div className="flex items-center gap-4 py-4 px-5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] transition-colors duration-300">
                <div className="text-2xl">⏰</div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[var(--text-secondary)]">Thời gian còn lại:</span>
                  <span className={`text-2xl font-bold font-mono text-[var(--text-primary)] ${countdown <= 60 ? 'timer-warning' : ''}`}>
                    {formatTime(countdown)}
                  </span>
                </div>
              </div>

              {countdown === 0 && (
                <div className="text-center p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400">
                  <p className="m-0 mb-4">Mã QR đã hết hạn. Vui lòng thử lại.</p>
                  <button
                    className="py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-slate-600 text-white hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => window.location.reload()}
                  >
                    Tạo mã QR mới
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] h-fit transition-colors duration-300">
                <h3 className="m-0 mb-5 text-[var(--text-primary)] text-xl">Thông tin thanh toán</h3>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3 text-[15px]">
                    <span className="text-[var(--text-secondary)]">Số tiền:</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(orderData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-[15px]">
                    <span className="text-[var(--text-secondary)]">Mã đơn hàng:</span>
                    <span className="font-medium text-[var(--text-primary)]">TZ{Date.now()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-[15px]">
                    <span className="text-[var(--text-secondary)]">Khách hàng:</span>
                    <span className="font-medium text-[var(--text-primary)]">{orderData.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-[15px]">
                    <span className="text-[var(--text-secondary)]">Số điện thoại:</span>
                    <span className="font-medium text-[var(--text-primary)]">{orderData.customerInfo.phone}</span>
                  </div>
                </div>

                <div>
                  <h4 className="m-0 mb-4 mt-6 pt-5 text-lg text-[var(--text-primary)] border-t border-[var(--border-color)] transition-colors duration-300">Sản phẩm đã đặt</h4>
                  <div className="flex flex-col gap-3">
                    {orderData.cart.map(item => (
                      <div key={item.id} className="flex gap-3 items-center p-3 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)] transition-colors duration-300">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <span className="font-medium text-[13px] text-[var(--text-primary)]">{item.name}</span>
                          <span className="text-xs text-[var(--text-secondary)]">x{item.quantity}</span>
                          <span className="text-[13px] font-semibold text-primary-600">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-6 pt-5 border-t border-[var(--border-color)] transition-colors duration-300">
                  <h4 className="m-0 mb-4 text-lg text-[var(--text-primary)]">Ứng dụng hỗ trợ</h4>
                  <div className="flex justify-center gap-2.5 my-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xl transition-colors duration-300">🏧</div>
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xl transition-colors duration-300">💳</div>
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xl transition-colors duration-300">📱</div>
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xl transition-colors duration-300">🏦</div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-snug">Vietcombank, BIDV, VietinBank, Techcombank, MBBank, VPBank, MoMo, ZaloPay...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 justify-center py-7 border-t border-[var(--border-color)] transition-colors duration-300">
            <button
              className="py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-600/40"
              onClick={onPaymentComplete}
            >
              ✅ Đã thanh toán xong
            </button>
            <button
              className="py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-slate-600 text-white hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-600/40"
              onClick={() => window.history.back()}
            >
              ← Quay lại
            </button>
          </div>

          <div className="py-5 px-7 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
            <p className="m-0 text-[13px] text-blue-800 dark:text-blue-300 leading-relaxed">
              💡 <strong>Lưu ý:</strong> Sau khi thanh toán thành công, vui lòng nhấn nút "Đã thanh toán xong"
              để hoàn tất đơn hàng. Chúng tôi sẽ xác nhận và xử lý đơn hàng của bạn trong vòng 15 phút.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

QRPayment.propTypes = {
  orderData: PropTypes.shape({
    totalAmount: PropTypes.number.isRequired,
    cart: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
      image: PropTypes.string
    })).isRequired,
    customerInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  onPaymentComplete: PropTypes.func.isRequired
}

export default QRPayment