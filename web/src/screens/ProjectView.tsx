import { useEffect, useRef } from 'react'
import { ChatThread } from '../components/Chat'
import { Composer } from '../components/Composer'
import { PreviewPane } from '../components/Preview'
import type { Project } from '../lib/flow'
import type { Studio } from '../lib/useStudio'

/** One conversation: full-width chat until the build starts, then split view (ONB-104). */
export function ProjectView({
  project, studio, playing, setPlaying, previewOpen, setPreviewOpen,
}: {
  project: Project
  studio: Studio
  playing: boolean
  setPlaying: (on: boolean) => void
  previewOpen: boolean
  setPreviewOpen: (on: boolean) => void
}) {
  const p = project
  const split = p.messages.some((m) => m.kind === 'build')
  const lastSpark = [...p.messages].reverse().find((m) => m.kind !== 'user')
  const helperOpen = p.messages.some((m) => m.kind === 'ask' && !m.skipped && !(m.qid in studio.profile))

  // Stop the game while Spark works; play the new version when a change lands (as in the walkthrough).
  const doneCount = p.messages.filter((m) => m.kind === 'done').length
  const lastDone = useRef(doneCount)
  useEffect(() => {
    if (p.phase === 'working') setPlaying(false)
  }, [p.phase, setPlaying])
  useEffect(() => {
    if (doneCount > lastDone.current) setPlaying(true)
    lastDone.current = doneCount
  }, [doneCount, setPlaying])

  let placeholder = 'Describe a change…'
  if (p.phase === 'clarify') placeholder = 'Answer, or describe it in your own words…'
  else if (p.phase === 'building' && helperOpen) placeholder = 'Answer, or describe a change…'
  else if (p.phase === 'working') placeholder = 'Keep chatting while Spark works…'
  else if (p.phase === 'ready') {
    if (lastSpark?.kind === 'ready' || lastSpark?.kind === 'feel') placeholder = 'Tell Spark what you think…'
    else if (lastSpark?.kind === 'next') placeholder = 'Or describe your own change…'
    else if (lastSpark?.kind === 'done') placeholder = 'Tell Spark what to change next…'
  }

  const thread = (
    <ChatThread project={p} studio={studio} onPickChange={(id, text) => studio.applyChange(p.id, id, text)} />
  )
  const composer = (
    <Composer
      key={p.id} placeholder={placeholder} disabled={p.thinking}
      onSend={(t) => studio.send(p.id, t)}
      footnote={split ? 'Unity Spark · Changes apply to your project' : undefined}
    />
  )

  if (!split) {
    return (
      <div className="page page--chat">
        <div className="page__inner">{thread}</div>
        <div className="page__composer">{composer}</div>
      </div>
    )
  }

  return (
    <div className={`split ${previewOpen ? '' : 'split--closed'}`}>
      <div className="split__chat">
        <div className="split__scroll">{thread}</div>
        {composer}
      </div>
      {previewOpen && <PreviewPane project={p} studio={studio} playing={playing} setPlaying={setPlaying} onClose={() => setPreviewOpen(false)} />}
    </div>
  )
}
