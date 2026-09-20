const CONFIG = {
  pending: { label: 'Pending', className: 'badge-pending' },
  processing: { label: 'Processing', className: 'badge-processing' },
  ready: { label: 'Ready', className: 'badge-ready' },
  failed: { label: 'Failed', className: 'badge-failed' },
}

export default function StatusBadge({ status }) {
  const config = CONFIG[status] || CONFIG.pending
  return <span className={`badge ${config.className}`}>{config.label}</span>
}