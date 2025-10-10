import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import Breadcrumb from './Breadcrumb'
import { CartProvider } from '../context/CartContext'
import { pageVariants } from '../utils/animations'

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
      <div className="bg-slate-50 dark:bg-slate-900 w-full min-h-screen flex flex-col relative transition-colors duration-300">
        <Header
          dealerInfo={dealerInfo}
          onLogout={onLogout}
          currentPage={currentPage}
        />
        <Breadcrumb />
        <main className="main-content flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="relative w-full min-h-[calc(100vh-180px)] pb-20 md:pb-0"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default DashboardLayout