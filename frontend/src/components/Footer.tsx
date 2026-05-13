// components/Footer.tsx
import { Link } from 'react-router-dom'
import { Gamepad2, MessageCircle, HeadphonesIcon, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      className="mt-auto pt-12 pb-6 px-6"
      style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Fila principal: 3 columnas ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Columna 1: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 w-fit group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))' }}
              >
                <Gamepad2 size={18} className="text-white" />
              </div>
              <span
                className="text-sm font-bold tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                <span className="text-white">SOF4</span>{' '}
                <span style={{ color: 'var(--color-accent)' }}>GAMES</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Marketplace enfocado en videojuegos indie latinoamericanos.{' '}
              <span style={{ color: 'var(--color-accent-alt)' }}>Hecho en Chile · CLP $</span>
            </p>
          </div>

          {/* Columna 2: Tienda */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-title)', letterSpacing: '0.15em' }}
            >
              Tienda
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Inicio',              to: '/' },
                { label: 'Ofertas',             to: '/store/sales' },
                { label: 'Categorías',          to: '/store/categories' },
                { label: 'Nuevos lanzamientos', to: '/store/new' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <FooterLink to={to} label={label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Cuenta */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-title)', letterSpacing: '0.15em' }}
            >
              Cuenta
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Mi perfil',     to: '/profile' },
                { label: 'Biblioteca',    to: '/library' },
                { label: 'Configuración', to: '/settings' },
                { label: 'Carrito',       to: '/cart' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <FooterLink to={to} label={label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Fila comunidad ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { icon: <MessageCircle size={15} />, label: 'Discord',  href: '#' },
            { icon: <HeadphonesIcon size={15} />, label: 'Soporte', href: '#' },
            { icon: <Mail size={15} />,           label: 'Contacto', href: '#' },
          ].map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200"
              style={{
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--color-accent-alt)'
                el.style.borderColor = 'var(--color-accent-alt)'
                el.style.boxShadow = 'var(--glow-alt)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--color-text-muted)'
                el.style.borderColor = 'var(--color-border)'
                el.style.boxShadow = 'none'
              }}
            >
              {icon}
              {label}
            </a>
          ))}
        </div>

        {/* ── Línea separadora ── */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            © 2026 SoF4 Games · Todos los derechos reservados · Hecho en Chile · CLP $
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm transition-all duration-200 w-fit"
      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--color-text)'
        el.style.textShadow = '0 0 8px var(--color-accent)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--color-text-muted)'
        el.style.textShadow = 'none'
      }}
    >
      {label}
    </Link>
  )
}
