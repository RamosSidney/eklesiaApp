import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useCreateMember } from '@/hooks/useMembers'
import { colors, base } from '@/lib/theme'
import { ArrowLeft } from 'lucide-react-native'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={base.label}>{label}</Text>
      {children}
    </View>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <View style={s.selectWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={s.selectRow}>
          {options.map(o => (
            <TouchableOpacity
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[s.selectChip, value === o.value && s.selectChipActive]}
            >
              <Text style={[s.selectText, value === o.value && s.selectTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default function NewMemberScreen() {
  const router = useRouter()
  const createMember = useCreateMember()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', birth_date: '',
    marital_status: '', gender: '', address: '',
    status: 'visitor', baptism_date: '', origin_church: '', notes: '',
  })
  const [error, setError] = useState('')

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Nome é obrigatório'); return }
    setError('')
    try {
      const payload: any = { ...form }
      Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k] })
      await createMember.mutateAsync(payload)
      router.back()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar')
    }
  }

  return (
    <SafeAreaView style={base.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Novo membro</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={createMember.isPending}
            style={[base.btnPrimary, { paddingVertical: 8, paddingHorizontal: 14, opacity: createMember.isPending ? 0.6 : 1 }]}
          >
            {createMember.isPending
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={base.btnPrimaryText}>Salvar</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Dados pessoais */}
          <View style={[base.card, s.section]}>
            <Text style={s.sectionTitle}>Dados pessoais</Text>
            <Field label="Nome completo *">
              <TextInput style={base.input} placeholder="Nome Sobrenome" placeholderTextColor={colors.textMuted} value={form.full_name} onChangeText={set('full_name')} />
            </Field>
            <Field label="Data de nascimento (AAAA-MM-DD)">
              <TextInput style={base.input} placeholder="1990-03-15" placeholderTextColor={colors.textMuted} value={form.birth_date} onChangeText={set('birth_date')} keyboardType="numeric" />
            </Field>
            <Field label="CPF">
              <TextInput style={base.input} placeholder="000.000.000-00" placeholderTextColor={colors.textMuted} value={form.cpf ?? ''} onChangeText={set('cpf')} keyboardType="numeric" />
            </Field>
            <Field label="Estado civil">
              <Select value={form.marital_status} onChange={set('marital_status')} options={[
                { value: 'single',   label: 'Solteiro(a)' },
                { value: 'married',  label: 'Casado(a)' },
                { value: 'divorced', label: 'Divorciado(a)' },
                { value: 'widowed',  label: 'Viúvo(a)' },
              ]} />
            </Field>
            <Field label="Gênero">
              <Select value={form.gender} onChange={set('gender')} options={[
                { value: 'male',   label: 'Masculino' },
                { value: 'female', label: 'Feminino' },
                { value: 'other',  label: 'Outro' },
              ]} />
            </Field>
          </View>

          {/* Contato */}
          <View style={[base.card, s.section]}>
            <Text style={s.sectionTitle}>Contato</Text>
            <Field label="E-mail">
              <TextInput style={base.input} placeholder="email@exemplo.com" placeholderTextColor={colors.textMuted} value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
            </Field>
            <Field label="Telefone / WhatsApp">
              <TextInput style={base.input} placeholder="(11) 99999-0000" placeholderTextColor={colors.textMuted} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
            </Field>
            <Field label="Endereço">
              <TextInput style={base.input} placeholder="Rua, número, bairro, cidade" placeholderTextColor={colors.textMuted} value={form.address} onChangeText={set('address')} />
            </Field>
          </View>

          {/* Dados eclesiásticos */}
          <View style={[base.card, s.section]}>
            <Text style={s.sectionTitle}>Dados eclesiásticos</Text>
            <Field label="Status">
              <Select value={form.status} onChange={set('status')} options={[
                { value: 'visitor',          label: 'Visitante' },
                { value: 'in_discipleship',  label: 'Discipulado' },
                { value: 'active',           label: 'Ativo' },
                { value: 'inactive',         label: 'Inativo' },
              ]} />
            </Field>
            <Field label="Data de batismo (AAAA-MM-DD)">
              <TextInput style={base.input} placeholder="2019-06-12" placeholderTextColor={colors.textMuted} value={form.baptism_date} onChangeText={set('baptism_date')} keyboardType="numeric" />
            </Field>
            <Field label="Igreja de origem">
              <TextInput style={base.input} placeholder="Nome da igreja anterior" placeholderTextColor={colors.textMuted} value={form.origin_church} onChangeText={set('origin_church')} />
            </Field>
            <Field label="Observações">
              <TextInput
                style={[base.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Informações adicionais..."
                placeholderTextColor={colors.textMuted}
                value={form.notes}
                onChangeText={set('notes')}
                multiline
              />
            </Field>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:         { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border },
  headerTitle:     { fontSize: 15, fontWeight: '600', color: colors.text },
  content:         { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  section:         { padding: 16, gap: 0 },
  sectionTitle:    { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  field:           { marginBottom: 14 },
  selectWrap:      { marginTop: 2 },
  selectRow:       { flexDirection: 'row', gap: 6 },
  selectChip:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border },
  selectChipActive:{ backgroundColor: colors.brandLight, borderColor: colors.brand },
  selectText:      { fontSize: 13, color: colors.textSub, fontWeight: '500' },
  selectTextActive:{ color: colors.brand },
  errorBox:        { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12 },
  errorText:       { color: '#B91C1C', fontSize: 13 },
})
