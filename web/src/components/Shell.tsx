import type { ReactNode } from 'react'
import { Logo } from './Logo'

export interface User { name: string; fullName: string; email: string }

export type NavTarget = { kind: 'overview' } | { kind: 'project'; id: string } | { kind: 'new' } | { kind: 'account' }

export function Sidebar({
  user, recent, active, draftOpen, onNavigate, open, onClose,
}: {
  user: User
  recent: { id: string; title: string }[]
  active: 'overview' | 'new' | string | null
  draftOpen: boolean
  onNavigate: (t: NavTarget) => void
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      <div className={`scrim ${open ? 'scrim--on' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Logo />
          <button className="new-convo" onClick={() => onNavigate({ kind: 'new' })}>
            <span aria-hidden>+</span> New conversation
          </button>
        </div>

        <nav className="nav">
          <p className="nav__label">Workspace</p>
          <button className={`nav__item ${active === 'overview' ? 'nav__item--on' : ''}`} onClick={() => onNavigate({ kind: 'overview' })}>Overview</button>
          <button className="nav__item" disabled title="Coming soon">My assets</button>

          <p className="nav__label">Recent</p>
          {draftOpen && <button className="nav__item nav__item--on" onClick={() => onNavigate({ kind: 'new' })}>New conversation</button>}
          {recent.length === 0 && !draftOpen && <span className="nav__empty">No conversations yet</span>}
          {recent.map((r) => (
            <button key={r.id} className={`nav__item ${active === r.id ? 'nav__item--on' : ''}`} onClick={() => onNavigate({ kind: 'project', id: r.id })}>
              {r.title}
            </button>
          ))}
        </nav>

        <div className="sidebar__foot">
          <p className="sidebar__hint">Your next idea starts here.</p>
          <button className={`account ${active === 'account' ? 'account--on' : ''}`} onClick={() => onNavigate({ kind: 'account' })} title="Your account">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="account__text">
              <span>{user.fullName}</span>
              <small>Personal workspace</small>
            </span>
            <span className="account__out">›</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export function Topbar({
  crumbs, status, onStatus, statusOn, publish, onPublish, onShare, onMenu,
}: {
  crumbs: ReactNode[]
  status?: string
  onStatus?: () => void
  statusOn?: boolean
  publish?: boolean
  onPublish?: () => void
  onShare?: () => void
  onMenu: () => void
}) {
  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open menu">☰</button>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} className="crumbs__item">
            {i > 0 && <span className="crumbs__sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'crumbs__current' : ''}>{c}</span>
          </span>
        ))}
      </div>
      <div className="topbar__right">
        {status && (onStatus
          ? <button className={`topbar__status topbar__status--btn ${statusOn ? '' : 'is-off'}`} onClick={onStatus} title={statusOn ? 'Hide preview' : 'Show preview'}>{status}</button>
          : <span className="topbar__status">{status}</span>)}
        {publish && <button className="btn btn--primary btn--sm" onClick={onPublish}>Publish</button>}
        <button className="btn btn--ghost btn--sm" onClick={onShare} disabled={!onShare}>Share</button>
      </div>
    </header>
  )
}

export function SparkHeader({ helper, badge }: { helper?: boolean; badge?: string }) {
  if (!helper) return <span className="spark-label">Spark</span>
  return (
    <span className="spark-label spark-label--helper">
      <i className="helper-dot" /> Spark Helper <span className="pill pill--helper">{badge ?? 'While you wait'}</span>
    </span>
  )
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-hidden />
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="progress"><span style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }} /></div>
}

export function Steps({ items, done }: { items: string[]; done: number }) {
  return (
    <ul className="steps">
      {items.map((s, i) => (
        <li key={s} className={i < done ? 'is-done' : i === done ? 'is-active' : ''}>
          {i < done ? <span className="steps__icon">✓</span> : i === done ? <Spinner size={18} /> : <span className="steps__icon" />}
          {s}
        </li>
      ))}
    </ul>
  )
}
