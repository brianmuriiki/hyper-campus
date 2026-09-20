import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUnit } from '../features/repository/api'
import { useFiles, useUploadFile, useDeleteFile } from '../features/repository/useFiles'
import { useDeleteUnit } from '../features/repository/useUnits'
import FileUploader from '../components/FileUploader'
import FileRow from '../components/FileRow'
import FilePreviewModal from '../components/FilePreviewModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function UnitDetail() {
  const { unitId } = useParams()
  const navigate = useNavigate()

  const { data: unit } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: () => getUnit(unitId),
  })
  const { data: files, isLoading } = useFiles(unitId)
  const uploadFile = useUploadFile(unitId)
  const deleteFile = useDeleteFile(unitId)
  const deleteUnit = useDeleteUnit()

  const [previewFile, setPreviewFile] = useState(null)
  const [pendingFileDelete, setPendingFileDelete] = useState(null)
  const [confirmingUnitDelete, setConfirmingUnitDelete] = useState(false)

  function confirmFileDelete() {
    if (!pendingFileDelete) return
    deleteFile.mutate(
      { fileId: pendingFileDelete.id, storageKey: pendingFileDelete.storage_key },
      { onSettled: () => setPendingFileDelete(null) }
    )
  }

  function confirmUnitDelete() {
    deleteUnit.mutate(unitId, {
      onSuccess: () => navigate('/app/repository', { replace: true }),
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/app/repository" className="text-sm text-ink-soft hover:text-ink">
            ← Repository
          </Link>
          <h1 className="mt-2 font-display text-xl font-semibold">{unit?.name || '…'}</h1>
          {unit?.course && <p className="text-sm text-ink-soft">{unit.course}</p>}
        </div>
        <button
          onClick={() => setConfirmingUnitDelete(true)}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-red-300 hover:text-red-500"
        >
          Delete unit
        </button>
      </div>

      <div className="mt-6 max-w-xl">
        <FileUploader
          uploading={uploadFile.isPending}
          onUpload={({ file, fileType }) => uploadFile.mutate({ file, fileType })}
        />
      </div>

      <div className="mt-6 max-w-xl">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {!isLoading && files?.length === 0 && (
          <p className="text-sm text-ink-soft">No files uploaded yet.</p>
        )}
        {files?.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onView={setPreviewFile}
            onDelete={setPendingFileDelete}
          />
        ))}
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      <ConfirmDialog
        open={!!pendingFileDelete}
        title={`Delete "${pendingFileDelete?.original_filename}"?`}
        message="This removes the file and it will no longer be usable in Hyper-Chat. This can't be undone."
        confirmLabel={deleteFile.isPending ? 'Deleting…' : 'Delete file'}
        onConfirm={confirmFileDelete}
        onCancel={() => setPendingFileDelete(null)}
      />

      <ConfirmDialog
        open={confirmingUnitDelete}
        title={`Delete "${unit?.name}"?`}
        message="This permanently deletes the unit and every file inside it. This can't be undone."
        confirmLabel={deleteUnit.isPending ? 'Deleting…' : 'Delete unit'}
        onConfirm={confirmUnitDelete}
        onCancel={() => setConfirmingUnitDelete(false)}
      />
    </div>
  )
}