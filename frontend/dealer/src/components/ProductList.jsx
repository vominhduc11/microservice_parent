/**
 * @fileoverview Product list component with filtering, pagination and quick view
 * @module components/ProductList
 */

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { ProductGridSkeleton, LazyImage } from './LoadingStates'
import { NetworkError, EmptyState } from './ErrorHandling'
import QuickViewModal from './QuickViewModal'
import Pagination, { usePagination } from './Pagination'
import ProductFilters from './ProductFilters'
import { useNavigate } from 'react-router-dom'
import { productsAPI, handleAPIError } from '../services/api'
import { Smartphone, Filter, Eye, X, RotateCcw } from 'lucide-react'
import { containerVariants, itemVariants, cardHoverVariants } from '../utils/animations'

/**
 * Parses image URL from JSON string
 * @param {string} imageStr - JSON string containing image data
 * @returns {string} Image URL
 */
const parseImageUrl = (imageStr) => {
  try {
    const imageObj = JSON.parse(imageStr)
    return imageObj.imageUrl || ''
  } catch {
    return imageStr // fallback to original string if not JSON
  }
}

/**
 * Transforms API product data to frontend format
 * @param {Object} apiProduct - Product data from API
 * @param {number} stock - Available stock quantity
 * @returns {Object} Transformed product object
 */
const transformProduct = (apiProduct, stock = 0) => {
  return {
    id: apiProduct.id,
    sku: apiProduct.sku || `SCS-${apiProduct.id}`,
    name: apiProduct.name,
    price: apiProduct.price,
    image: parseImageUrl(apiProduct.image),
    description: apiProduct.shortDescription || '',
    stock: stock,
    warranty: 24 // Default 24 months warranty
  }
}

/**
 * Product list component displaying filterable grid of products
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onProductClick - Callback when product is clicked
 * @returns {JSX.Element} Rendered product list
 * @example
 * <ProductList onProductClick={(product) => handleProductClick(product)} />
 */
