import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/queryClient'
import DashboardLayout from './components/DashboardLayout'
import LoginPage from './pages/LoginPage'

// Lazy load pages for better performance
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const PaymentCompletePage = lazy(() => import('./pages/PaymentCompletePage'))
const QRPaymentPage = lazy(() => import('./pages/QRPaymentPage'))
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))

// Import new components and utilities
import { ErrorBoundary } from './components/ErrorHandling'
import { SkipLink } from './components/AccessibleComponents'
import { initAccessibility } from './utils/accessibility'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dealerInfo, setDealerInfo] = useState(null)

  useEffect(() => {
    const savedLogin = localStorage.getItem('dealerLogin')
    if (savedLogin) {
      const loginData = JSON.parse(savedLogin)
      setIsLoggedIn(true)
      setDealerInfo(loginData)
    }

    // Scroll to top when app loads
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })

    // Initialize accessibility features
    initAccessibility()
  }, [])

  const handleLogin = (loginData) => {
    setIsLoggedIn(true)
    setDealerInfo(loginData)
    localStorage.setItem('dealerLogin', JSON.stringify(loginData))
  }

  const handleLogout = async () => {
    try {
      const { authAPI } = await import('./services/api')
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggedIn(false)
      setDealerInfo(null)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
            <div className="app">
            <SkipLink />
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                top: 20,
                right: 20,
              }}
              toastOptions={{
                // Default options for all toasts
                className: '',
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-text, #363636)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  maxWidth: '500px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                // Success toast style
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: 'var(--toast-success-bg, #ecfdf5)',
                    color: 'var(--toast-success-text, #065f46)',
                  },
                },
                // Error toast style
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: 'var(--toast-error-bg, #fef2f2)',
                    color: 'var(--toast-error-text, #991b1b)',
                  },
                  duration: 5000,
                },
                // Loading toast style
                loading: {
                  iconTheme: {
                    primary: '#6366f1',
                    secondary: '#fff',
                  },
                },
              }}
            />

            <Routes>
              {/* Login Route - accessible when not logged in */}
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/products" replace />
                  ) : (
                    <LoginPage onLogin={handleLogin} />
                  )
                }
              />

              {/* Protected Routes - only accessible when logged in */}
              {isLoggedIn ? (
                <Route path="/" element={<DashboardLayout dealerInfo={dealerInfo} onLogout={handleLogout} />}>
                  <Route index element={<Navigate to="/products" replace />} />
                  <Route path="products" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <ProductsPage />
                    </Suspense>
                  } />
                  <Route path="products/:id" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <ProductDetailPage />
                    </Suspense>
                  } />
                  <Route path="cart" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <CartPage />
                    </Suspense>
                  } />
                  <Route path="checkout" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <CheckoutPage />
                    </Suspense>
                  } />
                  <Route path="payment-complete" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <PaymentCompletePage />
                    </Suspense>
                  } />
                  <Route path="qr-payment" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <QRPaymentPage />
                    </Suspense>
                  } />
                  <Route path="warranty" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <WarrantyPage />
                    </Suspense>
                  } />
                  <Route path="order-success" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <OrderSuccessPage />
                    </Suspense>
                  } />
                  <Route path="orders" element={
                    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="text-lg">Loading...</div></div>}>
                      <OrdersPage />
                    </Suspense>
                  } />
                </Route>
              ) : (
                /* Redirect to login if not authenticated */
                <Route path="*" element={<Navigate to="/login" replace />} />
              )}
            </Routes>

          </div>
        </Router>
        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
