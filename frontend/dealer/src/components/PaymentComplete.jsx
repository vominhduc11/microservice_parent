import './PaymentComplete.css'

const PaymentComplete = ({ onBackToProducts }) => {
  const orderNumber = `TZ${Date.now()}`
  
  return (
    <div className="payment-complete-page">
      <div className="complete-container">
        <div className="success-animation">
          <div className="checkmark-container">
            <div className="checkmark">
              <div className="checkmark-circle"></div>
              <div className="checkmark-stem"></div>
              <div className="checkmark-kick"></div>
            </div>
          </div>
        </div>
        
        <div className="success-content">
          <h2>🎉 Đặt hàng thành công!</h2>
          <p className="success-message">
            Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
          </p>
          
          <div className="order-info">
            <div className="info-card">
              <h3>Thông tin đơn hàng</h3>
              <div className="info-row">
                <span>Mã đơn hàng:</span>
                <span className="order-number">{orderNumber}</span>
              </div>
              <div className="info-row">
                <span>Thời gian đặt:</span>
                <span>{new Date().toLocaleString('vi-VN')}</span>
              </div>
              <div className="info-row">
                <span>Trạng thái:</span>
                <span className="status-badge">Đang xử lý</span>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>Các bước tiếp theo</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-icon">📋</div>
                <div className="step-content">
                  <h4>Xác nhận đơn hàng</h4>
                  <p>Chúng tôi sẽ xác nhận và xử lý đơn hàng trong vòng 15-30 phút</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon">📦</div>
                <div className="step-content">
                  <h4>Chuẩn bị hàng</h4>
                  <p>Đơn hàng sẽ được đóng gói và chuẩn bị giao trong 1-2 ngày làm việc</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon">🚚</div>
                <div className="step-content">
                  <h4>Giao hàng</h4>
                  <p>Đơn hàng sẽ được giao đến địa chỉ của bạn trong 2-3 ngày làm việc</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon">✅</div>
                <div className="step-content">
                  <h4>Hoàn tất</h4>
                  <p>Bạn nhận hàng và kích hoạt bảo hành sản phẩm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <div className="contact-methods">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Hotline:</strong>
                  <p>1900-1234 (24/7)</p>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Email hỗ trợ:</strong>
                  <p>support@tunezone.vn</p>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <strong>Chat online:</strong>
                  <p>Messenger, Zalo, Telegram</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={onBackToProducts}
            >
              🛍️ Tiếp tục mua sắm
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              🖨️ In thông tin đơn hàng
            </button>
          </div>

          <div className="thank-you-note">
            <p>
              💙 <strong>Cảm ơn bạn đã tin tưởng TuneZone!</strong><br/>
              Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng cao và dịch vụ tốt nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentComplete