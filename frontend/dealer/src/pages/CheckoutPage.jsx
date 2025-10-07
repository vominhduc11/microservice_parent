import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm'
import { useCart } from '../context/CartContext'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, getTotalAmount, clearCart, setOrderData } = useCart()

  const handlePaymentLater = () => {
    clearCart()
    navigate('/payment-complete')
  }

  const handlePaymentNow = (orderData) => {
    setOrderData(orderData)
    navigate('/qr-payment')
  }

  return (
    <CheckoutForm
      cart={cart}
      totalAmount={getTotalAmount()}
      onPaymentLater={handlePaymentLater}
      onPaymentNow={handlePaymentNow}
    />
  )
}

export default CheckoutPage