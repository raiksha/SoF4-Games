import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCartItems, removeFromCart } from '../services/cartService'
import { getLibrary } from '../services/libraryService'
import { useCart } from '../context/CartContext'
import type { CartItem } from '../services/cartService'

const STEPS    = ['Carrito', 'Pago', 'Confirmación']
const COUPON   = 'javalimos24'

export default function CartPage() {
  const navigate = useNavigate()
  const { refreshCart } = useCart()
  const [items, setItems]               = useState<CartItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [removingId, setRemovingId]     = useState<number | null>(null)
  const [coupon, setCoupon]             = useState('')
  const [discount, setDiscount]         = useState(0)
  const [couponError, setCouponError]   = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [libraryIds, setLibraryIds]     = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    Promise.all([
      getCartItems(),
      token ? getLibrary().catch(() => []) : Promise.resolve([]),
    ]).then(([cartItems, libItems]) => {
      setItems(cartItems)
      setLibraryIds(new Set((libItems as { steamAppId: number }[]).map(l => l.steamAppId)))
    }).catch(() => setError('No se pudo cargar el carrito'))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (gameId: number) => {
    setRemovingId(gameId)
    try {
      await removeFromCart(gameId)
      setItems(prev => prev.filter(i => i.gameId !== gameId))
      refreshCart()
    } catch {
      setError('No se pudo eliminar el juego')
    } finally {
      setRemovingId(null)
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('')
    if (coupon.trim().toLowerCase() === COUPON) {
      setDiscount(subtotal)
      setCouponApplied(true)
    } else {
      setDiscount(0)
      setCouponApplied(false)
      setCouponError('Cupón no válido')
    }
  }

  const subtotal      = items.reduce((sum, i) => sum + i.priceFinal, 0)
  const total         = Math.max(0, subtotal - discount)
  const iva           = Math.round(total * 0.19)
  const currency      = items[0]?.currency ?? 'CLP'
  const fmt = (n: number) => `$${new Intl.NumberFormat('es-CL').format(n / 100)}`

  const inLibrary = (item: CartItem) => libraryIds.has(item.steamAppId)
  const hasLibraryConflict = items.some(inLibrary)

  const baseMain: React.CSSProperties = {
    flex: 1,
    paddingTop: 'calc(var(--nav-height) + 32px)',
    paddingBottom: 40,
    paddingLeft: 24,
    paddingRight: 24,
    background: 'var(--color-bg)',
  }

  if (loading) return (
    <main style={{ ...baseMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Cargando carrito...</p>
    </main>
  )

  if (error) return (
    <main style={{ ...baseMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}>{error}</p>
    </main>
  )

  if (items.length === 0) return (
    <main style={{ ...baseMain, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Tu carrito está vacío</p>
      <button
        onClick={() => navigate('/')}
        style={{ padding: '10px 28px', borderRadius: 8, background: 'linear-gradient(135deg,var(--color-accent),var(--color-accent-alt))', color: '#fff', fontFamily: 'var(--font-cta)', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: 'var(--glow-accent)' }}
      >
        Explorar tienda
      </button>
    </main>
  )

  return (
    <main style={baseMain}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {STEPS.map((step, i) => (
            <>
              <div key={step} style={{
                padding: '7px 20px', fontSize: 12, whiteSpace: 'nowrap',
                fontWeight: i === 0 ? 700 : 500, fontFamily: 'var(--font-body)',
                borderRadius: 8, border: '2px solid',
                borderColor: i === 0 ? '#cc00d4' : 'rgba(255,255,255,0.08)',
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.28)',
                background: i === 0 ? 'rgba(204,0,212,0.15)' : 'transparent',
              }}>
                {step}
              </div>
              {i < STEPS.length - 1 && (
                <div key={`line-${i}`} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)' }} />
              )}
            </>
          ))}
        </div>

        {/* Título */}
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-title)', color: '#fff' }}>
          Tu carrito · {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
        </h1>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Lista de ítems */}
          <div style={{ flex: 1, minWidth: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
            {items.map((item, i) => {
              const conflict = inLibrary(item)
              return (
                <div key={item.gameId} style={{
                  borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <img src={item.headerImage} alt={item.name}
                      style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-title)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </p>
                      <p style={{ margin: '3px 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
                        Edición Estándar · PC
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
                          Mover a deseos
                        </button>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>|</span>
                        <button
                          onClick={() => handleRemove(item.gameId)}
                          disabled={removingId === item.gameId}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: removingId === item.gameId ? 'not-allowed' : 'pointer', fontSize: 12, color: removingId === item.gameId ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}
                        >
                          {removingId === item.gameId ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-price)', color: '#fff', fontSize: 15 }}>
                        {fmt(item.priceFinal)}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
                        IVA incluido
                      </p>
                    </div>
                  </div>

                  {/* Aviso biblioteca */}
                  {conflict && (
                    <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>⚠️</span>
                      <p style={{ margin: 0, fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                        Ya tienes este juego en tu biblioteca
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Panel resumen */}
          <div style={{ width: 296, flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, background: 'var(--color-bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>

            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
              Resumen del pedido
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13, fontFamily: 'var(--font-body)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
                <span style={{ color: '#fff' }}>{fmt(subtotal)}</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Descuento (100%)</span>
                  <span style={{ color: '#00c26e' }}>-{fmt(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>IVA (incluido)</span>
                <span style={{ color: '#fff' }}>{fmt(iva)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-price)', color: '#fff' }}>
              <span>Total {currency}</span>
              <span>{fmt(total)}</span>
            </div>

            {/* Cupón */}
            {!couponApplied ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
                  Código de descuento
                </p>
                <input
                  type="text"
                  value={coupon}
                  onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Ingresa cupón"
                  style={{
                    padding: '9px 12px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${couponError ? '#ff6b6b' : 'rgba(255,255,255,0.12)'}`,
                    color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13,
                    outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
                {couponError && (
                  <p style={{ margin: 0, fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-body)' }}>
                    {couponError}
                  </p>
                )}
                {coupon && !couponError && (
                  <button onClick={handleApplyCoupon} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: 'var(--color-accent-alt)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textAlign: 'left' }}>
                    Aplicar cupón
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,194,110,0.1)', border: '1px solid rgba(0,194,110,0.3)' }}>
                <span style={{ fontSize: 14 }}>🎟️</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#00c26e', fontFamily: 'var(--font-body)' }}>
                    {COUPON} aplicado
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
                    100% de descuento
                  </p>
                </div>
              </div>
            )}

            {/* Aviso conflicto biblioteca */}
            {hasLibraryConflict && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-body)' }}>
                  Elimina los juegos que ya tienes en tu biblioteca antes de continuar.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (hasLibraryConflict) return
                sessionStorage.setItem('checkout_coupon', couponApplied ? COUPON : '')
                navigate('/checkout')
              }}
              disabled={hasLibraryConflict}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 8,
                background: hasLibraryConflict
                  ? 'rgba(255,255,255,0.08)'
                  : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
                color: hasLibraryConflict ? 'rgba(255,255,255,0.3)' : '#fff',
                fontFamily: 'var(--font-cta)', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: hasLibraryConflict ? 'not-allowed' : 'pointer',
                boxSizing: 'border-box',
                boxShadow: hasLibraryConflict ? 'none' : 'var(--glow-accent)',
              }}
            >
              Pagar {fmt(total)}
            </button>

            <p style={{ margin: 0, fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
              Compra protegida · Reembolso 14 días
            </p>

            <button
              onClick={() => {
                if (hasLibraryConflict) return
                sessionStorage.setItem('checkout_coupon', couponApplied ? COUPON : '')
                navigate('/checkout')
              }}
              style={{ background: 'none', border: 'none', cursor: hasLibraryConflict ? 'not-allowed' : 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textAlign: 'center', opacity: hasLibraryConflict ? 0.4 : 1 }}
            >
              Continuar con el pago →
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
