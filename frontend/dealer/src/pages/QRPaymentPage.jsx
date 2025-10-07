import { useNavigate } from 'react-router-dom'
import QRPayment from '../components/QRPayment'
import { useCart } from '../context/CartContext'

const QRPaymentPage = () => {
  const navigate = useNavigate()
  const { orderData, clearCart } = useCart()

  const handlePaymentComplete = () => {
    clearCart()
    navigate('/payment-complete')
  }

  return (
    <QRPayment
      orderData={orderData}
      onPaymentComplete={handlePaymentComplete}
    />
  )
}

export default QRPaymentPage