const ProductList = ({ onProductClick }) => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Load products from API
  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      if (cancelled) return

      try {
        setLoading(true)
        setError(null)

        const response = await productsAPI.getAll()

        if (cancelled) return

        // Fetch stock count for each product concurrently
        const stockPromises = response.data.map(async (product) => {
          try {
            const stockResponse = await productsAPI.getAvailableCount(product.id)
            return { id: product.id, stock: stockResponse.data }
          } catch (err) {
            console.warn(`Failed to fetch stock for product ${product.id}:`, err)
            return { id: product.id, stock: 0 }
          }
        })

        const stockResults = await Promise.allSettled(stockPromises)
        const stockMap = new Map()

        stockResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            stockMap.set(result.value.id, result.value.stock)
          } else {
            // Fallback to 0 if stock fetch failed
            stockMap.set(response.data[index].id, 0)
          }
        })

        if (cancelled) return

        const transformedProducts = response.data.map(product =>
          transformProduct(product, stockMap.get(product.id) || 0)
        )
        setProducts(transformedProducts)
      } catch (err) {
        if (!cancelled) {
          const errorInfo = handleAPIError(err, false)
          setError(errorInfo.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  // Handle quick view
  const handleQuickView = (e, product) => {
    e.stopPropagation()
    setQuickViewProduct(product)
    setShowQuickView(true)
  }

  const handleQuickViewClose = () => {
    setShowQuickView(false)
    setQuickViewProduct(null)
  }

  const handleViewDetails = () => {
    if (quickViewProduct) {
      navigate(`/products/${quickViewProduct.id}`)
      handleQuickViewClose()
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      )
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(price => {
        if (price.includes('+')) return [parseInt(price.replace('+', '')), Infinity]
        return parseInt(price)
      })
      
      if (max === undefined) {
        filtered = filtered.filter(product => product.price >= min)
      } else {
        filtered = filtered.filter(product => product.price >= min && product.price <= max)
      }
    }

    // Filter by category (mock implementation)
    if (filters.category) {
      // In real app, products would have category field
      filtered = filtered.filter(product => {
        if (filters.category === 'headphones') return product.name.includes('WH-')
        if (filters.category === 'earphones') return product.name.includes('WF-')
        if (filters.category === 'wireless') return product.name.includes('WF-') || product.name.includes('WH-')
        return true
      })
    }

    // Filter by brand (mock implementation)
    if (filters.brand) {
      if (filters.brand === 'sony') {
        filtered = filtered.filter(product => product.name.toLowerCase().includes('sony'))
      }
    }

    // Filter by availability
    if (filters.availability) {
      if (filters.availability === 'in-stock') {
        filtered = filtered.filter(product => product.stock > 10)
      } else if (filters.availability === 'low-stock') {
        filtered = filtered.filter(product => product.stock <= 10 && product.stock > 0)
      } else if (filters.availability === 'out-of-stock') {
        filtered = filtered.filter(product => product.stock === 0)
      }
    }

    // Filter by warranty
    if (filters.warranty) {
      const warrantyMonths = parseInt(filters.warranty)
      filtered = filtered.filter(product => product.warranty >= warrantyMonths)
    }

    // Sort products
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[filters.sortBy]
        let bValue = b[filters.sortBy]
        
        if (filters.sortBy === 'name') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [products, filters])

  // Pagination logic
  const {
    currentPage,
    totalPages,
    totalItems,
    currentItems: paginatedProducts,
    goToPage
  } = usePagination(filteredProducts, 8) // 8 products per page

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleRetry = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <div className="pt-16 md:pt-18 lg:pt-20 pb-8 max-w-7xl mx-auto px-4">
        <NetworkError onRetry={handleRetry} message={error} />
      </div>
    )
  }


  return (
    <div className="pt-16 md:pt-18 lg:pt-20 pb-8 max-w-7xl mx-auto px-0">
      {/* Header */}
      <div className="mb-6 py-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 sticky top-16 md:top-18 lg:top-20 z-10 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                Sản Phẩm
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{filteredProducts.length} sản phẩm</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
              showFilters
                ? 'bg-primary-600 text-white border-primary-600 shadow-primary-200 dark:shadow-primary-900/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Bộ lọc</span>
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mobile Filters Overlay */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bộ lọc</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <ProductFilters 
                  onFiltersChange={handleFiltersChange}
                  totalProducts={products.length}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6 px-4 md:px-6 lg:px-8">
          {/* Desktop Filters Sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-32">
                <ProductFilters
                  onFiltersChange={handleFiltersChange}
                  totalProducts={products.length}
                />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : filteredProducts.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 w-full"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
            {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft overflow-hidden cursor-pointer group relative border border-slate-200 dark:border-slate-700"
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onProductClick(product)}
            >
              {/* Quick View Button */}
              <button
                onClick={(e) => handleQuickView(e, product)}
                className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-700 dark:text-slate-300 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 shadow-md hover:shadow-lg"
                title="Xem nhanh"
              >
                <Eye className="w-5 h-5" />
              </button>

              <div className="relative h-52 overflow-hidden bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center">
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-4"
                  placeholder={<Smartphone className="w-16 h-16 text-slate-300 dark:text-slate-600" />}
                />
                {product.sku && !product.sku.startsWith('SCS-') && (
                  <div className="absolute top-3 left-3 bg-primary-600/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs rounded-lg font-medium shadow-md">
                    {product.sku}
                  </div>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <div className="absolute top-3 right-3 bg-warning-500/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs rounded-lg font-medium shadow-md">
                    Sắp hết
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(product.price)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1.5 font-medium ${product.stock > 10 ? 'text-success-600 dark:text-success-400' : product.stock > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-danger-600 dark:text-danger-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-success-500' : product.stock > 0 ? 'bg-warning-500' : 'bg-danger-500'}`}></div>
                      Còn {product.stock}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      BH: {product.warranty}th
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalItems}
                      itemsPerPage={8}
                      onPageChange={goToPage}
                      className="justify-center"
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon="🔍"
                title="Không tìm thấy sản phẩm"
                description="Không có sản phẩm nào phù hợp với bộ lọc của bạn."
                action={
                  <button
                    onClick={() => setFilters({})}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Xóa bộ lọc
                  </button>
                }
              />
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={handleQuickViewClose}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  )
}

ProductList.propTypes = {
  onProductClick: PropTypes.func.isRequired
}

export default ProductList