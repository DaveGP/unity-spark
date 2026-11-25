import { useState } from 'react'
import { QuestionInput } from '../components/Chat'
import { slug } from '../components/Modals'
import type { User } from '../components/Shell'
import { PROFILE_GROUPS, PROFILE_QUESTIONS, formatAnswer, isAnswered, type Project } from '../lib/flow'
import { LOOKS } from '../lib/looks'
import { isPlayable, versionOf, type Studio } from '../lib/useStudio'

const MONTHLY_BUILDS = 50

/** Opened from the name in the bottom-left corner of the sidebar. */
export function Account({
  user, onUpdateUser, studio, onOpen, onPlay, onSignOut,
}: {
  user: User
  onUpdateUser: (u: User) => void
  studio: Studio
  onOpen: (id: string) => void
  onPlay: (id: string) => void
  onSignOut: () => void
}) {
  const [name, setName] = useState(user.fullName)
  const [savedName, setSavedName] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)
  const [tips, setTips] = useState(true)

  const projects = studio.order.map((id) => studio.projects[id]).filter(Boolean) as Project[]
  const builds = projects.reduce((n, p) => n + (isPlayable(p) ? 1 : 0) + p.history.length, 0)
  const published = projects.filter((p) => p.publishedAt).length
  const answeredCount = PROFILE_QUESTIONS.filter((q) => isAnswered(studio.profile[q.id])).length

  const saveName = () => {
    const full = name.trim()
    if (!full) return
    onUpdateUser({ ...user, fullName: full, name: full.split(/\s+/)[0] })
    setSavedName(true)
    window.setTimeout(() => setSavedName(false), 1600)
  }

  const deleteAll = () => {
    if (window.confirm('Delete all your projects and Spark Helper answers? This can’t be undone.')) studio.reset()
  }

  return (
    <div className="page">
      <div className="page__inner account-page">
        <p className="eyebrow">Account</p>
        <div className="account-hero">
          <span className="avatar avatar--lg">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <h1 className="h1 h1--xl">{user.fullName}</h1>
            <p className="muted">{user.email} · Personal workspace</p>
          </div>
        </div>

        <div className="stats">
          <div><strong>{projects.length}</strong><span>Projects</span></div>
          <div><strong>{builds}</strong><span>Builds this month</span></div>
          <div><strong>{published}</strong><span>Published games</span></div>
        </div>

        <section className="acct-card">
          <h2>Profile</h2>
          <label className="field">
            <span>Display name</span>
            <div className="field__row">
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveName() }} />
              <button className="btn btn--ghost" onClick={saveName} disabled={!name.trim() || name.trim() === user.fullName}>{savedName ? 'Saved ✓' : 'Save'}</button>
            </div>
          </label>
          <label className="field">
            <span>Email</span>
            <input value={user.email} readOnly className="is-readonly" />
          </label>
          <div className="acct-row">
            <div>
              <strong>Unity ID</strong>
              <p className="muted small">You sign in to Spark with your Unity ID. Change your password and security settings there.</p>
            </div>
            <a className="btn btn--ghost btn--sm" href="https://id.unity.com" target="_blank" rel="noreferrer">Manage Unity ID ↗</a>
          </div>
        </section>

        <section className="acct-card">
          <div className="acct-card__head">
            <div>
              <h2>Your profile</h2>
              <p className="muted small">Spark Helper asks these one at a time whenever you’re waiting on a build or a change, starting with the first four. Your answers guide Spark’s suggestions, ideas and how it talks to you.</p>
            </div>
            <span className="profile-count">{answeredCount} of {PROFILE_QUESTIONS.length}</span>
          </div>
          <div className="progress"><span style={{ width: `${(answeredCount / PROFILE_QUESTIONS.length) * 100}%` }} /></div>
          <div className="acct-row helper-toggle">
            <div>
              <strong>Ask questions while I wait</strong>
              <p className="muted small">{studio.helperOff ? 'Off for this session. Spark Helper will start asking again next time you visit.' : 'On. Spark Helper asks one question during each build or change.'}</p>
            </div>
            <button className={`btn btn--sm ${studio.helperOff ? 'btn--primary' : 'btn--ghost'}`} onClick={() => studio.setHelperOff(!studio.helperOff)}>
              {studio.helperOff ? 'Turn back on' : 'Turn off for this session'}
            </button>
          </div>

          {PROFILE_GROUPS.map((g) => (
            <div key={g} className="profile-group">
              <div className="profile-group__head"><h3>{g}</h3></div>
              <ul className="profile-list">
                {PROFILE_QUESTIONS.filter((q) => q.group === g).map((q) => {
                  const v = studio.profile[q.id]
                  const open = editing === q.id
                  return (
                    <li key={q.id} className={open ? 'is-open' : ''}>
                      <div className="profile-list__row">
                        <span>
                          <span className="profile-list__q">{q.text}</span>
                          <span className={isAnswered(v) ? 'profile-list__a' : 'profile-list__a is-empty'}>{isAnswered(v) ? formatAnswer(v) : 'Not answered yet'}</span>
                        </span>
                        <button className="btn btn--ghost btn--xs" onClick={() => setEditing(open ? null : q.id)}>{open ? 'Close' : isAnswered(v) ? 'Edit' : 'Answer'}</button>
                      </div>
                      {open && <QuestionInput q={q} value={v} onSubmit={(val) => { studio.answerQuestion(q.id, val); setEditing(null) }} />}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        <section className="acct-card">
          <h2>Your games</h2>
          {projects.length === 0 && <p className="muted small">No games yet. Start a new conversation to make one.</p>}
          <ul className="game-list">
            {projects.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.title}</strong>
                  <span className="muted small">
                    {versionOf(p)} · {LOOKS[p.look].name}
                    {p.publishedAt ? <> · <span className="live">● Live</span> playgrounds.google.com/{slug(user.name)}/{slug(p.title)}</> : ' · Not published'}
                  </span>
                </div>
                <span className="game-list__actions">
                  <button className="btn btn--ghost btn--xs" disabled={!isPlayable(p)} onClick={() => onPlay(p.id)}>Play</button>
                  <button className="btn btn--ghost btn--xs" onClick={() => onOpen(p.id)}>Open</button>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="acct-card">
          <h2>Plan</h2>
          <div className="acct-row">
            <div>
              <strong>Spark preview <span className="pill pill--helper">Free</span></strong>
              <p className="muted small">{builds} of {MONTHLY_BUILDS} builds used this month. Resets on the 1st.</p>
            </div>
          </div>
          <div className="progress"><span style={{ width: `${Math.min(100, (builds / MONTHLY_BUILDS) * 100)}%` }} /></div>
        </section>

        <section className="acct-card">
          <h2>Notifications</h2>
          <label className="check-row"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email me when a long build finishes</label>
          <label className="check-row"><input type="checkbox" checked={tips} onChange={(e) => setTips(e.target.checked)} /> Send me tips for getting more out of Spark</label>
        </section>

        <section className="acct-card acct-card--danger">
          <div className="acct-row">
            <div>
              <strong>Sign out</strong>
              <p className="muted small">Sign out of Unity Spark on this browser.</p>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onSignOut}>Sign out</button>
          </div>
          <div className="acct-row">
            <div>
              <strong>Delete all projects</strong>
              <p className="muted small">Removes every project and your Spark Helper answers from this browser.</p>
            </div>
            <button className="btn btn--danger btn--sm" onClick={deleteAll} disabled={projects.length === 0 && answeredCount === 0}>Delete…</button>
          </div>
        </section>
      </div>
    </div>
  )
}
