import { useState, useEffect } from 'react'

const ProductFilters = ({ 
  onFiltersChange, 
  totalProducts = 0,
  className = ''
}) => {
  const [filters, setFilters] = useState({
    search: '',
    priceRange: '',
    category: '',
    brand: '',
    availability: '',
    warranty: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  const [isExpanded, setIsExpanded] = useState(false)

  // Sample data - in real app, fetch from API
  const categories = [
    { id: 'headphones', name: 'Tai nghe', count: 15 },
    { id: 'earphones', name: 'Tai nghe nhét tai', count: 8 },
    { id: 'wireless', name: 'Tai nghe không dây', count: 12 },
    { id: 'gaming', name: 'Tai nghe Gaming', count: 6 }
  ]

  const brands = [
    { id: 'sony', name: 'Sony', count: 20 },
    { id: 'bose', name: 'Bose', count: 8 },
    { id: 'apple', name: 'Apple', count: 5 },
    { id: 'samsung', name: 'Samsung', count: 7 }
  ]

  const priceRanges = [
    { value: '', label: 'Tất cả giá', count: totalProducts },
    { value: '0-1000000', label: 'Dưới 1 triệu', count: 5 },
    { value: '1000000-3000000', label: '1 - 3 triệu', count: 8 },
    { value: '3000000-5000000', label: '3 - 5 triệu', count: 12 },
    { value: '5000000-10000000', label: '5 - 10 triệu', count: 15 },
    { value: '10000000+', label: 'Trên 10 triệu', count: 3 }
  ]

  const availabilityOptions = [
    { value: '', label: 'Tất cả sản phẩm' },
    { value: 'in-stock', label: 'Còn hàng' },
    { value: 'low-stock', label: 'Sắp hết hàng (<10)' },
    { value: 'out-of-stock', label: 'Hết hàng' }
  ]

  const warrantyOptions = [
    { value: '', label: 'Tất cả bảo hành' },
    { value: '6', label: '6 tháng' },
    { value: '12', label: '12 tháng' },
    { value: '18', label: '18 tháng' },
    { value: '24', label: '24 tháng' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Tên sản phẩm' },
    { value: 'price', label: 'Giá' },
    { value: 'stock', label: 'Tồn kho' },
    { value: 'warranty', label: 'Bảo hành' },
    { value: 'created', label: 'Mới nhất' }
  ]

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      priceRange: '',
      category: '',
      brand: '',
      availability: '',
      warranty: '',
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const clearFilter = (key) => {
    updateFilter(key, '')
  }

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value !== '' && key !== 'sortBy' && key !== 'sortOrder'
    ).length
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    updateFilter('search', value)
  }

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const FilterSection = ({ title, children }) => (
    <div className="border-b border-slate-200 dark:border-slate-600 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h4>
      {children}
    </div>
  )

  const CheckboxOption = ({ checked, onChange, label, count, disabled = false }) => (
    <label className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-primary-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 rounded focus:ring-primary-500 focus:ring-2"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </label>
  )

  const RadioOption = ({ checked, onChange, label, count, disabled = false }) => (
    <label className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center gap-3">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-primary-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 focus:ring-primary-500 focus:ring-2"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </label>
  )

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              🔍 Bộ lọc
            </h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
              disabled={getActiveFiltersCount() === 0}
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors md:hidden"
              aria-label={isExpanded ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`p-4 transition-all duration-300 ${!isExpanded ? 'hidden md:block' : 'block'}`}>
        <div className="space-y-6">
          {/* Search */}
          <FilterSection title="Tìm kiếm">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên, mô tả, SKU..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                🔍
              </div>
              {filters.search && (
                <button
                  onClick={() => clearFilter('search')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </FilterSection>

          {/* Sort */}
          <FilterSection title="Sắp xếp">
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className={`px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm transition-colors ${
                  filters.sortOrder === 'desc' 
                    ? 'bg-primary-500 text-white border-primary-500' 
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                title={filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Khoảng giá">
            <div className="space-y-2">
              {priceRanges.map(range => (
                <RadioOption
                  key={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={() => updateFilter('priceRange', range.value)}
                  label={range.label}
                  count={range.count}
                />
              ))}
            </div>
          </FilterSection>

          {/* Category */}
          <FilterSection title="Danh mục">
            <div className="space-y-2">
              {categories.map(category => (
                <CheckboxOption
                  key={category.id}
                  checked={filters.category === category.id}
                  onChange={() => updateFilter('category', filters.category === category.id ? '' : category.id)}
                  label={category.name}
                  count={category.count}
                />
              ))}
            </div>
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Thương hiệu">
            <div className="space-y-2">
              {brands.map(brand => (
                <CheckboxOption
                  key={brand.id}
                  checked={filters.brand === brand.id}
                  onChange={() => updateFilter('brand', filters.brand === brand.id ? '' : brand.id)}
                  label={brand.name}
                  count={brand.count}
                />
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Tình trạng hàng">
            <div className="space-y-2">
              {availabilityOptions.map(option => (
                <RadioOption
                  key={option.value}
                  checked={filters.availability === option.value}
                  onChange={() => updateFilter('availability', option.value)}
                  label={option.label}
                />
              ))}
            </div>
          </FilterSection>

          {/* Warranty */}
          <FilterSection title="Bảo hành">
            <div className="space-y-2">
              {warrantyOptions.map(option => (
                <RadioOption
                  key={option.value}
                  checked={filters.warranty === option.value}
                  onChange={() => updateFilter('warranty', option.value)}
                  label={option.label}
                />
              ))}
            </div>
          </FilterSection>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'sortBy' || key === 'sortOrder') return null
              
              let displayValue = value
              if (key === 'priceRange') {
                const range = priceRanges.find(r => r.value === value)
                displayValue = range?.label || value
              } else if (key === 'category') {
                const cat = categories.find(c => c.id === value)
                displayValue = cat?.name || value
              } else if (key === 'brand') {
                const brand = brands.find(b => b.id === value)
                displayValue = brand?.name || value
              } else if (key === 'availability') {
                const avail = availabilityOptions.find(a => a.value === value)
                displayValue = avail?.label || value
              } else if (key === 'warranty') {
                displayValue = `Bảo hành ${value} tháng`
              }

              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                >
                  <span>{displayValue}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                    aria-label={`Xóa bộ lọc ${displayValue}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters