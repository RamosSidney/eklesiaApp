import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMember } from '@/hooks/useMembers'
import { colors, STATUS_COLORS, STATUS_LABELS, base } from '@/lib/theme'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react-native'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  )
}

export default function MemberDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const router   = useRouter()
  const { data: member, isLoading } = useMember(id)

  if (isLoading) {
    return (
      <SafeAreaView style={[base.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Carregando...</Text>
      </SafeAreaView>
    )
  }

  if (!member) {
    return (
      <SafeAreaView style={[base.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Membro não encontrado</Text>
      </SafeAreaView>
    )
  }

  const m       = member as any
  const initials = m.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
  const sc      = STATUS_COLORS[m.status] ?? STATUS_COLORS.visitor

  return (
    <SafeAreaView style={base.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Perfil do membro</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar e nome */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>{m.full_name}</Text>
          <View style={[s.badge, { backgroundColor: sc.bg }]}>
            <Text style={[s.badgeText, { color: sc.text }]}>{STATUS_LABELS[m.status] ?? m.status}</Text>
          </View>

          {/* Ações rápidas */}
          <View style={s.actions}>
            {m.phone && (
              <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`tel:${m.phone}`)}>
                <Phone size={18} color={colors.brand} />
                <Text style={s.actionText}>Ligar</Text>
              </TouchableOpacity>
            )}
            {m.phone && (
              <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`https://wa.me/55${m.phone.replace(/\D/g,'')}`)}>
                <Text style={{ fontSize: 18 }}>💬</Text>
                <Text style={s.actionText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {m.email && (
              <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`mailto:${m.email}`)}>
                <Mail size={18} color={colors.brand} />
                <Text style={s.actionText}>E-mail</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dados pessoais */}
        <View style={[base.card, s.section]}>
          <Text style={s.sectionTitle}>Dados pessoais</Text>
          <Field label="Data de nascimento" value={m.birth_date ? format(parseISO(m.birth_date), "dd/MM/yyyy", { locale: ptBR }) : null} />
          <Field label="CPF" value={m.cpf} />
          <Field label="Estado civil" value={
            m.marital_status === 'single' ? 'Solteiro(a)' :
            m.marital_status === 'married' ? 'Casado(a)' :
            m.marital_status === 'divorced' ? 'Divorciado(a)' :
            m.marital_status === 'widowed' ? 'Viúvo(a)' : null
          } />
          {m.address && (
            <View style={[s.field, { flexDirection: 'row', alignItems: 'flex-start', gap: 6 }]}>
              <MapPin size={14} color={colors.textSub} style={{ marginTop: 2 }} />
              <Text style={[s.fieldValue, { flex: 1 }]}>{m.address}</Text>
            </View>
          )}
        </View>

        {/* Dados eclesiásticos */}
        <View style={[base.card, s.section]}>
          <Text style={s.sectionTitle}>Dados eclesiásticos</Text>
          <Field label="Status" value={STATUS_LABELS[m.status]} />
          <Field label="Data de batismo" value={m.baptism_date ? format(parseISO(m.baptism_date), "dd/MM/yyyy", { locale: ptBR }) : null} />
          <Field label="Igreja de origem" value={m.origin_church} />
          <Field label="Cadastrado em" value={format(parseISO(m.created_at), "dd/MM/yyyy", { locale: ptBR })} />
        </View>

        {/* Ministérios */}
        {m.member_ministries?.length > 0 && (
          <View style={[base.card, s.section]}>
            <Text style={s.sectionTitle}>Ministérios</Text>
            <View style={s.tags}>
              {m.member_ministries.map((mm: any) => (
                <View key={mm.id} style={s.tag}>
                  <Text style={s.tagText}>
                    {mm.ministries?.name} · {mm.role === 'leader' ? 'Líder' : mm.role === 'coordinator' ? 'Coord.' : 'Membro'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Observações */}
        {m.notes && (
          <View style={[base.card, s.section]}>
            <Text style={s.sectionTitle}>Observações</Text>
            <Text style={s.fieldValue}>{m.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border },
  headerTitle:  { fontSize: 15, fontWeight: '600', color: colors.text },
  content:      { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  profileCard:  { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 0.5, borderColor: colors.border },
  avatar:       { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:   { fontSize: 22, fontWeight: '600', color: colors.brand },
  name:         { fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3, marginBottom: 6 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 16 },
  badgeText:    { fontSize: 12, fontWeight: '500' },
  actions:      { flexDirection: 'row', gap: 12 },
  actionBtn:    { alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.bg },
  actionText:   { fontSize: 11, color: colors.textSub, fontWeight: '500' },
  section:      { padding: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  field:        { marginBottom: 10 },
  fieldLabel:   { fontSize: 11, color: colors.textSub, marginBottom: 2 },
  fieldValue:   { fontSize: 14, color: colors.text },
  tags:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: colors.brandLight },
  tagText:      { fontSize: 12, color: colors.brand, fontWeight: '500' },
})
