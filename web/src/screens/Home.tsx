import { useRef, useState, type KeyboardEvent } from 'react'
import { Scene } from '../art/Scenes'
import { HelperQuestions, PrototypeNotice } from '../components/Chat'
import { Composer } from '../components/Composer'
import { MORE_IDEAS, STARTER_IDEAS, answersComplete, type Profile, type PromptOption } from '../lib/flow'
import { findRecommendedPrompt, promptChoices, type Studio } from '../lib/useStudio'
import { draftNotes, dreamDraft } from '../lib/personalise'
import { rankPitches, type Pitch } from '../lib/pitches'
import type { LookId } from '../lib/looks'

type StartFn = (prompt: string, opts?: { look?: LookId; title?: string }) => void

/** Prototype only: recommended prompts start a project; anything else gets the notice on this page. */
function usePromptGate(profile: Profile, onStart: StartFn) {
  const [attempts, setAttempts] = useState<string[]>([])
  const submit = (text: string, opts?: { look?: LookId; title?: string }) => {
    const t = text.trim()
    if (!t) return
    if (opts?.look) return onStart(t, opts)
    const match = findRecommendedPrompt(profile, t)
    if (match) onStart(match.prompt, { look: match.look, title: match.title })
    else setAttempts((a) => [...a, t])
  }
  const notice = <PrototypeNotice attempts={attempts} options={promptChoices(profile)} onPick={(o: PromptOption) => onStart(o.prompt, { look: o.look, title: o.title })} />
  return { submit, notice }
}

