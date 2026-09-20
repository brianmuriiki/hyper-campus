import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUnits, useCreateUnit, useDeleteUnit } from '../features/repository/useUnits'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Repository() {
  const { data: units, isLoading } = useUnits()
  const createUnit = useCreateUnit()
  const deleteUnit = useDeleteUnit()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // unit object or null

  function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    createUnit.mutate(
      { name, course },
      { onSuccess: () => { setName(''); setCourse(''); setShowForm(false) } }
    )
  }

  function confirmDelete() {
    if (!pendingDelete) return
    deleteUnit.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Repository</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-md bg-fill px-3 py-1.5 text-sm font-medium text-on-fill hover:opacity-90"
        >
          <PlusIcon /> New unit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-paper-raised p-4">
          <div>
            <label className="text-sm text-ink-soft">Unit name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Data structures"
              className="input-field mt-1 w-56"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-ink-soft">Course</label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Computer science"
              className="input-field mt-1 w-56"
            />
          </div>
          <button
            type="submit"
            disabled={createUnit.isPending}
            className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90 disabled:opacity-60"
          >
            {createUnit.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}

        {!isLoading && units?.length === 0 && (
          <p className="text-sm text-ink-soft">
            No units yet — create one to start uploading notes.
          </p>
        )}

        {units?.map((unit) => (
          <div key={unit.id} className="card-hover relative rounded-lg border border-line bg-paper-raised p-5">
            <button
              onClick={(e) => {
                e.preventDefault()
                setPendingDelete(unit)
              }}
              aria-label="Delete unit"
              className="absolute right-3 top-3 text-ink-soft hover:text-red-500"
            >
              <TrashIcon />
            </button>
            <Link to={`/app/repository/${unit.id}`} className="block">
              <FolderIcon />
              <p className="mt-2 font-display text-base font-semibold pr-6">{unit.name}</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                {unit.files?.[0]?.count ?? 0} files
              </p>
            </Link>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        message="This permanently deletes the unit and every file inside it. This can't be undone."
        confirmLabel={deleteUnit.isPending ? 'Deleting…' : 'Delete unit'}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ink-soft">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  )
}