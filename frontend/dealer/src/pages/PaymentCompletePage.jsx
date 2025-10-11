/**
 * @fileoverview Payment completion page component
 * @module pages/PaymentCompletePage
 */

import { useNavigate } from 'react-router-dom'
import PaymentComplete from '../components/PaymentComplete'

/**
 * Payment completion page component displaying payment success message
 * @component
 * @returns {JSX.Element} Rendered payment complete page
 * @example
 * <PaymentCompletePage />
 */
const PaymentCompletePage = () => {
  const navigate = useNavigate()

  /**
   * Handles navigation back to products page
   */
  const handleBackToProducts = () => {
    navigate('/products')
  }

  return <PaymentComplete onBackToProducts={handleBackToProducts} />
}

export default PaymentCompletePage