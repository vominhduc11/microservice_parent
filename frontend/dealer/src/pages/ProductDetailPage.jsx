/**
 * @fileoverview Product detail page component with data fetching and transformation
 * @module pages/ProductDetailPage
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import ProductDetail from '../components/ProductDetail'
import { useCart } from '../context/CartContext'
import { productsAPI, handleAPIError } from '../services/api'

/**
 * Product detail page component that fetches and displays detailed product information
 * @component
 * @returns {JSX.Element} Rendered product detail page
 * @example
 * <ProductDetailPage />
 */
const ProductDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Parses image URL from JSON string
   * @param {string} imageStr - JSON string containing image data
   * @returns {string} Image URL or original string if parsing fails
   */
  const parseImageUrl = (imageStr) => {
    try {
      const imageObj = JSON.parse(imageStr)
      return imageObj.imageUrl || ''
    } catch (e) {
      return imageStr
    }
  }

  /**
   * Parses product descriptions from JSON string
   * @param {string} descriptionsStr - JSON string containing descriptions array
   * @returns {Array} Parsed descriptions array
   */
  const parseDescriptions = (descriptionsStr) => {
    try {
      return JSON.parse(descriptionsStr)
    } catch (e) {
      return []
    }
  }

  /**
   * Parses product videos from JSON string
   * @param {string} videosStr - JSON string containing videos array
   * @returns {Array} Parsed videos array
   */
  const parseVideos = (videosStr) => {
    try {
      return JSON.parse(videosStr)
    } catch (e) {
      return []
    }
  }

  /**
   * Parses product specifications from JSON string
   * @param {string} specificationsStr - JSON string containing specifications object
   * @returns {Object} Parsed specifications with general and technical properties
   */
  const parseSpecifications = (specificationsStr) => {
    try {
      return JSON.parse(specificationsStr)
    } catch (e) {
      return { general: [], technical: [] }
    }
  }

  /**
   * Parses wholesale pricing tiers from JSON string
   * @param {string} wholesalePriceStr - JSON string containing wholesale price array
   * @returns {Array} Parsed wholesale price tiers
   */
  const parseWholesalePrice = (wholesalePriceStr) => {
    try {
      return JSON.parse(wholesalePriceStr)
    } catch (e) {
      return []
    }
  }

  /**
   * Transforms API product data to frontend product format
   * @param {Object} apiProduct - Product data from API
   * @param {number} stock - Available stock quantity
   * @returns {Object} Transformed product object
   */
  const transformProduct = (apiProduct, stock = 0) => {
    return {
      id: apiProduct.id,
      sku: apiProduct.sku,
      name: apiProduct.name,
      price: apiProduct.price,
      image: parseImageUrl(apiProduct.image),
      description: apiProduct.shortDescription || '',
      descriptions: parseDescriptions(apiProduct.descriptions || '[]'),
      videos: parseVideos(apiProduct.videos || '[]'),
      specifications: parseSpecifications(apiProduct.specifications || '{}'),
      wholesalePrice: parseWholesalePrice(apiProduct.wholesalePrice || '[]'),
      stock: stock,
      warranty: 24,
      showOnHomepage: apiProduct.showOnHomepage,
      isFeatured: apiProduct.isFeatured,
      createdAt: apiProduct.createdAt,
      updateAt: apiProduct.updateAt
    }
  }

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        try {
          setLoading(true)
          setError(null)

          const [productResponse, stockResponse] = await Promise.allSettled([
            productsAPI.getById(id),
            productsAPI.getAvailableCount(id)
          ])

          if (productResponse.status === 'fulfilled') {
            const stock = stockResponse.status === 'fulfilled' ? stockResponse.value.data : 0
            const transformedProduct = transformProduct(productResponse.value.data, stock)
            setProduct(transformedProduct)
          } else {
            throw productResponse.reason
          }
        } catch (err) {
          const errorInfo = handleAPIError(err, false)
          setError(errorInfo.message)
        } finally {
          setLoading(false)
        }
      }

      loadProduct()
    }
  }, [id])

  /**
   * Handles navigation back to products page
   */
  const handleBack = () => {
    navigate('/products')
  }

  /**
   * Handles adding product to cart
   * @param {Object} product - Product to add to cart
   * @param {number} quantity - Quantity to add
   * @param {number} unitPrice - Unit price for the product
   */
  const handleAddToCart = (product, quantity, unitPrice) => {
    addToCart(product, quantity, unitPrice)
  }

  if (loading) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] pb-5 max-w-screen-5xl mx-auto px-4">
        <div className="flex justify-center items-center py-20">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-[70px] xl:pt-[80px] 2xl:pt-[90px] pb-5 max-w-screen-5xl mx-auto px-4">
        <div className="flex flex-col items-center py-20">
          <div className="text-lg text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProductDetail
      product={product}
      onBack={handleBack}
      onAddToCart={handleAddToCart}
    />
  )
}

export default ProductDetailPage