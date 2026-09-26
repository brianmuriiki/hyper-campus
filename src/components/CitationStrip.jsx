import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

async function fetchCitations(chunkIds) {
  const { data, error } = await supabase
    .from('chunks')
    .select('id, source_location, files(id, original_filename, file_type, storage_key, unit_id)')
    .in('id', chunkIds)
  if (error) throw error
  return data
}

export default function CitationStrip({ chunkIds, onOpenFile }) {
  const { data: citations } = useQuery({
    queryKey: ['citations', chunkIds?.slice().sort().join(',')],
    queryFn: () => fetchCitations(chunkIds),
    enabled: !!chunkIds?.length,
  })

  if (!chunkIds?.length) return null

  // De-duplicate by file, since multiple retrieved chunks often come from the same file
  const byFile = new Map()
  for (const c of citations || []) {
    if (!c.files) continue
    if (!byFile.has(c.files.id)) byFile.set(c.files.id, { file: c.files, locations: [] })
    byFile.get(c.files.id).locations.push(c.source_location)
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {[...byFile.values()].map(({ file, locations }) => (
        <button
          key={file.id}
          onClick={() => onOpenFile(file)}
          className="inline-flex items-center gap-1 rounded-md bg-highlighter-soft px-2 py-1 text-xs text-ink hover:opacity-80"
        >
          <span className="truncate max-w-[140px]">{file.original_filename}</span>
          <span className="text-ink-soft">· {locations.length} excerpt{locations.length > 1 ? 's' : ''}</span>
        </button>
      ))}
    </div>
  )
}