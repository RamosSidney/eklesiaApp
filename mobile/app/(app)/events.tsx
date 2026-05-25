import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { colors, base } from '@/lib/theme'
import { CalendarDays, Clock, MapPin } from 'lucide-react-native'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TYPE_LABELS: Record<string, string> = {
  service: 'Culto', baptism: 'Batismo', retreat: 'Retiro',
  cell: 'Célula', wedding: 'Casamento', other: 'Outro',
}
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  service:  { bg: '#EEEDFE', text: '#3C3489' },
  baptism:  { bg: '#DBEAFE', text: '#1E40AF' },
  retreat:  { bg: '#D1FAE5', text: '#065F46' },
  cell:     { bg: '#FEF3C7', text: '#92400E' },
  wedding:  { bg: '#FCE7F3', text: '#9D174D' },
  other:    { bg: '#F1EFE8', text: '#444441' },
}

export default function EventsScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn:  () => api.get('/api/events?upcoming=true&limit=30'),
  })
  const events = (data as any)?.data ?? []

  return (
    <SafeAreaView style={base.screen}>
      <View style={s.header}>
        <Text style={s.title}>Eventos</Text>
      </View>

      {isLoading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand} />
        : (
          <FlatList
            data={events}
            keyExtractor={(e: any) => e.id}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={s.content}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <CalendarDays size={36} color={colors.textMuted} />
                <Text style={s.emptyText}>Nenhum evento próximo</Text>
              </View>
            }
            renderItem={({ item: ev }: any) => {
              const tc = TYPE_COLORS[ev.type] ?? TYPE_COLORS.other
              return (
                <View style={[base.card, s.card]}>
                  <View style={s.dateBlock}>
                    <Text style={s.dateDay}>{format(parseISO(ev.starts_at), 'dd')}</Text>
                    <Text style={s.dateMon}>{format(parseISO(ev.starts_at), 'MMM', { locale: ptBR }).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.cardTop}>
                      <Text style={s.cardTitle} numberOfLines={1}>{ev.title}</Text>
                      <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                        <Text style={[s.typeText, { color: tc.text }]}>{TYPE_LABELS[ev.type] ?? ev.type}</Text>
                      </View>
                    </View>
                    <View style={s.meta}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text style={s.metaText}>{format(parseISO(ev.starts_at), 'HH:mm')}</Text>
                      {ev.location && <>
                        <MapPin size={12} color={colors.textMuted} />
                        <Text style={s.metaText} numberOfLines={1}>{ev.location}</Text>
                      </>}
                    </View>
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
  header:    { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title:     { fontSize: 20, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },
  content:   { paddingHorizontal: 16, paddingBottom: 24 },
  card:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  dateBlock: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  dateDay:   { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 18 },
  dateMon:   { fontSize: 10, color: colors.textSub, fontWeight: '500' },
  cardTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  typeText:  { fontSize: 11, fontWeight: '500' },
  meta:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: 12, color: colors.textMuted },
  empty:     { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textMuted },
})