/** ONB-102: the first screen after sign-in, with ideas inside the empty prompt box. */
export function Home({ name, profile = {}, onStart }: { name: string; profile?: Profile; onStart: StartFn }) {
  const [text, setText] = useState('')
  const gate = usePromptGate(profile, onStart)
  const [page, setPage] = useState(0)
  const box = useRef<HTMLTextAreaElement>(null)
  const pool = [...STARTER_IDEAS.map((i) => ({ title: i.title, prompt: i.prompt })), ...MORE_IDEAS]
  const chips = [0, 1, 2].map((k) => pool[(page * 3 + k) % pool.length])
  const send = () => { if (!text.trim()) return; gate.submit(text); setText('') }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const use = (prompt: string) => { setText(prompt); box.current?.focus() }

  return (
    <div className="page">
      <div className="page__inner">
        <p className="eyebrow">Welcome to Unity Spark</p>
        <h1 className="h1 h1--xl">Nice to meet you, {name}.</h1>
        <p className="muted intro">Turn an idea into a playable game. Describe it in plain words and Spark builds the first version in Unity with you — so, what do you want to make?</p>

        <div className={`prompt-box ${text ? 'is-typing' : ''}`} onClick={() => box.current?.focus()}>
          <textarea
            ref={box} rows={2} value={text} autoFocus onKeyDown={onKey} onChange={(e) => setText(e.target.value)}
            placeholder="Try “a cozy forest game where you collect fireflies before nightfall”"
          />
          <p className="prompt-box__label">Ideas to get you started</p>
          <div className="prompt-box__row">
            <div className="chips chips--tight">
              {chips.map((c) => <button key={c.title} className="chip" onClick={(e) => { e.stopPropagation(); use(c.prompt) }}>✦ {c.title}</button>)}
              <button className="chip chip--ghost" onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1) }}>↻ More ideas</button>
            </div>
            <button className="btn btn--primary btn--sm" disabled={!text.trim()} onClick={(e) => { e.stopPropagation(); send() }}>Send</button>
          </div>
        </div>
        <p className="fine footnote">Unity Spark · Prototype</p>
        {gate.notice}

        <h2 className="section-title">Or start from an idea</h2>
        <div className="idea-grid">
          {STARTER_IDEAS.map((i) => (
            <div key={i.title} className="idea-card">
              <div className="idea-card__art"><Scene id={i.look} /></div>
              <div className="idea-card__body">
                <strong>{i.title}</strong>
                <p>{i.blurb}</p>
                <button className="btn btn--ghost btn--xs" onClick={() => onStart(i.prompt)}>Use this idea</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** New conversation: Spark Assist asks first (if it hasn't already), then drafts a starting prompt. */
export function NewChat({ name, studio, onStart, onSkip }: {
  name: string; studio: Studio; onStart: (prompt: string, opts?: { look?: LookId; title?: string }) => void; onSkip: () => void
}) {
  // Ask the first four as a set here (nothing is building yet), until "Show me ideas".
  const [asking, setAsking] = useState(() => !(studio.answersSaved && answersComplete(studio.answers)))
  const [pick, setPick] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const gate = usePromptGate(studio.profile, onStart)
  // All ten Synty pitches, best fit for this profile first.
  const ranked = rankPitches(studio.profile)
  const current = ranked[pick % ranked.length]
  const { pitch } = current
  const prompt = text ?? pitch.prompt
  const notes = draftNotes(studio.profile)
  const dream = dreamDraft(studio.profile)
  const choose = (i: number) => { setPick(i); setText(null); setEditing(false); window.scrollTo?.(0, 0); document.querySelector('.page__inner')?.scrollTo({ top: 0, behavior: 'smooth' }) }

  if (asking) {
    return (
      <div className="page">
        <div className="page__inner">
          <p className="eyebrow">New project</p>
          <h1 className="h1 h1--xl">Before we start, {name}…</h1>
          <p className="muted intro">A few quick questions so I can suggest ideas that fit you. You can skip and describe your own idea any time.</p>
          <HelperQuestions large answers={studio.answers} setAnswers={studio.setAnswers} onSave={() => setAsking(false)} onSkip={onSkip} />
          {gate.notice}
        </div>
        <div className="page__composer">
          <Composer placeholder="Or skip ahead and describe your idea…" onSend={(t) => gate.submit(t)} footnote="Unity Spark · Your answers are saved to your profile, so Spark won’t ask them again" />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__inner">
        <p className="eyebrow">New project</p>
        <h1 className="h1 h1--xl">What’s next, {name}?</h1>
        <p className="muted intro">I’ve picked a starting point from what you’ve told me, built around a Synty asset pack. Send it as it is, change anything first, or see more options.</p>

        <div className="prompt-box is-typing">
          <span className="pill pill--helper">{current.tag.startsWith('Inspired') ? '✦ Drafted from your favourite games' : current.tag.startsWith('Because') ? '✦ Drafted from what you like' : '✦ An idea to try'}</span>
          {editing
            ? <textarea rows={3} value={prompt} autoFocus onChange={(e) => setText(e.target.value)} />
            : <p className="prompt-box__draft">{prompt}</p>}
          <div className="prompt-box__row">
            <div className="chips chips--tight">
              <button className="chip" onClick={() => choose(pick + 1)}>↻ Another idea</button>
              <button className={`chip ${editing ? 'chip--on' : ''}`} onClick={() => setEditing((e) => !e)}>✎ Edit the prompt</button>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => gate.submit(prompt, text === null || text.trim() === pitch.prompt ? { look: pitch.look, title: pitch.title } : undefined)}>Send</button>
          </div>
        </div>
        <p className="fine footnote">Unity Spark · Ideas use what you’ve shared with Spark Assist</p>
        {gate.notice}

        <h2 className="section-title">Why this idea</h2>
        <div className="why-card">
          <div className="why-card__img">
            <PackImage pitch={pitch} />
            <span className="tag">{current.tag}</span>
          </div>
          <div className="why-card__body">
            <h3>{pitch.title}</h3>
            <p className="muted small">{['Synty ' + pitch.pack.replace('POLYGON ', 'POLYGON – '), 'Low-poly 3D', ...notes].join(' · ')}</p>
            <p>{current.why}</p>
            <div className="why-card__foot">
              {current.basis.length > 0 && <span className="pill pill--helper">Based on: {current.basis.join(' · ')}</span>}
              <a className="pack-link" href={pitch.packUrl} target="_blank" rel="noreferrer">View {pitch.pack} ↗</a>
            </div>
          </div>
        </div>

        {dream && (
          <button className="own-idea" onClick={() => onStart(dream.prompt, { look: dream.look, title: dream.title })}>
            <span>✦ Or start from your own idea</span>
            <b>“{dream.prompt.replace(/\.$/, '')}”</b>
          </button>
        )}

        <div className="section-row">
          <h2 className="section-title">More options</h2>
          <button className="btn btn--ghost btn--xs" onClick={() => setShowMore((s) => !s)}>{showMore ? 'Hide options' : `Show ${ranked.length - 1} more ideas`}</button>
        </div>
        {showMore && (
          <div className="pitch-grid">
            {ranked.map((r, i) => (i === pick % ranked.length ? null : (
              <button key={r.pitch.id} className="pitch-card" onClick={() => choose(i)}>
                <div className="pitch-card__img"><PackImage pitch={r.pitch} /></div>
                <div className="pitch-card__body">
                  <strong>{r.pitch.title}</strong>
                  <span className="pitch-card__pack">{r.pitch.pack}</span>
                  <p>{r.pitch.blurb}</p>
                  {r.basis.length > 0 && <span className="pitch-card__why">{r.tag}</span>}
                </div>
              </button>
            )))}
          </div>
        )}
      </div>
    </div>
  )
}

/** The pack's store image, or a labelled placeholder tile if the image isn't available yet. */
function PackImage({ pitch }: { pitch: Pitch }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={`pack-tile pack-tile--${pitch.look}`}>
        <span>Synty</span>
        <b>{pitch.pack}</b>
      </div>
    )
  }
  return <img src={pitch.image} alt={`${pitch.pack} asset pack`} onError={() => setFailed(true)} />
}
