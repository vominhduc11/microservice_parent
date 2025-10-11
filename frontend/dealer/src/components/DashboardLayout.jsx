/**
 * @fileoverview Main dashboard layout component wrapping all dealer pages
 * @module components/DashboardLayout
 */

import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import Header from './Header'
import Footer from './Footer'
import Breadcrumb from './Breadcrumb'
import { CartProvider } from '../context/CartContext'
import { pageVariants } from '../utils/animations'

/**
 * Dashboard layout component providing consistent layout structure for all pages
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.dealerInfo - Dealer account information
 * @param {Function} props.onLogout - Logout callback function
 * @returns {JSX.Element} Rendered dashboard layout with nested routes
 * @example
 * <DashboardLayout
 *   dealerInfo={{ name: 'ABC Dealer' }}
 *   onLogout={() => handleLogout()}
 * />
 */
const DashboardLayout = ({ dealerInfo, onLogout }) => {
  const location = useLocation()

  /**
   * Determines current page identifier from pathname
   * @returns {string} Current page identifier
   */
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

DashboardLayout.propTypes = {
  dealerInfo: PropTypes.shape({
    name: PropTypes.string,
    accountId: PropTypes.number
  }),
  onLogout: PropTypes.func.isRequired
}

export default DashboardLayout