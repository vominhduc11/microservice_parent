import { Link, useLocation } from 'react-router-dom'

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getBreadcrumbName = (pathname, index) => {
    
    switch (pathname) {
      case 'products':
        return { name: 'Sản phẩm', icon: '📱' }
      case 'cart':
        return { name: 'Giỏ hàng', icon: '🛒' }
      case 'checkout':
        return { name: 'Thanh toán', icon: '💳' }
      case 'warranty':
        return { name: 'Bảo hành', icon: '🛡️' }
      case 'payment-complete':
        return { name: 'Hoàn thành', icon: '✅' }
      case 'qr-payment':
        return { name: 'Thanh toán QR', icon: '📲' }
      default:
        // For product details, try to get product name from URL or show ID
        if (pathnames[0] === 'products' && index === 1) {
          return { name: `Chi tiết sản phẩm #${pathname}`, icon: '🔍' }
        }
        return { name: pathname.charAt(0).toUpperCase() + pathname.slice(1), icon: '📄' }
    }
  }

  const generatePath = (index) => {
    return '/' + pathnames.slice(0, index + 1).join('/')
  }

  if (pathnames.length === 0) return null

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 py-3 sticky top-[70px] xl:top-[80px] 2xl:top-[90px] 3xl:top-[100px] 4xl:top-[120px] 5xl:top-[140px] z-40">
      <div className="max-w-screen-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home breadcrumb */}
          <li>
            <Link 
              to="/products" 
              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
            >
              <span className="text-base">🏠</span>
              <span>Trang chủ</span>
            </Link>
          </li>

          {/* Dynamic breadcrumbs */}
          {pathnames.map((pathname, index) => {
            const { name, icon } = getBreadcrumbName(pathname, index)
            const path = generatePath(index)
            const isLast = index === pathnames.length - 1

            return (
              <li key={path} className="flex items-center">
                <span className="mx-2 text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {isLast ? (
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-semibold">
                    <span className="text-base">{icon}</span>
                    <span>{name}</span>
                  </span>
                ) : (
                  <Link
                    to={path}
                    className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                  >
                    <span className="text-base">{icon}</span>
                    <span>{name}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default Breadcrumb