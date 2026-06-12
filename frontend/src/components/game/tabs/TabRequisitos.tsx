import type { Game } from '../../../types'

type Requirements = {
    minimum?: string
    recommended?: string
}

function ReqBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex-1">
      <h4
        className="font-semibold mb-3"
        style={{
          fontFamily: 'var(--font-title)',
          color: 'var(--color-text)',
          fontSize: '1rem',
          paddingBottom: '1rem',
        }}
      >
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {text.split(' | ').filter(Boolean).map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2"
            style={{
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              paddingBottom: '0.5rem',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TabRequisitos({ game }: { game: Game }) {
  const requirements: Record<string, Requirements> =
      typeof game.system_requirements === 'string'
          ? JSON.parse(game.system_requirements)
          : (game.system_requirements ?? {})

  const plats = Object.entries(requirements)
  
  if (!plats.length) {
      return <p className="py-5" style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '1rem', }}>No hay requisitos disponibles.</p>
  }

  return (
    <div className="pb-5" style={{ paddingTop: '1.5rem' }}>
      {plats.map(([plat, reqs]) => (
        <div key={plat} className="mb-6">
          <p 
            className="uppercase tracking-widest mb-3" 
            style={{ 
              color: 'var(--color-accent)', 
              fontFamily: 'var(--font-title)', 
              fontSize: '1rem',
              margin: '1.3rem 0 0.3rem 0', 
            }}
          >
            {plat === 'pc' ? 'Windows' : plat === 'mac' ? 'macOS' : plat === 'linux' ? 'Linux' : plat}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reqs.minimum     && <ReqBlock title="Mínimos"      text={reqs.minimum} />}
            {reqs.recommended && <ReqBlock title="Recomendados" text={reqs.recommended} />}
          </div>
        </div>
      ))}
    </div>
  )
}