import { useEffect, useState } from 'react'
import type { Game } from '../types'
import { gameService } from '../services/gameService'
import GameCard from '../components/store/GameCard'

export default function GamesPage() {

    const [games, setGames]     = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {

        gameService
            .getAll(0, 20)
            .then(data => {
                setGames(data)
                setError(null)
            })
            .catch(err => {
                setError(err.message)
            })
            .finally(() => {
                setLoading(false)
            })

    }, [])

    if (loading) {
        return (
            <main
                className="min-h-screen"
                style={{
                    background: 'var(--color-bg)',
                    paddingTop: 'var(--nav-height)',
                }}
            >
                <div className="p-10">
                    Cargando juegos...
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main
                className="min-h-screen"
                style={{
                    background: 'var(--color-bg)',
                    paddingTop: 'var(--nav-height)',
                }}
            >
                <div className="p-10">
                    Error: {error}
                </div>
            </main>
        )
    }

    return (
        <main
            className="min-h-screen"
            style={{
                background: 'var(--color-bg)',
                paddingTop: 'var(--nav-height)',
            }}
        >
            <div
                style={{
                    paddingLeft: 'clamp(1rem, 5vw, 5rem)',
                    paddingRight: 'clamp(1rem, 5vw, 5rem)',
                    paddingTop: '2rem',
                    paddingBottom: '4rem',
                }}
            >
                <h1
                    className="text-3xl font-bold mb-8"
                    style={{
                        fontFamily: 'var(--font-title)',
                    }}
                >
                    Todos los juegos
                </h1>

                <div
                    className="grid gap-6"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    }}
                >
                    {games.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                        />
                    ))}
                </div>
            </div>
        </main>
    )
}