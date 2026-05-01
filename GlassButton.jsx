import './GlassButton.css'
import { Link } from 'react-router-dom'
import { forwardRef } from 'react'

const GlassButton = forwardRef(function GlassButton({ children, href, to, onClick, className = '', style, ...props }, ref) {
  const cls = `glass-btn${className ? ' ' + className : ''}`
  if (to) return <Link ref={ref} to={to} className={cls} style={style} {...props}>{children}</Link>
  if (href !== undefined) return <a ref={ref} href={href} className={cls} style={style} {...props}>{children}</a>
  return <button ref={ref} className={cls} style={style} onClick={onClick} {...props}>{children}</button>
})

export default GlassButton
