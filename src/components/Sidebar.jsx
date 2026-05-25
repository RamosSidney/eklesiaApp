import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, Building2, CalendarDays, BarChart3, Settings, LogOut, ChurchIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/supabase'
import { Avatar } from '@/components/ui'

const NAV = [
  { label: 'Painel',      to: '/',            icon: LayoutDashboard },
  { label: 'Membros',     to: '/members',     icon: Users },
  { label: 'Ministérios', to: '/ministries',  icon: Building2 },
  { label: 'Eventos',     to: '/events',      icon: CalendarDays },
  { label: 'Relatórios',  to: '/reports',     icon: BarChart3 },
]

export default function Sidebar() {
  const { profile, church } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width:34, height:34, borderRadius:'var(--radius-md)', background:'var(--brand-600)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChurchIcon size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#fff', lineHeight:1.1 }}>EklēsiaApp</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:1 }}>
              {church?.name || 'Sua Igreja'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        <p style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', letterSpacing:'.1em', textTransform:'uppercase', padding:'6px 10px 8px' }}>Principal</p>
        {NAV.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 'var(--radius-md)',
              marginBottom: 2,
              fontSize: 13.5, fontWeight: 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
              background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'all .15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <p style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', letterSpacing:'.1em', textTransform:'uppercase', padding:'16px 10px 8px' }}>Config.</p>
        <NavLink to="/settings" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 'var(--radius-md)',
          fontSize: 13.5, fontWeight: 500,
          color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
          background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
          textDecoration: 'none', transition: 'all .15s',
        })}>
          <Settings size={16} />
          Configurações
        </NavLink>
      </nav>

      {/* User footer */}
      <div style={{ padding:'14px 14px', borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10 }}>
        <Avatar name={profile?.full_name || 'Admin'} size={34} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12.5, fontWeight:500, color:'rgba(255,255,255,.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {profile?.full_name || 'Administrador'}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{profile?.role || 'admin'}</div>
        </div>
        <button onClick={handleSignOut} title="Sair" style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.4)', padding:4, borderRadius:'var(--radius-sm)', display:'flex' }}>
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
