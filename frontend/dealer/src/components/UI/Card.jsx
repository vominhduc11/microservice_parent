import PropTypes from 'prop-types'

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'default',
  hover = false,
  ...props
}) => {
  const baseStyles = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-200'

  const variants = {
    default: '',
    outlined: 'border-2',
    elevated: 'shadow-lg',
    primary: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const hoverStyles = hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''

  const classes = [
    baseStyles,
    variants[variant],
    paddings[padding],
    hoverStyles,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated', 'primary']),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  hover: PropTypes.bool
}

export default Card