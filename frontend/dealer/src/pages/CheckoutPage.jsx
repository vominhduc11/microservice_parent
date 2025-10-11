/**
 * @fileoverview Checkout page component for processing orders
 * @module pages/CheckoutPage
 */

import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm'
import { useCart } from '../context/CartContext'

/**
 * Checkout page component for order processing and payment selection
 * @component
 * @returns {JSX.Element} Rendered checkout page
 * @example
 * <CheckoutPage />
 */
const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, getTotalAmount, clearCart, setOrderData } = useCart()

  /**
   * Handles payment later option - clears cart and navigates to completion
   */
  const handlePaymentLater = () => {
    clearCart()
    navigate('/payment-complete')
  }

  /**
   * Handles immediate payment option - saves order data and navigates to QR payment
   * @param {Object} orderData - Order information for payment processing
   */
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