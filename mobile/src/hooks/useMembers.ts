import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useMembers(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(params as any).toString()
  return useQuery({
    queryKey: ['members', params],
    queryFn:  () => api.get(`/api/members?${qs}`),
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn:  () => api.get(`/api/members/${id}`),
    enabled:  !!id,
  })
}

export function useMembersSummary() {
  return useQuery({
    queryKey: ['members-summary'],
    queryFn:  () => api.get('/api/members/summary'),
  })
}

export function useBirthdays() {
  return useQuery({
    queryKey: ['birthdays'],
    queryFn:  () => api.get('/api/members/birthdays'),
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/members', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.patch(`/api/members/${id}`, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['members', id] })
    },
  })
}
