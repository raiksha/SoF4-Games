import { useState } from 'react'

import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'

export default function LoginPage() {

    const [isRegister, setIsRegister] = useState(false)

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
                        {isRegister
                            ? 'Crear cuenta'
                            : 'Iniciar sesión'}
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

                {isRegister
                    ? <RegisterForm />
                    : <LoginForm />}

                <div className="mt-6 text-center">

                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm transition-all hover:opacity-80"
                        style={{
                            color: 'var(--color-accent-alt)',
                        }}
                    >
                        {isRegister
                            ? '¿Ya tienes cuenta? Inicia sesión'
                            : '¿No tienes cuenta? Regístrate'}
                    </button>

                </div>

            </div>

        </main>
    )
}
