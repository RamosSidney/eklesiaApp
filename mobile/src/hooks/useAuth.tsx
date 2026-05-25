import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { api, setToken, clearToken, getToken } from '@/lib/api'

interface User {
  id: string
  full_name?: string
  role: string
  church_id: string
  churches?: { name: string }
}

interface AuthState {
  user: User | null
  loading: boolean
  login:  (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState>({} as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router  = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getToken().then(token => {
      if (token) {
        api.get<User>('/api/auth/me')
          .then(setUser)
          .catch(() => { clearToken(); setUser(null) })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password })
    await setToken(res.token)
    setUser(res.user)
    router.replace('/(app)/dashboard')
  }

  async function logout() {
    await clearToken()
    setUser(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
