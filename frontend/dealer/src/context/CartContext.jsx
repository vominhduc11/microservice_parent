import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { cartAPI, productsAPI, getDealerInfo, handleAPIError } from '../services/api'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProductInfo, setIsLoadingProductInfo] = useState(false)
  const productInfoCacheRef = useRef(new Map())

  // Utility function to get image URL from JSON string or direct URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null

    // If it's already a URL string
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData
    }

    // If it's a JSON string, parse it
    if (typeof imageData === 'string' && imageData.startsWith('{')) {
      try {
        const parsed = JSON.parse(imageData)
        return parsed.imageUrl || null
      } catch (error) {
        console.warn('Failed to parse image JSON:', error)
        return null
      }
    }

    return null
  }

  // Helper function to enrich cart items with product information
  const enrichCartWithProductInfo = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return cartItems

    // Check if all items already have required info
    const needsEnrichment = cartItems.some(item =>
      !item.name || !item.image || !item.shortDescription || !item.price
    )

    if (!needsEnrichment) {
      return cartItems
    }


    setIsLoadingProductInfo(true)
    try {
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productId = item.productId || item.id

            // Check cache first
            if (productInfoCacheRef.current.has(productId)) {
              const cachedInfo = productInfoCacheRef.current.get(productId)
              return {
                ...item,
                name: cachedInfo.name || item.name,
                image: getImageUrl(cachedInfo.image) || getImageUrl(item.image),
                description: cachedInfo.shortDescription || item.description || item.shortDescription,
                price: cachedInfo.price || item.price
              }
            }

            // Skip API call if item already has all required info
            if (item.name && item.image && item.shortDescription && item.price) {
              return item
            }

            const response = await productsAPI.getBasicInfo(productId, 'name,image,shortDescription,price')
            const productInfo = response.data || {}

            // Cache the result
            productInfoCacheRef.current.set(productId, productInfo)

            return {
              ...item,
              name: productInfo.name || item.name,
              image: getImageUrl(productInfo.image) || getImageUrl(item.image),
              description: productInfo.shortDescription || item.description || item.shortDescription,
              price: productInfo.price || item.price
            }
          } catch (error) {
            console.warn(`Failed to fetch product info for ${item.productId || item.id}:`, error)
            return item // Return original item if product fetch fails
          }
        })
      )
      return enrichedItems
    } catch (error) {
      console.error('Failed to enrich cart items:', error)
      return cartItems // Return original items if enrichment fails
    } finally {
      setIsLoadingProductInfo(false)
    }
  }, [])

  // Load cart from server when component mounts
  useEffect(() => {
    const loadCart = async () => {
      const dealerInfo = getDealerInfo()
      if (!dealerInfo?.accountId) {
        return
      }

      try {
        setIsLoading(true)
        const response = await cartAPI.getAll(dealerInfo.accountId)
        console.log('🛒 Cart API Response:', response)

        if (response && response.success && response.data && response.data.items) {
          // Handle new API response format: response.data.items contains the cart items
          const cartData = response.data.items || []
          console.log('📦 Raw cart data:', cartData)

          // Transform API cart items to expected format
          const transformedCartData = cartData.map(item => ({
            id: item.cartId,           // ✅ Use cartId as unique identifier
            cartId: item.cartId,       // ✅ Keep cartId for API operations
            productId: item.productId, // ✅ Keep productId for product info
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            price: item.unitPrice,     // Fallback for price field
            subtotal: item.subtotal,
            addedAt: item.addedAt
          }))

          console.log('🔄 Transformed cart data:', transformedCartData)

          // Enrich cart items with product information
          const enrichedCart = await enrichCartWithProductInfo(transformedCartData)
          setCart(enrichedCart)
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
        // Don't show error notification for initial load
        setCart([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const addToCart = async (product, quantity = 1, unitPrice = null) => {
    console.log('🔥 CartContext.addToCart CALLED with:')
    console.log('product.id:', product.id)
    console.log('quantity:', quantity)
    console.log('unitPrice (received):', unitPrice)
    console.log('product.price:', product.price)

    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    try {
      setIsLoading(true)

      // Use provided unitPrice or fallback to product.price
      const priceToUse = unitPrice !== null ? unitPrice : product.price
      console.log('💸 priceToUse:', priceToUse)
      console.log('💸 priceToUse calculation: unitPrice !== null?', unitPrice !== null, 'unitPrice:', unitPrice, 'product.price:', product.price)

      // Call API to add to cart
      const _requestBody = {
        dealerId: dealerInfo.accountId,
        productId: product.id,
        quantity: quantity,
        unitPrice: priceToUse
      }

      await cartAPI.add(dealerInfo.accountId, product.id, quantity, priceToUse)

      // Refresh cart from server to ensure consistency
      const response = await cartAPI.getAll(dealerInfo.accountId)
      if (response && response.success && response.data && response.data.items) {
        const cartData = response.data.items || []
        const transformedCartData = cartData.map(item => ({
          id: item.cartId,           // ✅ Use cartId as unique identifier
          cartId: item.cartId,       // ✅ Keep cartId for API operations
          productId: item.productId, // ✅ Keep productId for product info
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.unitPrice,     // Fallback for price field
          subtotal: item.subtotal,
          addedAt: item.addedAt
        }))
        const enrichedCart = await enrichCartWithProductInfo(transformedCartData)
        setCart(enrichedCart)
      }
    } catch (error) {
      handleAPIError(error)
      // Still update local cart as fallback
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id)
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        return [...prevCart, { ...product, quantity }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCartItem = (cartId, action, quantity = null) => {
    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    // Find current item in cart
    const currentItem = cart.find(item => item.cartId === cartId)
    if (!currentItem) {
      console.error('Item not found in cart')
      return
    }

    // 1. Gọi API ngay lập tức (không đợi kết quả)
    const syncWithServer = async () => {
      try {
        switch (action) {
          case 'increment':
            cartAPI.updateQuantity.increment(cartId)
            break
          case 'decrement':
            if (currentItem.quantity <= 1) {
              cartAPI.remove(cartId)
            } else {
              cartAPI.updateQuantity.decrement(cartId)
            }
            break
          case 'set':
            if (quantity <= 0) {
              cartAPI.remove(cartId)
            } else {
              cartAPI.updateQuantity.set(cartId, quantity)
            }
            break
        }
      } catch (error) {
        console.error('Failed to sync cart with server:', error)
      }
    }

    // Gọi API ngay
    syncWithServer()

    // 2. Cập nhật giao diện ngay sau đó (optimistic update)
    setCart(prevCart => {
      switch (action) {
        case 'increment':
          return prevCart.map(item =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        case 'decrement':
          // Nếu quantity sẽ là 0 hoặc ít hơn, xóa item
          if (currentItem.quantity <= 1) {
            return prevCart.filter(item => item.cartId !== cartId)
          }
          return prevCart.map(item =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        case 'set':
          if (quantity <= 0) {
            return prevCart.filter(item => item.cartId !== cartId)
          }
          return prevCart.map(item =>
            item.cartId === cartId
              ? { ...item, quantity: quantity }
              : item
          )
        default:
          console.error('Invalid action:', action)
          return prevCart
      }
    })
  }

  const removeFromCart = async (cartId) => {
    console.log('🗑️ removeFromCart called with cartId:', cartId)
    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    try {
      setIsLoading(true)
      console.log('🔥 Calling cartAPI.remove with cartId:', cartId)
      await cartAPI.remove(cartId)

      // Refresh cart from server to ensure consistency
      const response = await cartAPI.getAll(dealerInfo.accountId)
      if (response && response.success && response.data && response.data.items) {
        const cartData = response.data.items || []
        const transformedCartData = cartData.map(item => ({
          id: item.cartId,           // ✅ Use cartId as unique identifier
          cartId: item.cartId,       // ✅ Keep cartId for API operations
          productId: item.productId, // ✅ Keep productId for product info
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.unitPrice,     // Fallback for price field
          subtotal: item.subtotal,
          addedAt: item.addedAt
        }))
        const enrichedCart = await enrichCartWithProductInfo(transformedCartData)
        setCart(enrichedCart)
      }
    } catch (error) {
      handleAPIError(error)
      // Still update local cart as fallback
      setCart(prevCart => prevCart.filter(item => item.cartId !== cartId))
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    try {
      setIsLoading(true)
      console.log('🔥 Clearing cart for dealerId:', dealerInfo.accountId)

      // Gọi API xóa giỏ hàng: DELETE /cart/dealer/{dealerId}
      await cartAPI.clear(dealerInfo.accountId)

      // Cập nhật local state ngay lập tức
      setCart([])
      console.log('✅ Cart cleared successfully')

    } catch (error) {
      console.error('❌ Failed to clear cart:', error)
      handleAPIError(error)
      // Vẫn cập nhật local state trong trường hợp lỗi
      setCart([])
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalAmount = () => {
    if (!Array.isArray(cart)) {
      return 0
    }
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
  }

  const getCartCount = () => {
    if (!Array.isArray(cart)) {
      return 0
    }
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const refreshCart = useCallback(async () => {
    const dealerInfo = getDealerInfo()
    if (!dealerInfo?.accountId) {
      console.error('No dealer info found')
      return
    }

    try {
      setIsLoading(true)
      const response = await cartAPI.getAll(dealerInfo.accountId)
      if (response && response.success && response.data && response.data.items) {
        const cartData = response.data.items || []
        const transformedCartData = cartData.map(item => ({
          id: item.cartId,           // ✅ Use cartId as unique identifier
          cartId: item.cartId,       // ✅ Keep cartId for API operations
          productId: item.productId, // ✅ Keep productId for product info
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.unitPrice,     // Fallback for price field
          subtotal: item.subtotal,
          addedAt: item.addedAt
        }))
        const enrichedCart = await enrichCartWithProductInfo(transformedCartData)
        setCart(enrichedCart)
      }
    } catch (error) {
      handleAPIError(error)
      setCart([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [enrichCartWithProductInfo])

  const value = {
    cart,
    orderData,
    setOrderData,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getCartCount,
    refreshCart,
    isLoading,
    isLoadingProductInfo
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}