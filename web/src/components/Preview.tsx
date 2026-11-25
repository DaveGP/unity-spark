import { useEffect, useRef, useState } from 'react'
import { Scene } from '../art/Scenes'
import { StarterGame } from '../game/StarterGame'
import { buildStepsFor, type Msg, type Project } from '../lib/flow'
import { LOOKS } from '../lib/looks'
import { STEP_MS, WORK_MS, hasChange, versionOf, type Studio } from '../lib/useStudio'
import { ProgressBar, Spinner } from './Shell'

const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}

function BuildStatus({ label, step, total, stepMs }: { label: string; step: number; total: number; stepMs: number }) {
  return (
    <div className="build-status">
      <Spinner size={22} />
      <strong>{label}…</strong>
      <ProgressBar value={step / total} />
      <span className="fine">Step {Math.min(step + 1, total)} of {total} · about {Math.round((Math.max(1, total - step) * stepMs) / 1000)}s left</span>
    </div>
  )
}

/** The game as it stands at the project's current version. */
export function GameFor({ project, running, resetKey }: { project: Project; running: boolean; resetKey: number }) {
  return (
    <StarterGame
      look={LOOKS[project.look]} running={running}
      resetKey={resetKey + (hasChange(project, 'clearing') ? 100 : 0)}
      fox={hasChange(project, 'fox')} night={hasChange(project, 'dusk')}
    />
  )
}

function UndoHistory({ project, studio, onClose }: { project: Project; studio: Studio; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const away = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest('.undo-btn')) onClose() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', away); window.removeEventListener('keydown', esc) }
  }, [onClose])
  const h = project.history
  const act = (fn: () => void) => { fn(); onClose() }
  return (
    <div className="popover" ref={ref} role="dialog" aria-label="Undo history">
      <strong>Undo history</strong>
      <p className="muted">Step back through Spark’s changes.</p>
      <ul>
        {project.future.slice().reverse().map((f, k, arr) => (
          <li key={`f${f.at}`} className="popover__row is-future">
            <i />
            <span><b>{f.title}</b><small>v0.{f.version} · undone</small></span>
            <button className="btn btn--ghost btn--xs" onClick={() => act(() => studio.redoTo(project.id, arr.length - 1 - k))}>Redo</button>
          </li>
        ))}
        {h.slice().reverse().map((c, k) => {
          const idx = h.length - 1 - k
          const current = k === 0
          return (
            <li key={`h${c.at}`} className={`popover__row ${current ? 'is-current' : ''}`}>
              <i />
              <span><b>{c.title}</b><small>v0.{1 + idx + 1} · {ago(c.at)}</small></span>
              <button className={`btn btn--xs ${current ? 'btn--primary' : 'btn--ghost'}`} onClick={() => act(() => studio.undoTo(project.id, current ? idx : idx + 1))}>
                {current ? 'Undo' : 'Restore'}
              </button>
            </li>
          )
        })}
        <li className={`popover__row ${h.length === 0 ? 'is-current' : ''}`}>
          <i />
          <span><b>First playable built</b><small>v0.1 · {ago(project.createdAt)}</small></span>
          {h.length > 0 && <button className="btn btn--ghost btn--xs" onClick={() => act(() => studio.undoTo(project.id, 0))}>Restore</button>}
        </li>
      </ul>
      <p className="fine">Undoing keeps later versions, so you can redo.</p>
    </div>
  )
}

