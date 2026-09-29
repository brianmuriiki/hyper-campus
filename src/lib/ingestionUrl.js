export function ingestionUrl(path) {
  const baseUrl = import.meta.env.VITE_INGESTION_SERVICE_URL?.replace(/\/+$/, '')
  if (!baseUrl) {
    throw new Error('Missing VITE_INGESTION_SERVICE_URL environment variable.')
  }

  return `${baseUrl}/${path.replace(/^\/+/, '')}`
}
