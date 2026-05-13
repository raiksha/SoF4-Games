// components/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, X, Gamepad2, User } from 'lucide-react'

interface NavbarProps {
  cartCount?: number
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef                = useRef<HTMLInputElement>(null)
  const location                      = useLocation()

  // Enfocar el input cuando se abre la búsqueda
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  // Cerrar búsqueda con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{ background: 'var(--color-bg-nav)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}
    >
      {/* ── Izquierda: tabs de navegación ── */}
      <div className="flex items-center gap-1">
        <NavTab to="/"         label="Tienda"    active={isActive('/')    && location.pathname === '/'} />
        <NavTab to="/library"  label="Biblioteca" active={isActive('/library')} />
      </div>

      {/* ── Centro: logo ── */}
      <Link
        to="/"
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))', boxShadow: 'var(--glow-accent)' }}
        >
          <Gamepad2 size={18} className="text-white" />
        </div>
        <span
          className="text-sm font-bold tracking-widest uppercase transition-all duration-300"
          style={{ fontFamily: 'var(--font-title)', letterSpacing: '0.2em' }}
        >
          <span className="text-white group-hover:opacity-80 transition-opacity">SOF4</span>
          {' '}
          <span style={{ color: 'var(--color-accent)' }}>GAMES</span>
        </span>
      </Link>

      {/* ── Derecha: búsqueda + carrito + avatar ── */}
      <div className="flex items-center gap-2">
        {/* Barra de búsqueda expandible */}
        <div className="flex items-center">
          {/* Input — se expande hacia la izquierda */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: searchOpen ? '220px' : '0px' }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar juegos, tags…"
              className="w-full h-8 px-3 text-sm bg-transparent outline-none"
              style={{
                border: 'none',
                borderBottom: `1px solid var(--color-accent)`,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Botón lupa / cerrar */}
          <button
            onClick={() => { setSearchOpen(o => !o); if (searchOpen) setSearchQuery('') }}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.color = 'var(--color-accent)'
              el.style.textShadow = '0 0 12px var(--color-accent)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.color = 'var(--color-text-muted)'
              el.style.textShadow = 'none'
            }}
            aria-label={searchOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* Carrito */}
        <Link
          to="/cart"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--color-accent-alt)'
            el.style.textShadow = '0 0 12px var(--color-accent-alt)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--color-text-muted)'
            el.style.textShadow = 'none'
          }}
          aria-label="Carrito"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: 'var(--color-accent)', fontFamily: 'var(--font-price)' }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* Avatar / perfil */}
        <Link
          to="/profile"
          className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-card)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--color-accent)'
            el.style.color = 'var(--color-accent)'
            el.style.boxShadow = 'var(--glow-accent)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--color-border)'
            el.style.color = 'var(--color-text-muted)'
            el.style.boxShadow = 'none'
          }}
          aria-label="Perfil"
        >
          <User size={16} />
        </Link>
      </div>
    </nav>
  )
}

// ── Sub-componente: tab de navegación ──
interface NavTabProps { to: string; label: string; active: boolean }

function NavTab({ to, label, active }: NavTabProps) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
      style={{
        fontFamily: 'var(--font-cta)',
        color:      active ? 'var(--color-text)' : 'var(--color-text-muted)',
        background: active ? 'rgba(255,0,208,0.1)' : 'transparent',
        border:     active ? '1px solid rgba(255,0,208,0.3)' : '1px solid transparent',
        textShadow: active ? '0 0 12px var(--color-accent)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'var(--color-text)'
          el.style.textShadow = '0 0 8px var(--color-accent)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'var(--color-text-muted)'
          el.style.textShadow = 'none'
        }
      }}
    >
      {label}
    </Link>
  )
}
