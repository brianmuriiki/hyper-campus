import { useQuery } from '@tanstack/react-query'
import { getStudyTimeByDay, getStudyTimeByUnit } from './api'
import { useAuthStore } from '../../store/authStore'

export function useStudyTimeByDay(days = 7) {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useQuery({
    queryKey: ['studyTimeByDay', userId, days],
    queryFn: () => getStudyTimeByDay(days),
    enabled: !!userId,
  })
}

export function useStudyTimeByUnit() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useQuery({
    queryKey: ['studyTimeByUnit', userId],
    queryFn: getStudyTimeByUnit,
    enabled: !!userId,
  })
}