import { useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMembers } from '@/hooks/useMembers'
import { colors, STATUS_COLORS, STATUS_LABELS, base } from '@/lib/theme'
import { Search, Plus, ChevronRight } from 'lucide-react-native'

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.28, fontWeight: '600', color: colors.brand }}>{initials}</Text>
    </View>
  )
}

export default function MembersScreen() {
  const router    = useRouter()
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [page,    setPage]    = useState(1)

  const { data, isLoading, refetch } = useMembers({ search, status, page, limit: 25 })
  const members = (data as any)?.data ?? []
  const meta    = (data as any)?.meta

  const STATUS_FILTERS = [
    { value: '',               label: 'Todos' },
    { value: 'active',         label: 'Ativos' },
    { value: 'visitor',        label: 'Visitantes' },
    { value: 'in_discipleship',label: 'Discipulado' },
    { value: 'inactive',       label: 'Inativos' },
  ]

  return (
    <SafeAreaView style={base.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Membros</Text>
        <TouchableOpacity
          style={[base.btnPrimary, { paddingVertical: 8, paddingHorizontal: 12 }]}
          onPress={() => router.push('/(app)/member-new')}
        >
          <Plus size={16} color="#FFF" />
          <Text style={[base.btnPrimaryText, { fontSize: 13 }]}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={s.searchWrap}>
        <Search size={16} color={colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome, telefone..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={v => { setSearch(v); setPage(1) }}
          autoCapitalize="none"
        />
      </View>

      {/* Filtros de status */}
      <View style={s.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            onPress={() => { setStatus(f.value); setPage(1) }}
            style={[s.filterChip, status === f.value && s.filterChipActive]}
          >
            <Text style={[s.filterText, status === f.value && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {isLoading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand} />
        : (
          <FlatList
            data={members}
            keyExtractor={(m: any) => m.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            onRefresh={refetch}
            refreshing={isLoading}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={
              <Text style={s.empty}>Nenhum membro encontrado</Text>
            }
            ListFooterComponent={
              meta && meta.pages > 1 ? (
                <View style={s.pagination}>
                  <TouchableOpacity
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={[base.btnSecondary, { opacity: page === 1 ? 0.4 : 1, paddingVertical: 8, paddingHorizontal: 12 }]}
                  >
                    <Text style={base.btnSecondaryText}>← Anterior</Text>
                  </TouchableOpacity>
                  <Text style={s.pageInfo}>{meta.page} / {meta.pages}</Text>
                  <TouchableOpacity
                    onPress={() => setPage(p => Math.min(meta.pages, p + 1))}
                    disabled={page === meta.pages}
                    style={[base.btnSecondary, { opacity: page === meta.pages ? 0.4 : 1, paddingVertical: 8, paddingHorizontal: 12 }]}
                  >
                    <Text style={base.btnSecondaryText}>Próxima →</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            renderItem={({ item: m }: any) => {
              const sc = STATUS_COLORS[m.status] ?? STATUS_COLORS.visitor
              return (
                <TouchableOpacity
                  style={[base.card, s.memberCard]}
                  onPress={() => router.push({ pathname: '/(app)/member-detail', params: { id: m.id } })}
                >
                  <Avatar name={m.full_name} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.memberName}>{m.full_name}</Text>
                    <Text style={s.memberSub}>{m.phone ?? m.email ?? '—'}</Text>
                    <View style={[s.badge, { backgroundColor: sc.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                      <Text style={[s.badgeText, { color: sc.text }]}>{STATUS_LABELS[m.status] ?? m.status}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )
            }}
          />
        )
      }
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title:           { fontSize: 20, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },
  searchWrap:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: 12 },
  searchIcon:      { marginRight: 8 },
  searchInput:     { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
  filterRow:       { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
  filterChip:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: '#FFF', borderWidth: 0.5, borderColor: colors.border },
  filterChipActive:{ backgroundColor: colors.brandLight, borderColor: colors.brand },
  filterText:      { fontSize: 12, color: colors.textSub, fontWeight: '500' },
  filterTextActive:{ color: colors.brand },
  memberCard:      { flexDirection: 'row', alignItems: 'center', padding: 14 },
  memberName:      { fontSize: 14, fontWeight: '600', color: colors.text },
  memberSub:       { fontSize: 12, color: colors.textSub, marginTop: 1 },
  badge:           { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  badgeText:       { fontSize: 11, fontWeight: '500' },
  empty:           { textAlign: 'center', color: colors.textMuted, marginTop: 48, fontSize: 14 },
  pagination:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  pageInfo:        { fontSize: 13, color: colors.textSub },
})
