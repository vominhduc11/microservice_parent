import { useState, useEffect } from 'react'
import { productsAPI, warrantyAPI, ordersAPI, getDealerInfo, handleAPIError } from '../services/api'
import './WarrantyRegistration.css'

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'iPhone 15 Pro Max', warranty: 12 },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', warranty: 12 },
  { id: 3, name: 'MacBook Pro M3', warranty: 24 },
  { id: 4, name: 'Dell XPS 13', warranty: 24 },
  { id: 5, name: 'iPad Pro 12.9"', warranty: 12 },
  { id: 6, name: 'AirPods Pro 2', warranty: 12 },
  { id: 7, name: 'Apple Watch Series 9', warranty: 12 },
  { id: 8, name: 'Sony WH-1000XM5', warranty: 12 }
]

const WarrantyRegistration = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    productId: '',
    purchaseDate: '',
    serialNumbers: [''] // Array of serial numbers
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [warrantyCode, setWarrantyCode] = useState('')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [_availableSerials, setAvailableSerials] = useState([])
  const [soldSerials, setSoldSerials] = useState([])
  const [loadingSerials, setLoadingSerials] = useState(false)
  const [selectedSerials, setSelectedSerials] = useState([])
  const [_serialViewMode, _setSerialViewMode] = useState('ALLOCATED_TO_DEALER') // 'IN_STOCK' or 'ALLOCATED_TO_DEALER'


  // Fetch purchased products from API on mount
  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      try {
        setLoadingProducts(true)
        const dealerInfo = getDealerInfo()

        if (!dealerInfo?.accountId) {
          console.error('No dealer info found')
          setProducts([])
          return
        }

        const response = await ordersAPI.getPurchasedProducts(dealerInfo.accountId)

        if (response.success && response.data) {
          // Transform API data to match our product structure
          const transformedProducts = response.data.map((product) => ({
            id: product.id, // Use real ID from API
            name: product.name,
            warranty: 12 // Default warranty period
          }))
          setProducts(transformedProducts)
        } else {
          console.error('Failed to fetch purchased products:', response)
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching purchased products:', error)
        handleAPIError(error, false)
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchPurchasedProducts()
  }, [])

  // Fetch serials when product is selected
  useEffect(() => {
    const fetchProductSerials = async () => {
      if (!formData.productId) {
        setAvailableSerials([])
        setSoldSerials([])
        setSelectedSerials([])
        return
      }

      try {
        setLoadingSerials(true)
        const dealerInfo = getDealerInfo()

        if (!dealerInfo?.accountId) {
          console.error('No dealer info found')
          setSoldSerials([])
          return
        }

        // Fetch serials allocated to this dealer for this product
        const response = await productsAPI.getSerialsByDealer(formData.productId, dealerInfo.accountId)

        if (response.success && response.data) {
          setSoldSerials(response.data)
        } else {
          console.error('Failed to fetch dealer serials:', response)
          setSoldSerials([])
        }

        setAvailableSerials([]) // Not needed anymore as we only show dealer serials
        setSelectedSerials([]) // Reset selected serials when product changes
      } catch (error) {
        console.error('Error fetching dealer serials:', error)
        handleAPIError(error, false)
        setSoldSerials([])
      } finally {
        setLoadingSerials(false)
      }
    }

    fetchProductSerials()
  }, [formData.productId])


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const _handleSerialChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      serialNumbers: prev.serialNumbers.map((serial, i) =>
        i === index ? value : serial
      )
    }))

    // Clear serial number errors
    if (errors.serialNumbers) {
      setErrors(prev => ({
        ...prev,
        serialNumbers: ''
      }))
    }
  }

  const _addSerialField = () => {
    setFormData(prev => ({
      ...prev,
      serialNumbers: [...prev.serialNumbers, '']
    }))
  }

  const _removeSerialField = (index) => {
    if (formData.serialNumbers.length > 1) {
      setFormData(prev => ({
        ...prev,
        serialNumbers: prev.serialNumbers.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSerialSelect = (serialData) => {
    if (selectedSerials.some(s => s.id === serialData.id)) {
      // Deselect
      setSelectedSerials(prev => prev.filter(s => s.id !== serialData.id))
    } else {
      // Select
      setSelectedSerials(prev => [...prev, serialData])
    }

    // Update formData.serialNumbers to match selected serials
    const newSerialNumbers = selectedSerials.some(s => s.id === serialData.id)
      ? selectedSerials.filter(s => s.id !== serialData.id).map(s => s.serial)
      : [...selectedSerials, serialData].map(s => s.serial)

    // Ensure at least one empty field if no serials selected
    setFormData(prev => ({
      ...prev,
      serialNumbers: newSerialNumbers.length > 0 ? newSerialNumbers : ['']
    }))

    // Clear serial errors
    if (errors.serialNumbers) {
      setErrors(prev => ({
        ...prev,
        serialNumbers: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Customer name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập họ tên khách hàng'
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Họ tên phải có ít nhất 2 ký tự'
    }
    
    // Phone validation
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Vui lòng nhập số điện thoại'
    } else {
      const phonePattern = /^(\+84|84|0)(3[2-9]|5[6-9]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/
      if (!phonePattern.test(formData.customerPhone.replace(/\s/g, ''))) {
        newErrors.customerPhone = 'Số điện thoại không hợp lệ (VD: 0912345678)'
      }
    }
    
    // Email validation
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Vui lòng nhập email'
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Email không hợp lệ (VD: example@gmail.com)'
      }
    }
    
    // Address validation
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Vui lòng nhập địa chỉ khách hàng'
    } else if (formData.customerAddress.trim().length < 10) {
      newErrors.customerAddress = 'Địa chỉ phải có ít nhất 10 ký tự'
    }
    
    // Product validation
    if (!formData.productId) {
      newErrors.productId = 'Vui lòng chọn sản phẩm'
    }
    
    // Purchase date validation
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Vui lòng chọn ngày mua'
    } else {
      const purchaseDate = new Date(formData.purchaseDate)
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 2)
      
      if (purchaseDate > today) {
        newErrors.purchaseDate = 'Ngày mua không thể là ngày tương lai'
      } else if (purchaseDate < oneYearAgo) {
        newErrors.purchaseDate = 'Ngày mua không thể quá 2 năm trước đây'
      }
    }
    
    // Serial numbers validation
    const validSerials = formData.serialNumbers.filter(serial => serial.trim() !== '')
    if (validSerials.length === 0) {
      newErrors.serialNumbers = 'Vui lòng nhập ít nhất một số serial'
    } else {
      // Check if all serial numbers are valid
      const invalidSerials = validSerials.filter(serial => serial.trim().length < 5)
      if (invalidSerials.length > 0) {
        newErrors.serialNumbers = 'Tất cả số serial phải có ít nhất 5 ký tự'
      }

      // Check for duplicate serial numbers
      const serialSet = new Set(validSerials.map(s => s.trim().toLowerCase()))
      if (serialSet.size !== validSerials.length) {
        newErrors.serialNumbers = 'Không được có số serial trùng lặp'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateWarrantyCode = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `WR${timestamp}${random}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare warranty registration data
      const validSerials = formData.serialNumbers.filter(serial => serial.trim() !== '')

      const warrantyData = {
        productId: parseInt(formData.productId),
        purchaseDate: formData.purchaseDate,
        serialNumbers: validSerials,
        customer: {
          name: formData.customerName.trim(),
          phone: formData.customerPhone.trim(),
          email: formData.customerEmail.trim(),
          address: formData.customerAddress.trim()
        }
      }

      console.log('🔥 Warranty registration data:', warrantyData)

      const response = await warrantyAPI.register(warrantyData)

      if (response.success) {
        // Generate warranty code from first warranty or fallback
        const firstWarranty = response.data.warranties?.[0]
        const warrantyCode = firstWarranty?.warrantyCode || generateWarrantyCode()

        setWarrantyCode(warrantyCode)
        setSubmitStatus('success')

        // Log warranty creation results
        if (response.data.failedSerials?.length > 0) {
          console.warn('Some serials failed to create warranty:', response.data.failedSerials)
          // Could show a warning to user about failed serials
        }

        console.log(`✅ Created ${response.data.totalWarranties} warranties for customer: ${response.data.customerName}`)

      } else {
        throw new Error(response.message || 'Đăng ký bảo hành thất bại')
      }

      // Reset only product-related fields, keep customer info
      setFormData(prev => ({
        ...prev,
        productId: '',
        purchaseDate: '',
        serialNumbers: ['']
      }))

    } catch (error) {
      console.error('Warranty registration failed:', error)
      handleAPIError(error, false)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }




  const getSelectedProduct = () => {
    return products.find(p => p.id === parseInt(formData.productId))
  }

  const calculateWarrantyExpiry = () => {
    if (!formData.purchaseDate || !formData.productId) return null
    
    const product = getSelectedProduct()
    if (!product) return null
    
    const purchaseDate = new Date(formData.purchaseDate)
    const expiryDate = new Date(purchaseDate)
    expiryDate.setMonth(expiryDate.getMonth() + product.warranty)
    
    return expiryDate.toLocaleDateString('vi-VN')
  }

  const resetForm = () => {
    setSubmitStatus(null)
    setWarrantyCode('')
    setErrors({})
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-8 md:pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              🎉 Kích hoạt bảo hành thành công!
            </h2>
            
            <div className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-6 mb-6 text-left">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">Thông tin bảo hành</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Mã bảo hành:</span>
                  <span className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-bold">{warrantyCode}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Khách hàng:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{formData.customerName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Sản phẩm:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{getSelectedProduct()?.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Ngày mua:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{new Date(formData.purchaseDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Hết hạn bảo hành:</span>
                  <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg font-bold">{calculateWarrantyExpiry()}</span>
                </div>
                <div className="py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Serial ({formData.serialNumbers.filter(s => s.trim()).length} sản phẩm):
                    </span>
                  </div>
                  <div className="space-y-1">
                    {formData.serialNumbers.filter(s => s.trim()).map((serial, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-600 px-3 py-2 rounded text-sm font-mono">
                        {index + 1}. {serial.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                onClick={() => window.print()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                In phiếu bảo hành
              </button>
              <button 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                onClick={resetForm}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Đăng ký bảo hành khác
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">Lưu ý quan trọng</h4>
                  <div className="space-y-2 text-sm text-amber-700 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Vui lòng lưu giữ mã bảo hành <strong className="font-mono bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">{warrantyCode}</strong> để tra cứu sau này</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Khách hàng có thể tra cứu thông tin bảo hành tại website chính thức</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Khi cần bảo hành, vui lòng mang theo sản phẩm và mã bảo hành này</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">•</span>
                      <span>Thời gian xử lý bảo hành: <strong>3-7 ngày làm việc</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-[70px] xl:pt-[80px] 2xl:pt-[90px] 3xl:pt-[100px] 4xl:pt-[120px] 5xl:pt-[140px] pb-8 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ghi nhận thông tin bảo hành
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kích hoạt bảo hành sản phẩm cho khách hàng để có thể tra cứu trên website chính thức
          </p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Thông tin khách hàng</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-900 dark:text-white">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    errors.customerName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  placeholder="Nhập họ tên đầy đủ"
                  disabled={isSubmitting}
                  autoComplete="name"
                  aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                  required
                />
                {errors.customerName && <span id="customerName-error" className="text-red-500 text-sm" role="alert">{errors.customerName}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-900 dark:text-white">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    errors.customerPhone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  placeholder="Nhập số điện thoại (VD: 0912345678)"
                  disabled={isSubmitting}
                  autoComplete="tel"
                  aria-describedby={errors.customerPhone ? 'customerPhone-error' : undefined}
                  required
                />
                {errors.customerPhone && <span id="customerPhone-error" className="text-red-500 text-sm" role="alert">{errors.customerPhone}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="customerEmail" className="block text-sm font-medium text-slate-900 dark:text-white">
                Email khách hàng *
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  errors.customerEmail 
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="Nhập địa chỉ email (VD: example@gmail.com)"
                disabled={isSubmitting}
                autoComplete="email"
                aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                required
              />
              {errors.customerEmail && <span id="customerEmail-error" className="text-red-500 text-sm" role="alert">{errors.customerEmail}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="customerAddress" className="block text-sm font-medium text-slate-900 dark:text-white">
                Địa chỉ khách hàng *
              </label>
              <textarea
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 resize-none ${
                  errors.customerAddress 
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường, quận, thành phố)"
                rows="3"
                disabled={isSubmitting}
                autoComplete="address-line1"
                aria-describedby={errors.customerAddress ? 'customerAddress-error' : undefined}
                required
              />
              {errors.customerAddress && <span id="customerAddress-error" className="text-red-500 text-sm" role="alert">{errors.customerAddress}</span>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Thông tin sản phẩm</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="productId" className="block text-sm font-medium text-slate-900 dark:text-white">
                  Sản phẩm đã mua *
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    errors.productId
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  disabled={isSubmitting || loadingProducts}
                >
                  <option value="">
                    {loadingProducts ? 'Đang tải sản phẩm đã mua...' : products.length === 0 ? 'Chưa có sản phẩm nào đã mua' : 'Chọn sản phẩm đã mua'}
                  </option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Bảo hành {product.warranty} tháng)
                    </option>
                  ))}
                </select>
                {errors.productId && <span className="text-red-500 text-sm">{errors.productId}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-900 dark:text-white">
                  Ngày mua *
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    errors.purchaseDate
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.purchaseDate && <span className="text-red-500 text-sm">{errors.purchaseDate}</span>}
              </div>

            </div>

            <div className="space-y-6">
              {/* Serial Numbers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Số serial sản phẩm * ({selectedSerials.length} đã chọn)
                  </label>
                  {soldSerials.length > 0 && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {soldSerials.length} serial đã phân bổ
                    </div>
                  )}
                </div>

                {/* Sold Serials Selection */}
                {formData.productId && (
                  <div className="space-y-3">
                    {loadingSerials ? (
                      <div className="flex items-center justify-center py-8">
                        <svg className="animate-spin w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">Đang tải serial numbers...</span>
                      </div>
                    ) : soldSerials.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                          Chọn serial numbers đã phân bổ cho dealer:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-slate-50 dark:bg-slate-700">
                          {soldSerials.map((serial) => (
                            <label
                              key={serial.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedSerials.some(s => s.id === serial.id)
                                  ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                                  : 'bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSerials.some(s => s.id === serial.id)}
                                onChange={() => handleSerialSelect(serial)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-mono text-slate-900 dark:text-white truncate">
                                  {serial.serial}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {serial.productName} • Order Item: {serial.orderItemId}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-orange-600 dark:text-orange-400 text-sm">
                          ⚠️ Không có serial nào đã phân bổ cho sản phẩm này
                        </div>
                        <div className="text-xs text-orange-500 dark:text-orange-500 mt-1">
                          Chỉ có thể đăng ký bảo hành cho sản phẩm đã phân bổ
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {errors.serialNumbers && (
                  <span className="text-red-500 text-sm block">{errors.serialNumbers}</span>
                )}

                <div className="text-sm text-slate-500 dark:text-slate-400">
                  💡 <strong>Gợi ý:</strong> Chọn sản phẩm để xem serial đã phân bổ cho dealer
                </div>
              </div>

            </div>

            {formData.productId && formData.purchaseDate && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-100 dark:border-slate-600">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-4">
                  Thông tin bảo hành
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Sản phẩm:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{getSelectedProduct()?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Thời gian bảo hành:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{getSelectedProduct()?.warranty} tháng</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Ngày hết hạn:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{calculateWarrantyExpiry()}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-center mt-8">
            <button 
              type="submit" 
              className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Kích hoạt bảo hành
                </>
              )}
            </button>
          </div>
        </form>

        {submitStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">Có lỗi xảy ra khi đăng ký bảo hành. Vui lòng thử lại.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WarrantyRegistration