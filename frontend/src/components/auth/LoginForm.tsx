import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../../services/authService'

import AuthInput from './AuthInput'
import AuthError from './AuthError'

export default function LoginForm() {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [showRecoveryInfo, setShowRecoveryInfo] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault()

        setError(null)

        try {

            setLoading(true)

            const response = await login(email, password)

            localStorage.setItem('token', response.token)
            localStorage.setItem('email', response.email)
            localStorage.setItem('username', response.username)

            navigate('/')

        } catch (err) {

            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Ocurrió un error inesperado')
            }

        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
        >

            <AuthInput
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
            />

            <AuthInput
                label="Contraseña"
                type="password"
                value={password}
                onChange={setPassword}
                required
            />

            <button
                type="button"
                onClick={() => setShowRecoveryInfo(prev => !prev)}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginTop: '-0.5rem',
                    textAlign: 'left',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                }}
            >
                ¿Olvidaste tu contraseña?
            </button>

            {showRecoveryInfo && (
                <div
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    La recuperación de contraseña se encuentra planificada para una próxima versión de SoF4 Games.
                </div>
            )}

            {error && (
                <AuthError message={error} />
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold transition-all"
                style={{
                    background: 'linear-gradient(90deg, #ff00d0, #00f2ff)',
                    borderRadius: '12px',
                    color: '#fff',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    margin: '0.5rem 0',
                }}
            >
                {loading
                    ? 'Cargando...'
                    : 'Ingresar'}
            </button>
        </form>
    )
}
