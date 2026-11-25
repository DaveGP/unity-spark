import { useEffect, useState, type ReactNode } from 'react'
import { Scene } from '../art/Scenes'
import type { Project } from '../lib/flow'
import { versionOf } from '../lib/useStudio'

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function Modal({ children, onClose, className = '' }: { children: ReactNode; onClose: () => void; className?: string }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${className}`} role="dialog" aria-modal>{children}</div>
    </div>
  )
}

export type Visibility = 'link' | 'public'

export function PublishModal({ project, onCancel, onPublish }: { project: Project; onCancel: () => void; onPublish: (name: string, v: Visibility) => void }) {
  const [name, setName] = useState(project.title)
  const [vis, setVis] = useState<Visibility>('link')
  const [remix, setRemix] = useState(true)
  const [busy, setBusy] = useState(false)
  const go = () => { setBusy(true); window.setTimeout(() => onPublish(name.trim() || project.title, vis), 1100) }
  const options: [Visibility, string, string][] = [
    ['link', 'Anyone with the link', 'Not listed publicly. Great for testing.'],
    ['public', 'Public on Google Playgrounds', 'Discoverable by everyone on Google Playgrounds.'],
  ]
  return (
    <Modal onClose={onCancel}>
      <div className="modal__head">
        <h2>Publish your game</h2>
        <button className="modal__x" onClick={onCancel} aria-label="Close">×</button>
      </div>
      <p className="muted">Get a link anyone can play in their browser.</p>
      <div className="modal__cover"><Scene id={project.look} /><button className="btn btn--ghost btn--xs">Change cover</button></div>
      <label className="field">
        <span>Game name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="field">
        <span>Who can play it?</span>
        <div className="options">
          {options.map(([id, t, d]) => (
            <button key={id} className={`option option--tall ${vis === id ? 'option--on' : ''}`} onClick={() => setVis(id)}>
              <span className="option__dot" />
              <span><b>{t}</b><small>{d}</small></span>
            </button>
          ))}
        </div>
      </div>
      <label className="check-row">
        <input type="checkbox" checked={remix} onChange={(e) => setRemix(e.target.checked)} />
        Let players remix it in Unity Spark
      </label>
      <div className="modal__foot">
        <span className="fine">Publishing builds {versionOf(project)} for the web.</span>
        <span className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn--primary" onClick={go} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button>
        </span>
      </div>
    </Modal>
  )
}

export function PublishedModal({ project, user, name, visibility, onDone, onOpen }: {
  project: Project; user: string; name: string; visibility: Visibility; onDone: () => void; onOpen: () => void
}) {
  const link = `playgrounds.google.com/${slug(user)}/${slug(name)}`
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${link}`) } catch { /* clipboard blocked */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  const share = async () => {
    try { await navigator.share?.({ title: name, url: `https://${link}` }) } catch { /* cancelled */ }
  }
  return (
    <Modal onClose={onDone} className="modal--live">
      <div className="modal__hero"><Scene id={project.look} /><span className="modal__badge">✓</span></div>
      <div className="modal__center">
        <h2>Your game is live!</h2>
        <p className="muted">{visibility === 'public' ? 'Anyone can find and play it on Google Playgrounds.' : 'Anyone with the link can play it in their browser.'}</p>
      </div>
      <div className="link-row">
        <span className="link-row__field">{link}</span>
        <button className="btn btn--primary" onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
      </div>
      <div className="modal__pair">
        <button className="btn btn--ghost" onClick={onOpen}>Open game</button>
        <button className="btn btn--ghost" onClick={share}>Share</button>
      </div>
      <div className="modal__foot">
        <span className="fine">{versionOf(project)} · Published just now</span>
        <button className="btn btn--primary btn--sm" onClick={onDone}>Done</button>
      </div>
    </Modal>
  )
}
