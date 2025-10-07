import { useState, useEffect } from 'react'
import './QRPayment.css'

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
    <div className="qr-payment-page">
      <div className="qr-payment-container">
        <div className="payment-header">
          <h2>Thanh toán QR Code</h2>
          <div className="payment-status">
            <span className="status-indicator pending"></span>
            <span>Đang chờ thanh toán</span>
          </div>
        </div>

        <div className="payment-content">
          <div className="qr-section">
            <div className="qr-code-container">
              {qrCode && (
                <img 
                  src={generateQRCodeImage(qrCode)} 
                  alt="QR Code thanh toán"
                  className="qr-code-image"
                />
              )}
              <div className="qr-overlay">
                <div className="scanning-line"></div>
              </div>
            </div>
            
            <div className="qr-instructions">
              <h3>Hướng dẫn thanh toán</h3>
              <ol>
                <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                <li>Chọn tính năng quét mã QR</li>
                <li>Quét mã QR phía trên</li>
                <li>Xác nhận thông tin và hoàn tất thanh toán</li>
              </ol>
            </div>

            <div className="payment-timer">
              <div className="timer-icon">⏰</div>
              <div className="timer-content">
                <span>Thời gian còn lại:</span>
                <span className={`timer-display ${countdown <= 60 ? 'warning' : ''}`}>
                  {formatTime(countdown)}
                </span>
              </div>
            </div>

            {countdown === 0 && (
              <div className="timeout-message">
                <p>Mã QR đã hết hạn. Vui lòng thử lại.</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Tạo mã QR mới
                </button>
              </div>
            )}
          </div>

          <div className="payment-details">
            <div className="details-card">
              <h3>Thông tin thanh toán</h3>
              
              <div className="payment-info">
                <div className="info-row">
                  <span>Số tiền:</span>
                  <span className="amount">{formatPrice(orderData.totalAmount)}</span>
                </div>
                <div className="info-row">
                  <span>Mã đơn hàng:</span>
                  <span>TZ{Date.now()}</span>
                </div>
                <div className="info-row">
                  <span>Khách hàng:</span>
                  <span>{orderData.customerInfo.name}</span>
                </div>
                <div className="info-row">
                  <span>Số điện thoại:</span>
                  <span>{orderData.customerInfo.phone}</span>
                </div>
              </div>

              <div className="order-summary">
                <h4>Sản phẩm đã đặt</h4>
                <div className="order-items">
                  {orderData.cart.map(item => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="payment-methods">
                <h4>Ứng dụng hỗ trợ</h4>
                <div className="supported-apps">
                  <div className="app-icon">🏧</div>
                  <div className="app-icon">💳</div>
                  <div className="app-icon">📱</div>
                  <div className="app-icon">🏦</div>
                </div>
                <p>Vietcombank, BIDV, VietinBank, Techcombank, MBBank, VPBank, MoMo, ZaloPay...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button 
            className="btn btn-success"
            onClick={onPaymentComplete}
          >
            ✅ Đã thanh toán xong
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            ← Quay lại
          </button>
        </div>

        <div className="payment-note">
          <p>
            💡 <strong>Lưu ý:</strong> Sau khi thanh toán thành công, vui lòng nhấn nút "Đã thanh toán xong" 
            để hoàn tất đơn hàng. Chúng tôi sẽ xác nhận và xử lý đơn hàng của bạn trong vòng 15 phút.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRPayment