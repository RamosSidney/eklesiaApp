import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/lib/theme'

export default function Index() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }
  return <Redirect href={user ? '/(app)/dashboard' : '/login'} />
}
