import { useCallback, useState } from 'react'
import { ExportModal, PublishModal, PublishedModal, type Visibility } from './components/Modals'
import { Sidebar, Topbar, type NavTarget, type User } from './components/Shell'
import { Account } from './screens/Account'
import { Home, NewChat } from './screens/Home'
import { Overview, PlayLatest } from './screens/Overview'
import { ProjectView } from './screens/ProjectView'
import { Landing, UnitySignIn } from './screens/Unity'
import { isPlayable, useStudio, versionOf } from './lib/useStudio'
import type { LookId } from './lib/looks'

const KEY = 'unity-spark.user'

type View =
  | { kind: 'home' }
  | { kind: 'new' }
  | { kind: 'overview' }
  | { kind: 'account' }
  | { kind: 'project'; id: string }
  | { kind: 'play'; id: string }

type Publishing = { id: string; step: 'settings' } | { id: string; step: 'live'; name: string; visibility: Visibility }

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    const u = raw ? (JSON.parse(raw) as User) : null
    return u?.fullName ? u : null
  } catch {
    return null
  }
}

export default function App() {
  const studio = useStudio()
  const [user, setUser] = useState<User | null>(loadUser)
  const [stage, setStage] = useState<'landing' | 'signin'>('landing')
  const [view, setView] = useState<View>(() => (studio.order.length ? { kind: 'overview' } : { kind: 'home' }))
  const [menu, setMenu] = useState(false)
  const [playing, setPlayingState] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [publishing, setPublishing] = useState<Publishing | null>(null)
  const [exporting, setExporting] = useState<string | null>(null)
  const setPlaying = useCallback((on: boolean) => setPlayingState(on), [])

  const go = (v: View) => { setView(v); setMenu(false); setPlayingState(false); setPreviewOpen(true) }

  if (!user) {
    if (stage === 'landing') return <Landing onStart={() => setStage('signin')} />
    return (
      <UnitySignIn
        onDone={(u) => {
          try { localStorage.setItem(KEY, JSON.stringify(u)) } catch { /* private mode */ }
          setUser(u)
          go(studio.order.length ? { kind: 'overview' } : { kind: 'home' })
        }}
      />
    )
  }

  const signOut = () => {
    try { localStorage.removeItem(KEY) } catch { /* private mode */ }
    studio.reset()
    setUser(null)
    setStage('landing')
    go({ kind: 'home' })
  }

  const start = (prompt: string, opts?: { look?: LookId; title?: string }) => {
    const id = studio.startProject(prompt, opts)
    if (id) go({ kind: 'project', id })
  }

  const nav = (t: NavTarget) => go(t)
  const updateUser = (u: User) => {
    try { localStorage.setItem(KEY, JSON.stringify(u)) } catch { /* private mode */ }
    setUser(u)
  }

  const current = view.kind === 'project' || view.kind === 'play' ? studio.projects[view.id] : undefined
  const recent = studio.order.map((id) => ({ id, title: studio.projects[id]?.title ?? 'Untitled' }))
  const active = view.kind === 'overview' || view.kind === 'account' ? view.kind : current ? current.id : (view.kind === 'new' || view.kind === 'home') ? 'new' : null

  let crumbs: string[] = ['New conversation']
  let status: string | undefined
  let canPublish = false
  if (view.kind === 'overview') crumbs = ['Overview']
  if (view.kind === 'account') crumbs = ['Account']
  if (current) {
    canPublish = isPlayable(current)
    crumbs = view.kind === 'play' ? [current.title, versionOf(current)] : [current.title]
    if (view.kind === 'project') status = current.messages.some((m) => m.kind === 'build') ? '◧ Split preview' : 'Concept draft'
  }
  const openPublish = current && canPublish ? () => setPublishing({ id: current.id, step: 'settings' }) : undefined
  const pubProject = publishing ? studio.projects[publishing.id] : undefined

  return (
    <div className="app">
      <Sidebar
        user={user} recent={recent} active={active} draftOpen={view.kind === 'new' || view.kind === 'home'}
        onNavigate={nav} open={menu} onClose={() => setMenu(false)}
      />
      <main className="main">
        <Topbar
          crumbs={crumbs} status={status}
          statusOn={previewOpen}
          onStatus={status === '◧ Split preview' ? () => setPreviewOpen((o) => !o) : undefined}
          publish={canPublish} onPublish={openPublish} onShare={openPublish}
          onExport={current && canPublish ? () => setExporting(current.id) : undefined}
          onMenu={() => setMenu(true)}
        />
        <div className="main__body">
          {view.kind === 'home' && <Home name={user.name} onStart={start} />}
          {view.kind === 'new' && studio.helperOff && !studio.answersSaved && <Home name={user.name} onStart={start} />}
          {view.kind === 'new' && !(studio.helperOff && !studio.answersSaved) && <NewChat key="new" name={user.name} studio={studio} onStart={start} onSkip={() => go({ kind: 'home' })} />}
          {view.kind === 'overview' && (
            <Overview
              name={user.name} studio={studio} onStart={start}
              onContinue={(id) => go({ kind: 'project', id })}
              onPlay={(id) => go({ kind: 'play', id })}
              onSuggest={(id, c, text) => { go({ kind: 'project', id }); studio.applyChange(id, c, text) }}
              onPublish={(id) => setPublishing({ id, step: 'settings' })}
            />
          )}
          {view.kind === 'account' && (
            <Account
              user={user} onUpdateUser={updateUser} studio={studio} onSignOut={signOut}
              onOpen={(id) => go({ kind: 'project', id })}
              onPlay={(id) => go({ kind: 'play', id })}
            />
          )}
          {view.kind === 'project' && current && (
            <ProjectView
              key={current.id} project={current} studio={studio}
              playing={playing} setPlaying={setPlaying}
              previewOpen={previewOpen} setPreviewOpen={setPreviewOpen}
              onPublish={() => setPublishing({ id: current.id, step: 'settings' })}
            />
          )}
          {view.kind === 'play' && current && (
            <PlayLatest project={current} onBack={() => go({ kind: 'overview' })} onContinue={() => go({ kind: 'project', id: current.id })} />
          )}
        </div>
      </main>

      {exporting && studio.projects[exporting] && (
        <ExportModal project={studio.projects[exporting]} onClose={() => setExporting(null)} />
      )}
      {publishing?.step === 'settings' && pubProject && (
        <PublishModal
          project={pubProject} onCancel={() => setPublishing(null)}
          onPublish={(name, visibility) => { studio.publish(pubProject.id); setPublishing({ id: pubProject.id, step: 'live', name, visibility }) }}
        />
      )}
      {publishing?.step === 'live' && pubProject && (
        <PublishedModal
          project={pubProject} user={user.name} name={publishing.name} visibility={publishing.visibility}
          onDone={() => { setPublishing(null); go({ kind: 'overview' }) }}
          onOpen={() => { setPublishing(null); go({ kind: 'play', id: pubProject.id }) }}
        />
      )}
    </div>
  )
}
