import PropTypes from 'prop-types'

const PaymentComplete = ({ onBackToProducts }) => {
  const orderNumber = `TZ${Date.now()}`

  return (
    <>
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0 0 0 40px #fff; }
        }
        @keyframes checkmark-stem {
          0% { opacity: 0; transform: rotate(45deg) scaleY(0); }
          100% { opacity: 1; transform: rotate(45deg) scaleY(1); }
        }
        @keyframes checkmark-kick {
          0% { opacity: 0; transform: rotate(-45deg) scaleY(0); }
          100% { opacity: 1; transform: rotate(-45deg) scaleY(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0 0 0 #fff;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
          position: relative;
          margin: 0 auto;
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #fff;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #fff;
        }
        .checkmark-stem {
          position: absolute;
          width: 3px;
          height: 20px;
          background: #fff;
          left: 32px;
          top: 35px;
          transform: rotate(45deg);
          animation: checkmark-stem 0.3s ease-in-out 0.8s forwards;
          transform-origin: left bottom;
          opacity: 0;
        }
        .checkmark-kick {
          position: absolute;
          width: 3px;
          height: 12px;
          background: #fff;
          left: 25px;
          top: 47px;
          transform: rotate(-45deg);
          animation: checkmark-kick 0.3s ease-in-out 1.0s forwards;
          transform-origin: left bottom;
          opacity: 0;
        }
        .fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        .fade-in-up-1 { animation: fadeInUp 0.6s ease-out 0.3s both; }
        .fade-in-up-2 { animation: fadeInUp 0.6s ease-out 0.4s both; }
        .fade-in-up-3 { animation: fadeInUp 0.6s ease-out 0.5s both; }
        .fade-in-up-4 { animation: fadeInUp 0.6s ease-out 0.6s both; }
        .fade-in-up-5 { animation: fadeInUp 0.6s ease-out 0.7s both; }
        .fade-in-up-6 { animation: fadeInUp 0.6s ease-out 0.8s both; }
        .fade-in-up-7 { animation: fadeInUp 0.6s ease-out 0.9s both; }
      `}</style>
      <div className="p-5 max-w-3xl mx-auto min-h-[80vh] flex items-center justify-center pt-[100px] md:pt-[110px] lg:pt-[120px]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-900/50 overflow-hidden w-full text-center transition-colors duration-300">
          <div className="py-10 px-5 pb-5 bg-gradient-to-br from-primary-500 to-primary-700">
            <div className="inline-block">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          </div>

          <div className="py-10 px-7">
            <h2 className="m-0 mb-4 text-3xl text-slate-900 dark:text-slate-100 fade-in-up-1">🎉 Đặt hàng thành công!</h2>
            <p className="m-0 mb-8 text-base text-slate-600 dark:text-slate-400 leading-relaxed fade-in-up-2">
              Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
            </p>

            <div className="mb-9 fade-in-up-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-600 text-left transition-colors duration-300">
                <h3 className="m-0 mb-5 text-xl text-slate-900 dark:text-slate-100 text-center">Thông tin đơn hàng</h3>
                <div className="flex justify-between items-center mb-3 text-[15px]">
                  <span className="text-slate-600 dark:text-slate-400">Mã đơn hàng:</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-900/30 py-1 px-2 rounded text-blue-700 dark:text-blue-300 font-bold">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-[15px]">
                  <span className="text-slate-600 dark:text-slate-400">Thời gian đặt:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{new Date().toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-[15px]">
                  <span className="text-slate-600 dark:text-slate-400">Trạng thái:</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-1 px-3 rounded-xl text-[13px] font-medium">Đang xử lý</span>
                </div>
              </div>
            </div>

            <div className="mb-9 text-left fade-in-up-4">
              <h3 className="m-0 mb-5 text-xl text-slate-900 dark:text-slate-100 text-center">Các bước tiếp theo</h3>
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 items-start p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-primary-500 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:translate-x-1">
                  <div className="text-2xl flex-shrink-0 mt-0.5">📋</div>
                  <div>
                    <h4 className="m-0 mb-2 text-base font-medium text-slate-900 dark:text-slate-100">Xác nhận đơn hàng</h4>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-400 leading-snug">Chúng tôi sẽ xác nhận và xử lý đơn hàng trong vòng 15-30 phút</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-primary-500 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:translate-x-1">
                  <div className="text-2xl flex-shrink-0 mt-0.5">📦</div>
                  <div>
                    <h4 className="m-0 mb-2 text-base font-medium text-slate-900 dark:text-slate-100">Chuẩn bị hàng</h4>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-400 leading-snug">Đơn hàng sẽ được đóng gói và chuẩn bị giao trong 1-2 ngày làm việc</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-primary-500 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:translate-x-1">
                  <div className="text-2xl flex-shrink-0 mt-0.5">🚚</div>
                  <div>
                    <h4 className="m-0 mb-2 text-base font-medium text-slate-900 dark:text-slate-100">Giao hàng</h4>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-400 leading-snug">Đơn hàng sẽ được giao đến địa chỉ của bạn trong 2-3 ngày làm việc</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-primary-500 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:translate-x-1">
                  <div className="text-2xl flex-shrink-0 mt-0.5">✅</div>
                  <div>
                    <h4 className="m-0 mb-2 text-base font-medium text-slate-900 dark:text-slate-100">Hoàn tất</h4>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-400 leading-snug">Bạn nhận hàng và kích hoạt bảo hành sản phẩm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-9 fade-in-up-5">
              <h3 className="m-0 mb-5 text-xl text-slate-900 dark:text-slate-100">Thông tin liên hệ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-300">
                  <span className="text-xl mt-0.5">📞</span>
                  <div>
                    <strong className="block mb-1 text-slate-900 dark:text-slate-100 text-sm font-medium">Hotline:</strong>
                    <p className="m-0 text-xs text-slate-600 dark:text-slate-400">1900-1234 (24/7)</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-300">
                  <span className="text-xl mt-0.5">✉️</span>
                  <div>
                    <strong className="block mb-1 text-slate-900 dark:text-slate-100 text-sm font-medium">Email hỗ trợ:</strong>
                    <p className="m-0 text-xs text-slate-600 dark:text-slate-400">support@tunezone.vn</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-300">
                  <span className="text-xl mt-0.5">💬</span>
                  <div>
                    <strong className="block mb-1 text-slate-900 dark:text-slate-100 text-sm font-medium">Chat online:</strong>
                    <p className="m-0 text-xs text-slate-600 dark:text-slate-400">Messenger, Zalo, Telegram</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-7 fade-in-up-6">
              <button
                className="py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 inline-block text-center bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40"
                onClick={onBackToProducts}
              >
                🛍️ Tiếp tục mua sắm
              </button>

              <button
                className="py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 inline-block text-center bg-slate-600 text-white hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-600/40"
                onClick={() => window.print()}
              >
                🖨️ In thông tin đơn hàng
              </button>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 fade-in-up-7">
              <p className="m-0 text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                💙 <strong>Cảm ơn bạn đã tin tưởng TuneZone!</strong><br />
                Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng cao và dịch vụ tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

PaymentComplete.propTypes = {
  onBackToProducts: PropTypes.func.isRequired
}

export default PaymentComplete