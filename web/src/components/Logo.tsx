export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div className={`logo logo--${size}`}>
      <span className="logo__unity">Unity</span>
      <span className="logo__spark">Spark</span>
    </div>
  )
}

export function SparkMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M13.2 2 5.5 13.6h5.6L9.8 22l8.7-12.2h-5.8L13.2 2z" fill="currentColor" />
    </svg>
  )
}
