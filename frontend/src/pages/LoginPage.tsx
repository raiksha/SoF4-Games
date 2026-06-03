import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../services/authService'

export default function LoginPage() {

    const navigate = useNavigate()

    const [isRegister, setIsRegister] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        setError(null)

        if (isRegister && password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        try {
            setLoading(true)

            const response = isRegister
                ? await register(email, password)
                : await login(email, password)

            localStorage.setItem('token', response.token)
            localStorage.setItem('userId', response.userId)
            localStorage.setItem('email', response.email)

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
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: 'var(--color-bg)',
                paddingTop: 'var(--nav-height)',
            }}
        >
            {/* Box principal */}
            <div
                className="w-full max-w-md p-8"
                style={{
                    background: 'linear-gradient(180deg, #14022a, #05010d)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: '0 0 40px rgba(255, 0, 208, 0.12)',
                    padding: '1.5rem'
                }}
            >
                {/* Títulos */}
                <div className="mb-8 text-center">
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{
                            color: 'var(--color-text)',
                            fontFamily: 'Montserrat, sans-serif',
                            marginTop: '0.5rem',
                        }}
                    >
                        {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                    </h1>

                    <p
                        style={{
                            color: 'var(--color-text-muted)',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {isRegister
                            ? 'Regístrate para comenzar a comprar juegos'
                            : 'Accede a tu cuenta de SoF4 Games'}
                    </p>
                </div>
                {/* Formularios y botón */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ marginBottom: '0.5rem', }}>

                    <div>
                        <label
                            className="block mb-2 text-sm"
                            style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-text)',
                                padding: '0.2rem 0.7rem',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            className="block mb-2 text-sm"
                            style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', }}
                        >
                            Contraseña
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-text)',
                                padding: '0.2rem 0.7rem',
                            }}
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label
                                className="block mb-2 text-sm"
                                style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', }}
                            >
                                Confirmar contraseña
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    color: 'var(--color-text)',
                                    padding: '0.2rem 0.7rem',
                                }}
                            />
                        </div>
                    )}

                    {error && (
                        <div
                            className="px-4 py-3 text-sm"
                            style={{
                                background: 'rgba(255, 0, 80, 0.12)',
                                border: '1px solid rgba(255, 0, 80, 0.3)',
                                borderRadius: '12px',
                                color: '#ff8aa8',
                                padding: '1rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-semibold transition-all"
                        style={{
                            background: 'linear-gradient(90deg, #ff00d0, #00f2ff)',
                            borderRadius: '12px',
                            color: '#05010d',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '0.5rem',
                            margin: '0.5rem 0',
                        }}
                    >
                        {loading
                            ? 'Cargando...'
                            : isRegister
                                ? 'Crear cuenta'
                                : 'Ingresar'}
                    </button>

                </form>
                {/* Link login/registro */}
                <div className="mt-6 text-center">

                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister)
                            setError(null)
                        }}
                        className="text-sm transition-all hover:opacity-80"
                        style={{
                            color: 'var(--color-accent-alt)',
                        }}
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>

                </div>

            </div>

        </main>
    )
}
