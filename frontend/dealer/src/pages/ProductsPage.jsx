/**
 * @fileoverview Products page component displaying list of available products
 * @module pages/ProductsPage
 */

import { useNavigate } from 'react-router-dom'
import ProductList from '../components/ProductList'

/**
 * Products page component that displays the product catalog
 * @component
 * @returns {JSX.Element} Rendered products page with product list
 * @example
 * <ProductsPage />
 */
const ProductsPage = () => {
  const navigate = useNavigate()

  /**
   * Handles product click to navigate to product detail page
   * @param {Object} product - Product object
   * @param {number} product.id - Product ID
   */
  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`, { state: { product } })
  }

  return <ProductList onProductClick={handleProductClick} />
}

export default ProductsPage