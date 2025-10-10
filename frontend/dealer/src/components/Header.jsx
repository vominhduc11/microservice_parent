import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import ThemeToggle from './ThemeToggle'
import { Smartphone, Package, ShoppingCart, Shield, LogOut } from 'lucide-react'

const Header = ({ dealerInfo, onLogout, currentPage }) => {
  const navigate = useNavigate()
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const navItems = [
    { id: 'products', label: <strong>Sản phẩm</strong>, icon: Smartphone },
    { id: 'orders', label: 'Đơn hàng', icon: Package },
    { id: 'cart', label: 'Giỏ hàng', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null },
    { id: 'warranty', label: 'Bảo hành', icon: Shield }
  ]

  const handleNavigation = (itemId) => {
    switch (itemId) {
      case 'products':
        navigate('/products')
        break
      case 'orders':
        navigate('/orders')
        break
      case 'cart':
        navigate('/cart')
        break
      case 'warranty':
        navigate('/warranty')
        break
      default:
        navigate('/products')
    }
  }

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-900/20 z-50 w-full transition-all duration-300 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-18 lg:h-20 px-4 md:px-6 lg:px-8">
          <div className="logo cursor-pointer flex items-center gap-2 group" onClick={() => navigate('/products')}>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="m-0 text-slate-900 dark:text-white text-lg md:text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              TuneZone <span className="font-normal text-slate-600 dark:text-slate-400">Dealer</span>
            </h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 lg:gap-2 flex-shrink-0">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <motion.button
                  key={item.id}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 no-underline relative whitespace-nowrap font-medium text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  onClick={() => handleNavigation(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={`Chuyển đến trang ${item.label}`}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block font-medium text-slate-700 dark:text-slate-300 text-sm">{dealerInfo?.name}</span>
            <ThemeToggle />
            <motion.button
              className="flex items-center gap-2 px-3 lg:px-4 py-2 border-none rounded-lg text-sm cursor-pointer transition-all duration-200 no-underline text-center bg-slate-600 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500/50 font-medium"
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-900/30 z-50 pb-safe">
        <div className="flex justify-around items-center max-w-full mx-auto px-2 py-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={`bottom-${item.id}`}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-transparent border-none cursor-pointer transition-all duration-200 no-underline relative min-w-[70px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => handleNavigation(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={`Chuyển đến trang ${item.label}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Header