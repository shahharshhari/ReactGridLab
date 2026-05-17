export default function ServerModeBanner({ total, loading }) {
  return (
    <div className="server-mode-banner">
      <span className="server-mode-badge">Server-side</span>
      <span>
        {loading ? 'Loading…' : `${total.toLocaleString()} records · paginated from API`}
      </span>
    </div>
  )
}
