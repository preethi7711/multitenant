import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}) {
  const classes = cn(
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    fullWidth && 'btn-full',
    className
  )

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={15} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={15} />}
    </button>
  )
}
