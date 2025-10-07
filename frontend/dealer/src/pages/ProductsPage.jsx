import { useNavigate } from 'react-router-dom'
import ProductList from '../components/ProductList'

const ProductsPage = () => {
  const navigate = useNavigate()

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`, { state: { product } })
  }

  return <ProductList onProductClick={handleProductClick} />
}

export default ProductsPage