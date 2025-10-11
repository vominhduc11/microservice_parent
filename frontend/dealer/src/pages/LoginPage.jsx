/**
 * @fileoverview Login page component with authentication and password recovery functionality
 * @module pages/LoginPage
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { authAPI, handleAPIError } from '../services/api'
import { Music, Lock, User, AlertCircle, LogIn, Mail, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { fadeInDownVariants, fadeInUpVariants, scaleInVariants } from '../utils/animations'
import { showSuccess, showError, showAPIError } from '../utils/toast'

/**
 * Login page with authentication form and password recovery
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onLogin - Callback function when login is successful
 * @returns {JSX.Element} Rendered login page
 * @example
 * <LoginPage onLogin={(userData) => handleUserLogin(userData)} />
 */
const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                     document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }

    checkDarkMode()

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkDarkMode)

    return () => mediaQuery.removeEventListener('change', checkDarkMode)
  }, [])

  /**
   * Handles input field changes in the login form
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  /**
   * Handles login form submission
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password
      })

      onLogin(response.data)
      setFormData({ username: '', password: '', rememberMe: false })
      showSuccess('Đăng nhập thành công! Chào mừng bạn trở lại.')
      navigate('/products')
    } catch (error) {
      const errorInfo = handleAPIError(error, false)
      setError(errorInfo.message)
      showAPIError(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles forgot password form submission
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')

    try {
      await authAPI.forgotPassword(forgotEmail)
      setForgotSuccess(true)
      showSuccess('Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư.')
    } catch (error) {
      const errorInfo = handleAPIError(error, false)
      setForgotError(errorInfo.message)
      showAPIError(error, 'Không thể gửi email khôi phục. Vui lòng thử lại.')
    } finally {
      setForgotLoading(false)
    }
  }

  /**
   * Handles navigation back to login form from forgot password
   */
  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setForgotSuccess(false)
    setForgotError('')
  }

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/pexels-padrinan-255379.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        {/* Login Card */}
        <div className="bg-white/98 dark:bg-slate-800/98 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-slate-700/50">
          {/* Logo & Title Section */}
          <motion.div
            className="text-center mb-8"
            variants={fadeInDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mb-4 shadow-lg shadow-primary-500/30">
              <Music className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              TuneZone <span className="text-primary-600 dark:text-primary-400">Dealer</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Đăng nhập để truy cập hệ thống quản lý
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-11 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-2 focus:ring-primary-500/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium select-none">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                disabled={isLoading}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Forgot Password Form */}
            {showForgotPassword && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-slide-down">
                {forgotSuccess ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                      Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.
                    </p>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold mt-1"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        Nhập email để nhận link khôi phục
                      </p>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Email của bạn"
                        required
                        disabled={forgotLoading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleForgotPassword(e)
                          }
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                    {forgotError && (
                      <p className="text-xs text-red-600 dark:text-red-400">{forgotError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        'Gửi email khôi phục'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium m-0">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              © 2024 TuneZone. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 200px;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out 0.1s both;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired
}

export default LoginPage
