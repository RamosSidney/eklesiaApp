import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useMembersSummary, useBirthdays, useMembers } from '@/hooks/useMembers'
import { colors, STATUS_COLORS, STATUS_LABELS, base } from '@/lib/theme'
import { Users, UserCheck, Cake, LogOut } from 'lucide-react-native'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function Avatar({ name, size = 36, bg = colors.brandLight, fg = colors.brand }: any) {
  const initials = name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') ?? '?'
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.3, fontWeight: '600', color: fg }}>{initials}</Text>
    </View>
  )
}

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { data: sum,    refetch: r1, isFetching: f1 } = useMembersSummary()
  const { data: bday,   refetch: r2 } = useBirthdays()
  const { data: recent, refetch: r3 } = useMembers({ limit: 5, page: 1 })

  const refreshing = f1
  function onRefresh() { r1(); r2(); r3() }

  const churchName = (user as any)?.churches?.name ?? 'Minha Igreja'

  return (
    <SafeAreaView style={base.screen}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>
            Olá{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </Text>
          <Text style={s.church}>{churchName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <LogOut size={18} color={colors.textSub} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[base.card, s.statCard]}>
            <View style={[s.statIcon, { backgroundColor: colors.brandLight }]}>
              <Users size={16} color={colors.brand} />
            </View>
            <Text style={s.statValue}>{(sum as any)?.total ?? '—'}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={[base.card, s.statCard]}>
            <View style={[s.statIcon, { backgroundColor: colors.greenBg }]}>
              <UserCheck size={16} color={colors.green} />
            </View>
            <Text style={s.statValue}>{(sum as any)?.active ?? '—'}</Text>
            <Text style={s.statLabel}>Ativos</Text>
          </View>
          <View style={[base.card, s.statCard]}>
            <View style={[s.statIcon, { backgroundColor: colors.amberBg }]}>
              <Users size={16} color={colors.amber} />
            </View>
            <Text style={s.statValue}>{(sum as any)?.visitors ?? '—'}</Text>
            <Text style={s.statLabel}>Visitantes</Text>
          </View>
          <View style={[base.card, s.statCard]}>
            <View style={[s.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Users size={16} color="#1E40AF" />
            </View>
            <Text style={s.statValue}>{(sum as any)?.new_this_month ?? '—'}</Text>
            <Text style={s.statLabel}>Este mês</Text>
          </View>
        </View>

        {/* Membros recentes */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Membros recentes</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/members')}>
              <Text style={s.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={base.card}>
            {(recent as any)?.data?.slice(0, 5).map((m: any, i: number, arr: any[]) => {
              const sc = STATUS_COLORS[m.status] ?? STATUS_COLORS.visitor
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[s.memberRow, i < arr.length - 1 && s.memberRowBorder]}
                  onPress={() => router.push(`/(app)/members`)}
                >
                  <Avatar name={m.full_name} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.memberName}>{m.full_name}</Text>
                    <Text style={s.memberSub}>{m.phone ?? m.email ?? ''}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[s.badgeText, { color: sc.text }]}>{STATUS_LABELS[m.status] ?? m.status}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
            {!(recent as any)?.data?.length && (
              <Text style={s.empty}>Nenhum membro ainda</Text>
            )}
          </View>
        </View>

        {/* Aniversariantes */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Cake size={14} color="#DB2777" />
              <Text style={s.sectionTitle}>Aniversariantes do mês</Text>
            </View>
          </View>
          <View style={base.card}>
            {(bday as any)?.slice(0, 5).map((m: any, i: number, arr: any[]) => (
              <View key={m.id} style={[s.memberRow, i < arr.length - 1 && s.memberRowBorder]}>
                <Avatar name={m.full_name} bg="#FCE7F3" fg="#DB2777" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.memberName}>{m.full_name}</Text>
                  <Text style={s.memberSub}>{m.phone ?? ''}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#DB2777' }}>
                  {format(parseISO(m.birth_date), 'dd/MM')}
                </Text>
              </View>
            ))}
            {!(bday as any)?.length && (
              <Text style={s.empty}>Nenhum aniversariante este mês</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  greeting:     { fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },
  church:       { fontSize: 12, color: colors.textSub, marginTop: 2 },
  logoutBtn:    { padding: 8 },
  content:      { paddingHorizontal: 16, paddingBottom: 32 },
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard:     { flex: 1, padding: 12, alignItems: 'center' },
  statIcon:     { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue:    { fontSize: 20, fontWeight: '600', color: colors.text },
  statLabel:    { fontSize: 10, color: colors.textSub, marginTop: 2 },
  section:      { marginBottom: 20 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  seeAll:       { fontSize: 12, color: colors.brand },
  memberRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  memberRowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  memberName:   { fontSize: 14, fontWeight: '500', color: colors.text },
  memberSub:    { fontSize: 12, color: colors.textSub, marginTop: 1 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText:    { fontSize: 11, fontWeight: '500' },
  empty:        { textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: 24 },
})
