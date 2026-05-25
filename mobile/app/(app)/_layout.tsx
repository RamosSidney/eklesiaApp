import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/lib/theme'
import { LayoutDashboard, Users, Building2, CalendarDays } from 'lucide-react-native'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }
  if (!user) return <Redirect href="/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Membros',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ministries"
        options={{
          title: 'Ministérios',
          tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
