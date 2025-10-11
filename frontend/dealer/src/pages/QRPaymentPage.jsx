/**
 * @fileoverview QR payment page component for processing QR code payments
 * @module pages/QRPaymentPage
 */

import { useNavigate } from 'react-router-dom'
import QRPayment from '../components/QRPayment'
import { useCart } from '../context/CartContext'

/**
 * QR payment page component for handling QR code based payment flow
 * @component
 * @returns {JSX.Element} Rendered QR payment page
 * @example
 * <QRPaymentPage />
 */
const QRPaymentPage = () => {
  const navigate = useNavigate()
  const { orderData, clearCart } = useCart()

  /**
   * Handles payment completion by clearing cart and navigating to success page
   */
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