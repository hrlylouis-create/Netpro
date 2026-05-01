import './SectionTitle.css'

export default function SectionTitle({ children, inView, style }) {
  const cls = [
    'section-title',
    inView !== undefined ? 'fade-up' : '',
    inView ? 'visible' : ''
  ].filter(Boolean).join(' ')

  return (
    <h2 className={cls} style={style}>
      {children}
    </h2>
  )
}
