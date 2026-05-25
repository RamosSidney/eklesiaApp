'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login:  (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState>({} as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('ekl_token')
    if (saved) {
      setToken(saved)
      api.get<User>('/api/auth/me')
        .then(setUser)
        .catch(() => { localStorage.removeItem('ekl_token'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password })
    localStorage.setItem('ekl_token', res.token)
    setToken(res.token)
    setUser(res.user)
    router.push('/dashboard')
  }

  function logout() {
    localStorage.removeItem('ekl_token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
