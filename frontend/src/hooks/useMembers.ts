import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Member, PaginatedResponse } from '@/types'

interface MembersQuery {
  search?: string
  status?: string
  ministry_id?: string
  page?: number
  limit?: number
}

export function useMembers(query: MembersQuery = {}) {
  const params = new URLSearchParams()
  if (query.search)      params.set('search',      query.search)
  if (query.status)      params.set('status',      query.status)
  if (query.ministry_id) params.set('ministry_id', query.ministry_id)
  if (query.page)        params.set('page',        String(query.page))
  if (query.limit)       params.set('limit',       String(query.limit))

  return useQuery<PaginatedResponse<Member>>({
    queryKey: ['members', query],
    queryFn:  () => api.get(`/api/members?${params}`),
  })
}

export function useMember(id: string) {
  return useQuery<Member>({
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
  return useQuery<Member[]>({
    queryKey: ['birthdays'],
    queryFn:  () => api.get('/api/members/birthdays'),
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Member>) => api.post<Member>('/api/members', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Member>) => api.patch<Member>(`/api/members/${id}`, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['members', id] })
    },
  })
}

export function useDeleteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/members/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}
