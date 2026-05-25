import { X, Loader2 } from 'lucide-react'

/* ── Button ──────────────────────────────────────────────── */
const variantStyles = {
  primary:   'bg-brand text-white border-transparent hover:bg-brand-dark',
  secondary: 'bg-white text-stone border border-default hover:bg-stone-50',
  danger:    'bg-red-600 text-white border-transparent hover:bg-red-700',
  ghost:     'bg-transparent text-stone border-transparent hover:bg-stone-100',
}

export function Button({ children, variant = 'secondary', size = 'md', loading, icon: Icon, className = '', ...props }) {
  const sizes = { sm: 'h-7 px-3 text-xs gap-1.5', md: 'h-9 px-4 text-sm gap-2', lg: 'h-11 px-6 text-base gap-2.5' }
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-body)', fontWeight: 500, cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
        borderRadius: 'var(--radius-md)', border: '1.5px solid', transition: 'all .15s',
        opacity: props.disabled || loading ? .6 : 1,
        ...sizeStyle(size),
        ...variantStyle(variant),
      }}
    >
      {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : Icon && <Icon size={14} />}
      {children}
    </button>
  )
}

function sizeStyle(s) {
  return { sm: { height:28, padding:'0 12px', fontSize:12, gap:6 }, md: { height:36, padding:'0 16px', fontSize:13.5, gap:8 }, lg: { height:44, padding:'0 24px', fontSize:15, gap:10 } }[s]
}
function variantStyle(v) {
  return {
    primary:   { background:'var(--brand-600)', color:'#fff', borderColor:'var(--brand-600)' },
    secondary: { background:'#fff', color:'var(--text-primary)', borderColor:'var(--border-default)' },
    danger:    { background:'#DC2626', color:'#fff', borderColor:'#DC2626' },
    ghost:     { background:'transparent', color:'var(--text-secondary)', borderColor:'transparent' },
  }[v]
}

/* ── Badge ───────────────────────────────────────────────── */
const BADGE_COLORS = {
  active:         { bg:'#F0FDF4', color:'#15803D', border:'#BBF7D0' },
  inactive:       { bg:'var(--stone-100)', color:'var(--stone-600)', border:'var(--stone-200)' },
  visitor:        { bg:'#EFF6FF', color:'#1D4ED8', border:'#BFDBFE' },
  in_discipleship:{ bg:'#FFF7ED', color:'#C2410C', border:'#FED7AA' },
  transferred:    { bg:'#F5F0FF', color:'var(--brand-700)', border:'var(--brand-200)' },
  deceased:       { bg:'var(--stone-100)', color:'var(--stone-500)', border:'var(--stone-200)' },
  default:        { bg:'var(--stone-100)', color:'var(--stone-600)', border:'var(--stone-200)' },
}

const STATUS_LABELS = {
  active: 'Ativo', inactive: 'Inativo', visitor: 'Visitante',
  in_discipleship: 'Discipulado', transferred: 'Transferido', deceased: 'Falecido',
}

export function Badge({ status, children, style }) {
  const c = BADGE_COLORS[status] || BADGE_COLORS.default
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:'var(--radius-full)', fontSize:11.5, fontWeight:500, background:c.bg, color:c.color, border:`1px solid ${c.border}`, ...style }}>
      {children || STATUS_LABELS[status] || status}
    </span>
  )
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({ children, style, className }) {
  return (
    <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-xs)', ...style }}>
      {children}
    </div>
  )
}

export function CardHeader({ children, style }) {
  return (
    <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-default)', display:'flex', alignItems:'center', justifyContent:'space-between', ...style }}>
      {children}
    </div>
  )
}

/* ── Modal ───────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 420, md: 580, lg: 760, xl: 960 }
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,23,18,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade" style={{ background:'var(--bg-card)', borderRadius:'var(--radius-xl)', width:'100%', maxWidth:widths[size], maxHeight:'90vh', overflow:'auto', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border-default)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:400 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', display:'flex', alignItems:'center', padding:4, borderRadius:'var(--radius-sm)' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ── FormField ───────────────────────────────────────────── */
export function FormField({ label, error, required, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label>{label}{required && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}</label>}
      {children}
      {error && <span style={{ fontSize:11.5, color:'var(--danger)' }}>{error}</span>}
    </div>
  )
}

/* ── Avatar ──────────────────────────────────────────────── */
const AVATAR_COLORS = [
  ['#F5F0FF','#6425D4'], ['#F0FDF4','#15803D'], ['#EFF6FF','#1D4ED8'],
  ['#FFF7ED','#C2410C'], ['#FDF2F8','#9D174D'], ['#F0FDFA','#0F766E'],
]
export function Avatar({ name = '', size = 36, src }) {
  const initials = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  const [bg, color] = AVATAR_COLORS[idx]
  if (src) return <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover' }} />
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.34, fontWeight:600, flexShrink:0, letterSpacing:'-.5px' }}>
      {initials || '?'}
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', gap:12, textAlign:'center' }}>
      {Icon && <div style={{ width:52, height:52, borderRadius:'var(--radius-lg)', background:'var(--stone-100)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--stone-400)' }}><Icon size={24} /></div>}
      <div>
        <p style={{ fontWeight:500, fontSize:'1rem', marginBottom:4 }}>{title}</p>
        {description && <p style={{ color:'var(--text-secondary)', fontSize:'.875rem', maxWidth:340 }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} style={{ animation:'spin 1s linear infinite', color:'var(--brand-500)' }} />
}

/* ── Table ───────────────────────────────────────────────── */
export function Table({ children }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>{children}</table>
    </div>
  )
}
export function Th({ children, style }) {
  return <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border-default)', background:'var(--stone-50)', ...style }}>{children}</th>
}
export function Td({ children, style }) {
  return <td style={{ padding:'12px 16px', borderBottom:'1px solid var(--border-default)', color:'var(--text-primary)', verticalAlign:'middle', ...style }}>{children}</td>
}

/* ── Alert / Toast ───────────────────────────────────────── */
export function Alert({ type = 'info', children }) {
  const map = { info:{ bg:'var(--info-bg)', color:'var(--info)', border:'#BFDBFE' }, success:{ bg:'var(--success-bg)', color:'var(--success)', border:'#BBF7D0' }, danger:{ bg:'var(--danger-bg)', color:'var(--danger)', border:'#FECACA' }, warning:{ bg:'var(--warning-bg)', color:'var(--warning)', border:'#FED7AA' } }
  const c = map[type]
  return <div style={{ padding:'10px 16px', borderRadius:'var(--radius-md)', background:c.bg, color:c.color, border:`1px solid ${c.border}`, fontSize:13.5 }}>{children}</div>
}
