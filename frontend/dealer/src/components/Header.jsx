import { useNavigate } from 'react-router-dom'
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
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-md dark:shadow-slate-800/50 z-50 w-full transition-all duration-300">
        <div className="max-w-screen-5xl mx-auto flex items-center justify-between h-[70px] sm:h-[75px] md:h-[80px] lg:h-[85px] xl:h-[90px] 2xl:h-[95px] 3xl:h-[100px] 4xl:h-[120px] 5xl:h-[140px] min-h-[70px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
          <div className="logo cursor-pointer" onClick={() => navigate('/products')}>
            <h2 className="m-0 text-primary-500 dark:text-primary-400 text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-semibold transition-colors duration-300 hover:text-primary-600 dark:hover:text-primary-300">TuneZone Dealer</h2>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 4xl:gap-5 5xl:gap-6 flex-shrink-0">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-1.5 md:gap-2 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-3.5 4xl:gap-4 5xl:gap-5 px-3 md:px-4 lg:px-4 xl:px-5 2xl:px-6 3xl:px-7 4xl:px-8 5xl:px-10 py-2 md:py-2.5 lg:py-2.5 xl:py-3 2xl:py-3.5 3xl:py-4 4xl:py-5 5xl:py-6 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-slate-600 dark:text-slate-300 no-underline relative min-w-fit whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    currentPage === item.id ? 'bg-primary-100 dark:bg-primary-600 text-primary-800 dark:text-white scale-105 shadow-lg shadow-primary-100/40 dark:shadow-primary-600/30' : ''
                  }`}
                  onClick={() => handleNavigation(item.id)}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                  title={`Chuyển đến trang ${item.label}`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                  <span className="font-medium text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10 pointer-events-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
          
          <div className="flex items-center gap-2 md:gap-3 lg:gap-3 xl:gap-4 2xl:gap-4 3xl:gap-5 4xl:gap-6 5xl:gap-8">
            <span className="hidden md:block font-medium text-slate-900 dark:text-white text-sm md:text-sm lg:text-base xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">{dealerInfo?.name}</span>
            <ThemeToggle />
            <button
              className="flex items-center gap-2 px-3 md:px-4 lg:px-4 xl:px-4 2xl:px-5 3xl:px-6 4xl:px-7 5xl:px-8 py-1.5 md:py-2 lg:py-2 xl:py-2 2xl:py-2.5 3xl:py-3 4xl:py-3.5 5xl:py-4 border-none rounded-lg text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl 5xl:text-2xl cursor-pointer transition-all duration-300 no-underline text-center bg-slate-600 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500/50"
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 5xl:w-7 5xl:h-7" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 shadow-lg shadow-black/10 dark:shadow-black/30 z-50 pb-safe">
        <div className="flex justify-around items-center max-w-full mx-auto px-2 sm:px-2.5 py-2 sm:py-2.5">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={`bottom-${item.id}`}
                className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-transparent border-none cursor-pointer transition-all duration-300 text-slate-600 dark:text-slate-300 no-underline relative min-w-[55px] sm:min-w-[65px] hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  currentPage === item.id ? 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30' : ''
                }`}
                onClick={() => handleNavigation(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
                title={`Chuyển đến trang ${item.label}`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] sm:text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-0 right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold z-10">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Header