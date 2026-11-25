import { useRef, useState, type KeyboardEvent } from 'react'
import { Scene } from '../art/Scenes'
import { HelperQuestions } from '../components/Chat'
import { Composer } from '../components/Composer'
import { MORE_IDEAS, STARTER_IDEAS, answersComplete, draftFromAnswers } from '../lib/flow'
import type { Studio } from '../lib/useStudio'

/** ONB-102: the first screen after sign-in, with ideas inside the empty prompt box. */
export function Home({ name, onStart }: { name: string; onStart: (prompt: string) => void }) {
  const [text, setText] = useState('')
  const [page, setPage] = useState(0)
  const box = useRef<HTMLTextAreaElement>(null)
  const pool = [...STARTER_IDEAS.map((i) => ({ title: i.title, prompt: i.prompt })), ...MORE_IDEAS]
  const chips = [0, 1, 2].map((k) => pool[(page * 3 + k) % pool.length])
  const send = () => { if (text.trim()) onStart(text) }
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

/** New conversation: Spark Helper asks first (if it hasn't already), then drafts a starting prompt. */
export function NewChat({ name, studio, onStart, onSkip }: { name: string; studio: Studio; onStart: (prompt: string) => void; onSkip: () => void }) {
  const known = studio.answersSaved && answersComplete(studio.answers)
  const [variant, setVariant] = useState(0)
  const [editing, setEditing] = useState(false)
  const base = draftFromAnswers(studio.answers)
  const draft = variant === 0 ? base : ALT[(variant - 1) % ALT.length]
  const [text, setText] = useState<string | null>(null)
  const prompt = text ?? draft.prompt

  if (!known) {
    return (
      <div className="page">
        <div className="page__inner">
          <p className="eyebrow">New project</p>
          <h1 className="h1 h1--xl">Before we start, {name}…</h1>
          <p className="muted intro">A few quick questions so I can suggest ideas that fit you. You can skip and describe your own idea any time.</p>
          <HelperQuestions large answers={studio.answers} setAnswers={studio.setAnswers} onSave={studio.saveAnswers} onSkip={() => { studio.skipHelper(); onSkip() }} />
        </div>
        <div className="page__composer">
          <Composer placeholder="Or skip ahead and describe your idea…" onSend={onStart} footnote="Unity Spark · Spark Helper asks these once, if you didn’t answer them during your first build" />
        </div>
      </div>
    )
  }

  const games = studio.answers.games.split(/,|\band\b/).map((g) => g.trim()).filter(Boolean)
  const firstGenre = studio.answers.genres[0]?.replace(' / life sim', '')
  return (
    <div className="page">
      <div className="page__inner">
        <p className="eyebrow">New project</p>
        <h1 className="h1 h1--xl">What’s next, {name}?</h1>
        <p className="muted intro">I’ve drafted a starting point from the games you told me you love. Send it as it is, or change anything first.</p>

        <div className="prompt-box is-typing">
          <span className="pill pill--helper">✦ Drafted from your favourite games</span>
          {editing
            ? <textarea rows={3} value={prompt} autoFocus onChange={(e) => setText(e.target.value)} />
            : <p className="prompt-box__draft">{prompt}</p>}
          <div className="prompt-box__row">
            <div className="chips chips--tight">
              <button className="chip" onClick={() => { setVariant((v) => v + 1); setText(null); setEditing(false) }}>↻ Another idea</button>
              <button className={`chip ${editing ? 'chip--on' : ''}`} onClick={() => setEditing((e) => !e)}>✎ Edit the prompt</button>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => onStart(prompt)}>Send</button>
          </div>
        </div>
        <p className="fine footnote">Unity Spark · Ideas use what you shared during your first build</p>

        <h2 className="section-title">Why this idea</h2>
        <div className="why-card">
          <div className="why-card__img">
            <img src={draft.image} alt="" />
            <span className="tag">{draft.tag}</span>
          </div>
          <div className="why-card__body">
            <h3>{draft.title}</h3>
            <p className="muted small">{draft.meta}</p>
            <p>{draft.why}</p>
            <span className="pill pill--helper">Based on: {[games[0], firstGenre, studio.answers.experience].filter(Boolean).join(' · ')}</span>
          </div>
        </div>

        <h2 className="section-title">More ideas for you</h2>
        <div className="chips">
          {MORE_FOR_YOU.map((m) => <button key={m.label} className="chip" onClick={() => onStart(m.prompt)}>✦ {m.label}</button>)}
        </div>
      </div>
    </div>
  )
}

const ALT = [
  {
    title: 'Getaway driving challenge', tag: 'Based on your answers', image: 'assets/palm-city.jpg', look: 'city' as const,
    meta: 'Synty POLYGON – Palm City · Low-poly 3D · Racing',
    prompt: 'A getaway driving game through a sunny coastal city. Lose the police, weave through traffic and reach the safehouse before the timer runs out.',
    why: 'A smaller slice of the open-world city feel you like: one car, one city, and a clear goal for a first project.',
  },
  {
    title: 'Cozy valley farm', tag: 'Inspired by Stardew Valley', image: 'assets/next-dusk.jpg', look: 'woodland' as const,
    meta: 'Stylized 3D · Cozy / life sim',
    prompt: 'A cozy farming game in a small valley. Plant crops, befriend the villagers and decorate a little cottage through the seasons.',
    why: 'You like relaxed play, so this keeps the gentle routine of tending a farm, sized for a first project.',
  },
]

const MORE_FOR_YOU = [
  { label: 'Cozy farm life sim (like Stardew Valley)', prompt: 'A cozy farming game in a small valley. Plant crops, befriend the villagers and decorate a little cottage through the seasons.' },
  { label: 'Open-world firefly hunt', prompt: 'An open-world exploration game across floating forest islands, collecting rare fireflies and unlocking new areas as you go.' },
  { label: 'Getaway driving challenge', prompt: 'A getaway driving game through a sunny coastal city. Lose the police, weave through traffic and reach the safehouse before the timer runs out.' },
]
