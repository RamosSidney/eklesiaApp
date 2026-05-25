import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { colors, base } from '@/lib/theme'
import { Building2, Users } from 'lucide-react-native'

export default function MinistriesScreen() {
  const { data: ministries, isLoading, refetch } = useQuery({
    queryKey: ['ministries'],
    queryFn:  () => api.get('/api/ministries'),
  })

  return (
    <SafeAreaView style={base.screen}>
      <View style={s.header}>
        <Text style={s.title}>Ministérios</Text>
      </View>

      {isLoading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand} />
        : (
          <FlatList
            data={(ministries as any) ?? []}
            keyExtractor={(m: any) => m.id}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={s.content}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Building2 size={36} color={colors.textMuted} />
                <Text style={s.emptyText}>Nenhum ministério cadastrado</Text>
              </View>
            }
            renderItem={({ item: m }: any) => {
              const count = m.member_ministries?.[0]?.count ?? 0
              return (
                <View style={[base.card, s.card]}>
                  <View style={s.cardTop}>
                    <View style={s.icon}>
                      <Building2 size={20} color={colors.brand} />
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: m.active ? colors.greenBg : '#F1EFE8' }]}>
                      <Text style={[s.statusText, { color: m.active ? colors.green : '#444' }]}>
                        {m.active ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.cardName}>{m.name}</Text>
                  {m.description ? <Text style={s.cardDesc}>{m.description}</Text> : null}
                  <View style={s.cardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Users size={13} color={colors.textMuted} />
                      <Text style={s.cardMeta}>{count} membros</Text>
                    </View>
                    {m.leader && (
                      <Text style={s.cardMeta}>Líder: {m.leader.full_name}</Text>
                    )}
                  </View>
                </View>
              )
            }}
          />
        )
      }
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title:       { fontSize: 20, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },
  content:     { paddingHorizontal: 16, paddingBottom: 24 },
  card:        { padding: 16 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  icon:        { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText:  { fontSize: 11, fontWeight: '500' },
  cardName:    { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardDesc:    { fontSize: 13, color: colors.textSub, marginBottom: 8 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: colors.border },
  cardMeta:    { fontSize: 12, color: colors.textMuted },
  empty:       { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyText:   { fontSize: 14, color: colors.textMuted },
})
