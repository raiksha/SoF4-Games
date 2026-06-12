import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCartItems, checkout } from '../services/cartService'
import { getWalletBalance } from '../services/walletService'
import type { CartItem, CheckoutResponse } from '../services/cartService'
import { useCart } from '../context/CartContext'

type PayMethod = 'card' | 'webpay' | 'wallet'

const STEPS = ['Carrito', 'Pago', 'Confirmación']

/* ── Stepper ──────────────────────────────────────────────────────── */
function Stepper({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEPS.map((step, i) => {
        const done    = i < active
        const current = i === active
        return (
          <>
            <div key={step} style={{
              padding: '7px 20px', fontSize: 12, whiteSpace: 'nowrap',
              fontWeight: current ? 700 : 500, fontFamily: 'var(--font-body)',
              borderRadius: 8, border: '2px solid',
              borderColor: current ? '#cc00d4' : done ? 'rgba(204,0,212,0.35)' : 'rgba(255,255,255,0.08)',
              color: current ? '#fff' : done ? 'rgba(204,0,212,0.8)' : 'rgba(255,255,255,0.28)',
              background: current ? 'rgba(204,0,212,0.15)' : done ? 'rgba(204,0,212,0.06)' : 'transparent',
              transition: 'all 0.3s ease',
            }}>
              {done ? `${step} ✓` : step}
            </div>
            {i < STEPS.length - 1 && (
              <div key={`line-${i}`} style={{ flex: 1, height: 2, background: done ? 'rgba(204,0,212,0.4)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
            )}
          </>
        )
      })}
    </div>
  )
}

/* ── Input con foco accent ────────────────────────────────────────── */
function FormInput({ label, value, onChange, placeholder, maxLength, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; maxLength?: number; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          padding: '11px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
          color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14,
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(255,0,208,0.12)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function CheckoutPage() {
  const navigate                        = useNavigate()
  const [items, setItems]               = useState<CartItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [paying, setPaying]             = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<CheckoutResponse | null>(null)
  const [method, setMethod]             = useState<PayMethod>('card')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [toast, setToast]               = useState(false)
  const { refreshCart }                 = useCart()

  useEffect(() => {
    if (
        sessionStorage.getItem('checkout_completed') === 'true' &&
        items.length === 0 &&
        !loading
    ) {
        navigate('/library', { replace: true })
    }
  }, [items, loading, navigate])

  // Cupón siempre activo — viene del paso 1 o se auto-aplica aquí
  const COUPON_CODE = 'javalimos24'
  useEffect(() => {
    const existing = sessionStorage.getItem('checkout_coupon') ?? ''
    if (!existing) {
      sessionStorage.setItem('checkout_coupon', COUPON_CODE)
      setToast(true)
      setTimeout(() => setToast(false), 4000)
    }
  }, [])

  const couponFromCart = sessionStorage.getItem('checkout_coupon') ?? COUPON_CODE
  const hasCoupon = true

  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry]   = useState('')
  const [cvv, setCvv]         = useState('')
  const [rut, setRut]         = useState('')
  const [holder, setHolder]   = useState('')

  const username = localStorage.getItem('username') ?? 'Usuario'
  const email    = localStorage.getItem('email') ?? ''

  useEffect(() => {
    Promise.all([
      getCartItems(),
      getWalletBalance().catch(() => ({ balance: 0, currency: 'CLP' })),
    ]).then(([cartItems, wallet]) => {
      setItems(cartItems)
      setWalletBalance(wallet.balance)
    }).catch(() => setError('No se pudo cargar el carrito'))
      .finally(() => setLoading(false))
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.priceFinal, 0)
  const discount = hasCoupon ? subtotal : 0
  const total    = Math.max(0, subtotal - discount)
  const iva      = Math.round(total * 0.19)
  const currency = items[0]?.currency ?? 'CLP'
  const fmt = (n: number) => `$${new Intl.NumberFormat('es-CL').format(n / 100)}`

  const walletSufficient = walletBalance !== null && walletBalance >= total

  const handleCheckout = async () => {
    // Validación wallet antes de llamar al servidor
    if (method === 'wallet' && !hasCoupon && !walletSufficient) {
      setError('Saldo insuficiente en tu wallet. Recarga o usa un cupón.')
      return
    }
    setPaying(true)
    setError(null)
    try {
      const result = await checkout({
        coupon: hasCoupon ? couponFromCart : undefined,
        paymentMethod: method,
      })

      await refreshCart()

      sessionStorage.removeItem('checkout_coupon')
      setConfirmation(result)
      sessionStorage.setItem('checkout_completed', 'true')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el pago')
    } finally {
      setPaying(false)
    }
  }

  const baseStyle: React.CSSProperties = {
    flex: 1,
    paddingTop: 'calc(var(--nav-height) + 32px)',
    paddingBottom: 48,
    paddingLeft: 24,
    paddingRight: 24,
    background: 'var(--color-bg)',
  }

  if (loading) return (
    <main style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Cargando...</p>
    </main>
  )

  /* ── Confirmación ──────────────────────────────────────────────── */
  if (confirmation) return (
    <main style={baseStyle}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Stepper active={2} />
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(255,0,208,0.4)', marginBottom: 20, fontSize: 32,
          }}>✓</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff' }}>
            ¡Compra realizada!
          </h1>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
            Gracias, <strong style={{ color: '#fff' }}>{username}</strong>. Tu pedido fue procesado con éxito.
          </p>
          {email && (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
              Recibirás un email de confirmación en {email}
            </p>
          )}
          <div style={{
            display: 'inline-block', marginTop: 16, padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(255,0,208,0.3)', background: 'rgba(255,0,208,0.06)',
            fontSize: 13, fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.7)',
          }}>
            N° de pedido:&nbsp;<strong style={{ color: '#fff', fontFamily: 'var(--font-price)' }}>{confirmation.orderId}</strong>
          </div>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
              Resumen de la compra
            </p>
          </div>
          {confirmation.games.map((game, i) => (
            <div key={game.gameId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < confirmation.games.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <img src={game.headerImage} alt={game.name} style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-title)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {game.name} — Edición Estándar
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
                  PC · Descarga digital
                </p>
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-price)', color: '#fff', flexShrink: 0 }}>
                {fmt(game.pricePaid)}
              </p>
            </div>
          ))}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-price)', color: '#fff', fontSize: 15 }}>Total pagado</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-price)', color: '#fff', fontSize: 17 }}>{fmt(confirmation.total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/library')}
            style={{ padding: '12px 32px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))', color: '#fff', fontFamily: 'var(--font-cta)', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: 'var(--glow-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Ir a mi biblioteca</button>
          <button onClick={() => navigate('/')}
            style={{ padding: '12px 32px', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-cta)', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
          >Seguir comprando</button>
        </div>
      </div>
    </main>
  )

  /* ── Vista de Pago ─────────────────────────────────────────────── */
  const walletLabel = walletBalance !== null
    ? `${currency} ${fmt(walletBalance)} disponible`
    : 'Cargando saldo...'

  const METHODS: { id: PayMethod; icon: string; label: string; sub: string }[] = [
    { id: 'card',   icon: '💳', label: 'Tarjeta crédito / débito', sub: 'Visa · Mastercard' },
    { id: 'webpay', icon: '🏦', label: 'Webpay (transferencia)',   sub: 'Bancos chilenos'   },
    { id: 'wallet', icon: '👛', label: 'Saldo SoF4 Wallet',        sub: walletLabel         },
  ]

  const payBtnDisabled = paying || items.length === 0
    || (method === 'wallet' && !hasCoupon && !walletSufficient)

  return (
    <main style={baseStyle}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        {/* Toast cupón auto-aplicado */}
        {toast && (
          <div style={{
            position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
            zIndex: 999, padding: '12px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
            color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 24px rgba(204,0,212,0.4)',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeIn 0.3s ease',
          }}>
            🎉 ¡Enhorabuena! Desbloqueaste un cupón especial — 100% de descuento aplicado
          </div>
        )}

        <button
          onClick={() => navigate('/cart')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', marginBottom: 20, padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          ← Volver al carrito
        </button>

        <Stepper active={1} />

        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#ff6b6b', fontFamily: 'var(--font-body)' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Formulario ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Método de pago */}
            <section>
              <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff' }}>
                Método de pago
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {METHODS.map(opt => {
                  const isWalletInsufficient = opt.id === 'wallet' && !hasCoupon && !walletSufficient
                  const isCardDisabled = (opt.id === 'card' || opt.id === 'webpay') && !hasCoupon
                  const isDisabled = isWalletInsufficient || isCardDisabled

                  let subLabel = opt.sub
                  if (isWalletInsufficient) subLabel = 'Saldo insuficiente'
                  if (isCardDisabled) subLabel = 'Requiere cupón activo'

                  return (
                    <label key={opt.id} onClick={() => !isDisabled && setMethod(opt.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px', borderRadius: 10,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: `1px solid ${method === opt.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.09)'}`,
                      background: method === opt.id ? 'rgba(255,0,208,0.06)' : 'rgba(255,255,255,0.02)',
                      boxShadow: method === opt.id ? '0 0 0 1px rgba(255,0,208,0.2) inset' : 'none',
                      opacity: isDisabled ? 0.38 : 1,
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${method === opt.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: method === opt.id ? '0 0 8px rgba(255,0,208,0.5)' : 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          {method === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: method === opt.id ? 600 : 400, fontFamily: 'var(--font-body)', color: method === opt.id ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                          {opt.icon}&nbsp;&nbsp;{opt.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: isDisabled ? '#ff6b6b' : 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
                        {subLabel}
                      </span>
                      <input type="radio" name="method" value={opt.id} checked={method === opt.id} onChange={() => !isDisabled && setMethod(opt.id)} style={{ display: 'none' }} />
                    </label>
                  )
                })}
              </div>
            </section>

            {/* Datos de tarjeta */}
            {method === 'card' && (
              <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff' }}>
                  Datos de tarjeta
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FormInput label="Número de tarjeta" value={cardNum} onChange={setCardNum} placeholder="4716  ——  ——  ——" maxLength={19} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <FormInput label="Vencimiento" value={expiry} onChange={setExpiry} placeholder="MM / AA" maxLength={7} />
                    <FormInput label="CVV" value={cvv} onChange={setCvv} placeholder="123" maxLength={4} />
                    <FormInput label="RUT" value={rut} onChange={setRut} placeholder="12.345.678-9" />
                  </div>
                </div>
              </section>
            )}

            {method === 'card' && (
              <section>
                <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff' }}>
                  Dirección de facturación
                </h2>
                <div style={{ maxWidth: 360 }}>
                  <FormInput label="Nombre en tarjeta" value={holder} onChange={setHolder} placeholder="Nombre Apellido" />
                </div>
              </section>
            )}
          </div>

          {/* ── Panel resumen ── */}
          <div style={{ width: 296, flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, background: 'var(--color-bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)' }}>
              Resumen del pedido
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13, fontFamily: 'var(--font-body)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
                <span style={{ color: '#fff' }}>{fmt(subtotal)}</span>
              </div>
              {hasCoupon && (
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

            {/* Cupón heredado del paso 1 */}
            {hasCoupon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,194,110,0.1)', border: '1px solid rgba(0,194,110,0.3)' }}>
                <span style={{ fontSize: 14 }}>🎟️</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#00c26e', fontFamily: 'var(--font-body)' }}>
                    {couponFromCart} aplicado
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
                    100% de descuento
                  </p>
                </div>
              </div>
            )}

            {/* Wallet con saldo en tiempo real */}
            {method === 'wallet' && walletBalance !== null && !hasCoupon && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: walletSufficient ? 'rgba(0,194,110,0.07)' : 'rgba(255,107,107,0.08)', border: `1px solid ${walletSufficient ? 'rgba(0,194,110,0.25)' : 'rgba(255,107,107,0.25)'}` }}>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: walletSufficient ? '#00c26e' : '#ff6b6b', fontFamily: 'var(--font-body)' }}>
                  {walletSufficient ? 'Saldo suficiente' : 'Saldo insuficiente'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
                  Disponible: {fmt(walletBalance)} · Se descontará: {fmt(total)}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-price)', color: '#fff' }}>
              <span>Total {currency}</span>
              <span>{fmt(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={payBtnDisabled}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 8,
                background: payBtnDisabled
                  ? 'rgba(255,255,255,0.08)'
                  : paying
                  ? 'rgba(255,0,208,0.25)'
                  : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
                color: payBtnDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
                fontFamily: 'var(--font-cta)', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: payBtnDisabled ? 'not-allowed' : 'pointer',
                boxShadow: payBtnDisabled ? 'none' : 'var(--glow-accent)',
                boxSizing: 'border-box',
                transition: 'opacity 0.2s',
              }}
            >
              {paying ? 'Procesando...' : `Pagar ${fmt(total)}`}
            </button>

            <p style={{ margin: 0, fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
              Compra protegida · Reembolso 14 días
            </p>

            <button onClick={handleCheckout} disabled={payBtnDisabled}
              style={{ background: 'none', border: 'none', cursor: payBtnDisabled ? 'not-allowed' : 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textAlign: 'center', opacity: payBtnDisabled ? 0.4 : 1 }}
            >
              Continuar con el pago →
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
