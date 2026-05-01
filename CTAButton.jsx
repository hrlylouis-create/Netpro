import { forwardRef } from 'react'
import './CTAButton.css'

const CTAButton = forwardRef(function CTAButton({ children, onClick, color = 'green', disabled = false, fullWidth = false, className = '' }, ref) {
  const handleClick = (e) => {
    if (!onClick) return
    e.stopPropagation()
    setTimeout(() => onClick(e), 180)
  }

  return (
    <button
      ref={ref}
      className={`cta-btn cta-btn--${color}${disabled ? ' cta-btn--disabled' : ''}${fullWidth ? ' cta-btn--full' : ''} ${className}`}
      onClick={disabled ? undefined : handleClick}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  )
})

export default CTAButton
