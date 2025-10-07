import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Breadcrumb from './Breadcrumb'
import { CartProvider } from '../context/CartContext'

const DashboardLayout = ({ dealerInfo, onLogout }) => {
  const location = useLocation()
  
  // Get current page from pathname for header active state
  const getCurrentPage = () => {
    const path = location.pathname
    
    // Products section (includes product list and detail)
    if (path.startsWith('/products')) return 'products'
    
    // Cart section (includes cart, checkout, payment flows)
    if (path.startsWith('/cart') || 
        path.startsWith('/checkout') || 
        path.startsWith('/payment-complete') || 
        path.startsWith('/qr-payment')) {
      return 'cart'
    }
    
    // Warranty section
    if (path.startsWith('/warranty')) return 'warranty'
    
    // Default to products
    return 'products'
  }

  const currentPage = getCurrentPage()

  // Scroll to top when route changes
  useEffect(() => {
    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
    }
  }, [location.pathname])

  return (
    <CartProvider>
      <div className="bg-slate-50 dark:bg-slate-900 w-full relative transition-colors duration-300">
        <Header
          dealerInfo={dealerInfo}
          onLogout={onLogout}
          currentPage={currentPage}
        />
        <Breadcrumb />
        <main className="main-content">
          <div key={location.pathname} className="relative w-full min-h-[calc(100vh-140px)] pb-20 md:pb-0 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default DashboardLayout