import { useEffect } from 'react'
import { Scene } from '../art/Scenes'
import { Composer } from '../components/Composer'
import { GameFor } from '../components/Preview'
import { CHANGES, NEXT_ORDER, type ChangeId, type Project } from '../lib/flow'
import { LOOKS } from '../lib/looks'
import { hasChange, isPlayable, versionOf, type Studio } from '../lib/useStudio'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const edited = (t: number) => {
  const d = Date.now() - t
  if (d < 60_000) return 'Edited just now'
  if (d < 3_600_000) return `Edited ${Math.round(d / 60_000)} min ago`
  if (d < 86_400_000) return `Edited ${Math.round(d / 3_600_000)} h ago`
  return d < 172_800_000 ? 'Edited yesterday' : `Edited ${Math.round(d / 86_400_000)} days ago`
}

/** Returning user: pick up the latest project (Continue building / Play latest) or follow a suggestion. */
export function Overview({
  name, studio, onContinue, onPlay, onSuggest, onPublish, onStart,
}: {
  name: string
  studio: Studio
  onContinue: (id: string) => void
  onPlay: (id: string) => void
  onSuggest: (id: string, change: Exclude<ChangeId, 'custom'>) => void
  onPublish: (id: string) => void
  onStart: (prompt: string) => void
}) {
  const list = studio.order.map((id) => studio.projects[id]).filter(Boolean) as Project[]
  const latest = list[0]
  const playable = latest && isPlayable(latest)
  const last = latest?.history[latest.history.length - 1]
  const todo = latest ? NEXT_ORDER.filter((c) => !hasChange(latest, c)).slice(0, 2) : []
  const a = studio.answers
  const basis = studio.answersSaved ? [a.games.split(',')[1]?.trim() || a.games.split(',')[0]?.trim(), a.genres[0]?.replace(' / life sim', '')].filter(Boolean).join(' · ') : ''

  return (
    <div className="page">
      <div className="page__inner">
        <p className="eyebrow">{greeting()}</p>
        <h1 className="h1 h1--xl">Welcome back, {name}.</h1>
        <p className="muted intro">{latest ? 'Pick up where you left off.' : 'Nothing here yet. Start a new conversation to make your first game.'}</p>

        {latest && (
          <div className="project-card">
            <div className="project-card__art">
              {hasChange(latest, 'fox') ? <img src="assets/next-fox.jpg" alt="" /> : playable ? <GameFor project={latest} running={false} resetKey={0} /> : <Scene id={latest.look} />}
              <span className="tag">{versionOf(latest)}</span>
            </div>
            <div className="project-card__body">
              <h3>{latest.title}</h3>
              <p className="muted small">{edited(latest.editedAt)} · {LOOKS[latest.look].name} style</p>
              <p>{last ? `Last change: ${last.title.charAt(0).toLowerCase()}${last.title.slice(1)}${last.id === 'fox' ? ' that points toward fireflies' : ''}.` : playable ? 'Your first playable is built and ready to try.' : 'Spark is still setting this one up.'}</p>
              <div className="project-card__actions">
                <button className="btn btn--primary" onClick={() => onContinue(latest.id)}>Continue building</button>
                <button className="btn btn--ghost" disabled={!playable} onClick={() => onPlay(latest.id)}>Play latest</button>
              </div>
            </div>
          </div>
        )}

        {latest && playable && (
          <>
            <div className="section-row">
              <h2 className="section-title">Suggested for today</h2>
              {basis && <span className="helper-text">Based on your answers: {basis}</span>}
            </div>
            <div className="suggest-grid">
              {todo.map((c) => (
                <button key={c} className="suggest" onClick={() => onSuggest(latest.id, c)}>
                  <strong>{CHANGES[c].title}</strong>
                  <p>{c === 'clearing' && hasChange(latest, 'fox') ? 'A new area to explore with your fox.' : CHANGES[c].desc}</p>
                  <span className="suggest__go">Start →</span>
                </button>
              ))}
              <button className="suggest" onClick={() => onPublish(latest.id)}>
                <strong>Share it with friends</strong>
                <p>Publish a build friends can play from a link, or publish it to Google Playgrounds.</p>
                <span className="suggest__go">Publish →</span>
              </button>
            </div>
          </>
        )}

        {list.length > 1 && (
          <>
            <h2 className="section-title">All projects</h2>
            <div className="chips">
              {list.slice(1).map((p) => <button key={p.id} className="chip" onClick={() => onContinue(p.id)}>{p.title} · {versionOf(p)}</button>)}
            </div>
          </>
        )}
      </div>
      <div className="page__composer">
        <Composer placeholder="Start something new, or ask Spark about your game…" onSend={onStart} footnote="Unity Spark · Your projects are saved automatically" />
      </div>
    </div>
  )
}

/** "Play latest": the most recent build, full width. */
export function PlayLatest({ project, onBack, onContinue }: { project: Project; onBack: () => void; onContinue: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.fullscreenElement) onBack() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onBack])
  return (
    <div className="play-latest">
      <div className="play-latest__head">
        <div>
          <p className="eyebrow">Latest build · {versionOf(project)}</p>
          <h2 className="panel__title">{project.title}</h2>
        </div>
        <div className="panel__actions">
          <button className="btn btn--ghost btn--sm" onClick={onBack}>← Back to overview</button>
          <button className="btn btn--primary btn--sm" onClick={onContinue}>Continue building</button>
        </div>
      </div>
      <div className="preview preview--wide">
        <div className="preview__stage"><GameFor project={project} running resetKey={0} /></div>
        <div className="preview__bar">
          <button className="btn btn--ghost btn--xs" onClick={onBack}>Stop</button>
          <span className="preview__note">Arrow keys or WASD to move · Esc to exit</span>
        </div>
      </div>
    </div>
  )
}
