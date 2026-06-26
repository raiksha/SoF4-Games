import { useEffect, useRef } from 'react'
import { X, Heart, ExternalLink } from 'lucide-react'

/** Formulario externo de captación de la wishlist (campaña de lanzamiento) */
const WISHLIST_FORM_URL = 'https://forms.gle/Dp8fgNZvjQ4GnhMN9'

interface Props {
    isOpen:  boolean
    onClose: () => void
}

export default function WishlistModal({ isOpen, onClose }: Props) {
    const closeBtnRef = useRef<HTMLButtonElement>(null)

    // Cerrar con Escape + bloquear scroll del body mientras está abierto
    useEffect(() => {
        if (!isOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKeyDown)

        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        // Foco inicial en el botón de cerrar (accesibilidad)
        closeBtnRef.current?.focus()

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="wishlist-modal-title"
                aria-describedby="wishlist-modal-desc"
                className="animate-fade-in"
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%', maxWidth: '440px',
                    background: 'var(--grad-card)',
                    border: '1px solid rgba(255,0,208,0.35)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--card-shadow-hover)',
                    padding: '2.25rem 1.75rem 1.75rem',
                    textAlign: 'center',
                }}
            >
                {/* Cerrar */}
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    aria-label="Cerrar"
                    style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', display: 'flex',
                        padding: '4px', borderRadius: '6px', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
                >
                    <X size={20} />
                </button>

                {/* Icono */}
                <div
                    style={{
                        width: 64, height: 64, margin: '0 auto 1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        background: 'rgba(255,0,208,0.12)',
                        border: '1px solid rgba(255,0,208,0.35)',
                        boxShadow: 'var(--glow-accent)',
                    }}
                >
                    <Heart size={30} style={{ color: 'var(--color-accent)' }} fill="var(--color-accent)" />
                </div>

                <h2
                    id="wishlist-modal-title"
                    style={{
                        fontFamily: 'var(--font-title)', fontSize: '1.4rem',
                        color: 'var(--color-text)', marginBottom: '0.75rem',
                    }}
                >
                    Únete a la wishlist
                </h2>

                <p
                    id="wishlist-modal-desc"
                    style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                        lineHeight: 1.55, color: 'var(--color-text-muted)',
                        marginBottom: '1.75rem',
                    }}
                >
                    ¿Te interesa <strong style={{ color: 'var(--color-text)' }}>SoF4-Games</strong>?
                    Déjanos tu correo en nuestro formulario y sé el primero en enterarte
                    de novedades, lanzamientos y ofertas exclusivas. 🚀
                </p>

                {/* CTA → formulario externo */}
                <a
                    href={WISHLIST_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', width: '100%',
                        padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-btn)',
                        fontFamily: 'var(--font-cta)', fontSize: '0.95rem', fontWeight: 600,
                        color: '#fff', background: 'var(--color-accent)',
                        boxShadow: 'var(--glow-accent)', transition: 'transform 0.15s, filter 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none' }}
                >
                    Abrir formulario
                    <ExternalLink size={16} />
                </a>

                {/* Descartar */}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '0.875rem', background: 'transparent', border: 'none',
                        color: 'var(--color-text-muted)', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                        textDecoration: 'underline', textUnderlineOffset: '2px',
                    }}
                >
                    Ahora no
                </button>
            </div>
        </div>
    )
}
