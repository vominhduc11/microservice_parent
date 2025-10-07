import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cart from '../components/Cart'
import { useCart } from '../context/CartContext'
import { ordersAPI, getDealerInfo, handleAPIError } from '../services/api'

const CartPage = () => {
  const navigate = useNavigate()
  const { cart, updateCartItem, removeFromCart, getTotalAmount, clearCart, refreshCart, isLoadingProductInfo } = useCart()

  // Refresh cart data when page loads
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const handleCheckout = async () => {
    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    if (cart.length === 0) {
      console.error('Cart is empty')
      return
    }

    try {
      console.log('🔥 Starting checkout process...')

      // 1. Prepare order data theo format API
      const orderData = {
        idDealer: dealerInfo.accountId,
        orderItems: cart.map(item => ({
          idProduct: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity
        }))
      }

      console.log('🔥 Order data to send:', orderData)

      // 2. Tạo đơn hàng trước
      const orderResponse = await ordersAPI.create(orderData)
      console.log('✅ Order created successfully:', orderResponse)

      // 3. Xóa giỏ hàng sau khi tạo đơn hàng thành công
      await clearCart()
      console.log('✅ Cart cleared successfully')

      // 4. Navigate to success page với thông tin đơn hàng từ API
      navigate('/order-success', {
        state: {
          orderData: orderResponse.data,
          success: true
        },
        replace: true
      })

    } catch (error) {
      console.error('❌ Checkout failed:', error)
      handleAPIError(error)
      // Không navigate nếu có lỗi, để user có thể thử lại
    }
  }

  return (
    <Cart
      cart={cart}
      onUpdateItem={updateCartItem}
      onRemoveItem={removeFromCart}
      onCheckout={handleCheckout}
      totalAmount={getTotalAmount()}
      isLoadingProductInfo={isLoadingProductInfo}
    />
  )
}

export default CartPage