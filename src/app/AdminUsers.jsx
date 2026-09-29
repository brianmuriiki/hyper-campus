import { useState } from 'react'
import { useAdminUsers, useSetUserStatus, useSetModerator, useRemoveModerator } from '../features/admin/useAdmin'

const STATUS_BADGE = { active: 'badge-ready', suspended: 'badge-processing', banned: 'badge-failed' }

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const { data: users, isLoading, isError, error } = useAdminUsers({
    search,
    course: courseFilter || undefined,
    status: statusFilter || undefined,
  })
  const setUserStatus = useSetUserStatus()
  const setModerator = useSetModerator()
  const removeModerator = useRemoveModerator()

  const [selectedUser, setSelectedUser] = useState(null)
  const [modYear, setModYear] = useState('')
  const [modCourse, setModCourse] = useState('')

  function handlePromote(user) {
    setModerator.mutate(
      { userId: user.id, year: Number(modYear || user.year_of_study), course: modCourse || user.course },
      { onSuccess: () => setSelectedUser(null) }
    )
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-xl font-semibold">Users</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_14rem]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, admission no., or email"
          className="input-field flex-1"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <input value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} placeholder="Filter by course" className="input-field" />
      </div>

      {isError && <p role="alert" className="mt-4 rounded-md border border-line bg-paper-raised p-3 text-sm text-ink">Could not load users: {error.message}</p>}
      <div className="admin-user-table mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Course</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-4 text-ink-soft" colSpan={5}>Loading…</td></tr>}
            {!isLoading && !isError && users?.length === 0 && <tr><td className="px-3 py-4 text-ink-soft" colSpan={5}>No users match these filters.</td></tr>}
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 text-ink-soft">{u.course} · Y{u.year_of_study}</td>
                <td className="px-3 py-2 text-ink-soft">{u.role}</td>
                <td className="px-3 py-2"><span className={`badge ${STATUS_BADGE[u.status]}`}>{u.status}</span></td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => { setSelectedUser(u); setModYear(''); setModCourse('') }} className="text-ink-soft underline hover:text-ink">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-user-cards mt-4">
        {isLoading && <p className="text-sm text-ink-soft">Loading users…</p>}
        {!isLoading && !isError && users?.length === 0 && <p className="text-sm text-ink-soft">No users match these filters.</p>}
        {users?.map((u) => (
          <article key={u.id} className="rounded-lg border border-line bg-paper-raised p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name || 'Unnamed user'}</p>
                <p className="break-all text-xs text-ink-soft">{u.email}</p>
              </div>
              <span className={`badge ${STATUS_BADGE[u.status] || 'badge-pending'}`}>{u.status || 'unknown'}</span>
            </div>
            <p className="mt-2 text-xs text-ink-soft">{u.course || 'No course'} · Year {u.year_of_study || '—'} · {u.role}</p>
            <button onClick={() => { setSelectedUser(u); setModYear(''); setModCourse('') }} className="mt-3 text-sm text-ink underline">Manage user</button>
          </article>
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg border border-line bg-paper-raised p-5">
            <p className="font-display text-base font-semibold">{selectedUser.name}</p>
            <p className="text-xs text-ink-soft">{selectedUser.email} · {selectedUser.admission_number}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedUser.status !== 'suspended' && (
                <button
                  onClick={() => setUserStatus.mutate({ userId: selectedUser.id, status: 'suspended' }, { onSuccess: () => setSelectedUser(null) })}
                  className="rounded-md border border-line px-3 py-1.5 text-xs hover:bg-paper"
                >
                  Suspend
                </button>
              )}
              {selectedUser.status !== 'banned' && (
                <button
                  onClick={() => setUserStatus.mutate({ userId: selectedUser.id, status: 'banned' }, { onSuccess: () => setSelectedUser(null) })}
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Ban
                </button>
              )}
              {selectedUser.status !== 'active' && (
                <button
                  onClick={() => setUserStatus.mutate({ userId: selectedUser.id, status: 'active' }, { onSuccess: () => setSelectedUser(null) })}
                  className="rounded-md border border-line px-3 py-1.5 text-xs text-sage hover:bg-paper"
                >
                  Reinstate
                </button>
              )}
            </div>

            {setModerator.isError && <p role="alert" className="mt-3 text-xs text-ink">{setModerator.error.message}</p>}
            <div className="mt-4 border-t border-line pt-4">
              {selectedUser.role === 'moderator' ? (
                <button
                  onClick={() => removeModerator.mutate(selectedUser.id, { onSuccess: () => setSelectedUser(null) })}
                  className="text-xs text-ink-soft underline"
                >
                  Remove moderator role
                </button>
              ) : (
                <>
                  <p className="mb-2 text-xs font-medium text-ink-soft">Promote to moderator for:</p>
                  <div className="flex gap-2">
                    <input value={modYear} onChange={(e) => setModYear(e.target.value)} placeholder={`Year (${selectedUser.year_of_study})`} className="input-field w-24 text-sm" />
                    <input value={modCourse} onChange={(e) => setModCourse(e.target.value)} placeholder={selectedUser.course} className="input-field flex-1 text-sm" />
                  </div>
                  <button onClick={() => handlePromote(selectedUser)} className="mt-2 rounded-md bg-fill px-3 py-1.5 text-xs font-medium text-on-fill hover:opacity-90">
                    Promote
                  </button>
                </>
              )}
            </div>

            <button onClick={() => setSelectedUser(null)} className="mt-4 w-full text-center text-xs text-ink-soft">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
