import { useNavigate } from 'react-router-dom'
import PaymentComplete from '../components/PaymentComplete'

const PaymentCompletePage = () => {
  const navigate = useNavigate()

  const handleBackToProducts = () => {
    navigate('/products')
  }

  return <PaymentComplete onBackToProducts={handleBackToProducts} />
}

export default PaymentCompletePage