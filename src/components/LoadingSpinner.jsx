export default function LoadingSpinner({ label = 'calculating' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span className="metadata-label">{label}…</span>
    </div>
  )
}
