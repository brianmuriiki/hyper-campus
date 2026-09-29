const PENDING_KEY = 'hc-onboarding-pending'
const PENDING_USER_KEY = 'hc-onboarding-user-id'
const PENDING_SINCE_KEY = 'hc-onboarding-started-at'
const COMPLETED_PREFIX = 'hc-onboarding-completed:'

export function beginOnboarding(userId = null) {
  localStorage.setItem(PENDING_KEY, 'true')
  localStorage.setItem(PENDING_SINCE_KEY, String(Date.now()))

  if (userId) localStorage.setItem(PENDING_USER_KEY, userId)
  else localStorage.removeItem(PENDING_USER_KEY)
}

export function hasPendingOnboarding() {
  return localStorage.getItem(PENDING_KEY) === 'true'
}

export function shouldShowOnboarding(user) {
  if (!user?.id || !hasPendingOnboarding()) return false
  if (localStorage.getItem(`${COMPLETED_PREFIX}${user.id}`) === 'true') return false

  const pendingUserId = localStorage.getItem(PENDING_USER_KEY)
  if (pendingUserId) return pendingUserId === user.id

  // OAuth can create a user from either the Register or Login screen. For
  // those flows, only show onboarding when the account itself was just created.
  const startedAt = Number(localStorage.getItem(PENDING_SINCE_KEY))
  const createdAt = Date.parse(user.created_at || '')
  return Number.isFinite(startedAt) && Number.isFinite(createdAt) && createdAt >= startedAt - 120_000
}

export function clearPendingOnboarding() {
  localStorage.removeItem(PENDING_KEY)
  localStorage.removeItem(PENDING_USER_KEY)
  localStorage.removeItem(PENDING_SINCE_KEY)
}

export function completeOnboarding(userId) {
  localStorage.setItem(`${COMPLETED_PREFIX}${userId}`, 'true')
  clearPendingOnboarding()
}
