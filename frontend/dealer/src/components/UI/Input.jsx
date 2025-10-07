import PropTypes from 'prop-types'

const Input = ({
  label,
  error,
  required = false,
  className = '',
  containerClassName = '',
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  ...props
}) => {
  const inputClasses = [
    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    error
      ? 'border-red-500 dark:border-red-400'
      : 'border-slate-300 dark:border-slate-600',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
}

export default Input