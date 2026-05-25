import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { colors, base } from '@/lib/theme'

export default function LoginScreen() {
  const { login }  = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Preencha e-mail e senha'); return }
    setError(''); setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoIcon}>
            <Text style={s.logoStar}>✦</Text>
          </View>
          <Text style={s.logoTitle}>EklēsiaApp</Text>
          <Text style={s.logoSub}>Entre na sua conta</Text>
        </View>

        {/* Card */}
        <View style={[base.card, s.card]}>
          <View style={s.field}>
            <Text style={base.label}>E-mail</Text>
            <TextInput
              style={base.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          <View style={s.field}>
            <Text style={base.label}>Senha</Text>
            <TextInput
              style={base.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[base.btnPrimary, s.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={base.btnPrimaryText}>Entrar</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>EklēsiaApp © {new Date().getFullYear()}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap:  { alignItems: 'center', marginBottom: 28 },
  logoIcon:  {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoStar:  { fontSize: 22, color: '#FFF' },
  logoTitle: { fontSize: 22, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  logoSub:   { fontSize: 14, color: colors.textSub, marginTop: 4 },
  card:      { padding: 20, gap: 0 },
  field:     { marginBottom: 16 },
  btn:       { marginTop: 4 },
  errorBox:  { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#B91C1C', fontSize: 13 },
  footer:    { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 24 },
})