export function PreviewPane({
  project, studio, playing, setPlaying, onClose,
}: {
  project: Project
  studio: Studio
  playing: boolean
  setPlaying: (on: boolean) => void
  onClose: () => void
}) {
  const p = project
  const look = LOOKS[p.look]
  const [resetKey, setResetKey] = useState(0)
  const [undoOpen, setUndoOpen] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const building = p.phase === 'building' || (p.phase !== 'ready' && p.phase !== 'working')
  const working = p.phase === 'working'
  const steps = buildStepsFor(p.look)
  const work = [...p.messages].reverse().find((m): m is Extract<Msg, { kind: 'working' }> => m.kind === 'working')
  const updated = p.history.length > 0
  const version = versionOf(p)
  const canUndo = p.phase === 'ready' && (p.history.length > 0 || p.future.length > 0)
  const isWoodland = p.look === 'woodland'

  const play = () => { setPlaying(true); studio.played(p.id) }
  const full = () => stage.current?.requestFullscreen?.()

  let eyebrow = 'First playable'
  let sub = `${version} · Web build · ${look.name} style`
  if (building) sub = `Building · ${look.name} style`
  if (working) { eyebrow = `Updating to v0.${2 + p.history.length}`; sub = `${version} · Web build · Change in progress` }
  else if (updated && !building) eyebrow = `Updated ${ago(p.history[p.history.length - 1].at)}`

  return (
    <section className="panel">
      <button className="icon-btn panel__close" onClick={onClose} aria-label="Hide preview">×</button>
      <div className="panel__head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="panel__title">{p.title}</h2>
          <p className="muted panel__sub">{sub}</p>
        </div>
        <div className="panel__actions">
          <div className="undo-wrap">
            <button className="btn btn--ghost btn--sm undo-btn" disabled={!canUndo} onClick={() => setUndoOpen((o) => !o)} title={canUndo ? 'Undo history' : 'Nothing to undo yet'}>↶ Undo</button>
            {undoOpen && canUndo && <UndoHistory project={p} studio={studio} onClose={() => setUndoOpen(false)} />}
          </div>
          {building || working
            ? <button className="btn btn--primary btn--sm" disabled>{working ? 'Updating…' : 'Building…'}</button>
            : <span className="pill pill--ok">● {updated ? 'Updated' : 'Build ready'}</span>}
        </div>
      </div>

      <div className="preview">
        <div className="preview__tabs">
          <span className="preview__tab is-on">Game</span>
          <span className="preview__tab">{p.title}</span>
          <span className="fine preview__hint">{building || working ? 'Live build' : playing ? 'Live preview' : 'Scene preview'}</span>
        </div>
        <div className="preview__stage" ref={stage}>
          {building && (
            <>
              <div className="preview__scene is-dim"><Scene id={p.look} /></div>
              <BuildStatus label={steps[Math.min(p.buildStep, steps.length - 1)]} step={p.buildStep} total={steps.length} stepMs={STEP_MS} />
            </>
          )}
          {working && work && (
            <>
              <div className="is-dim"><GameFor project={p} running={false} resetKey={resetKey} /></div>
              <BuildStatus label={work.change.steps[Math.min(p.workStep, work.change.steps.length - 1)]} step={p.workStep} total={work.change.steps.length} stepMs={WORK_MS} />
            </>
          )}
          {!building && !working && (playing
            ? <GameFor project={p} running resetKey={resetKey} />
            : (
              <>
                {updated ? <GameFor project={p} running={false} resetKey={resetKey} /> : <div className="preview__scene"><Scene id={p.look} /></div>}
                <button className="play-cta" onClick={play}>▶&nbsp; Play your game</button>
              </>
            ))}
        </div>
        <div className="preview__bar">
          <button className="btn btn--ghost btn--xs" disabled={building || working} onClick={() => (playing ? setPlaying(false) : play())}>{playing ? 'Stop' : 'Play'}</button>
          <button className="btn btn--ghost btn--xs" onClick={() => setResetKey((k) => k + 1)} disabled={building || working}>Reset view</button>
          <span className="preview__note">{building ? 'Building web preview' : working ? 'Rebuilding web preview' : `Web build · ${version}`}</span>
          <button className="btn btn--ghost btn--xs preview__full" onClick={full}>Fullscreen</button>
        </div>
      </div>

      <div className="about">
        {building || working ? (
          <>
            <p className="eyebrow">What Spark is doing</p>
            <h3>{working && work ? work.change.doing : 'Setting up your project'}</h3>
            <p>
              {working && work
                ? `${work.change.about} Your ${version} build is kept, so you can undo.`
                : `Spark is creating a Unity project, importing ${isWoodland ? 'a forest' : `a ${look.category.toLowerCase()}`} asset pack and laying out a first level you can play straight away.`}
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">How to play</p>
            <h3>Collect all ten {isWoodland ? 'fireflies' : 'sparks'}</h3>
            <p>Move with the arrow keys or WASD, or click to steer. Gather every {isWoodland ? 'firefly before nightfall' : 'spark you can find'}.</p>
          </>
        )}
      </div>
    </section>
  )
}
