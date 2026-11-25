import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  CLARIFY_OPTIONS, THEMES, changeByTitle, changesFor, EXPERIENCE, FEEDBACK_CHIPS, GENRES, PLAY_STYLE, QUESTION_BY_ID,
  answersComplete, answersSummary, buildStepsFor, formatAnswer, isAnswered,
  type Answers, type ProfileQuestion, type ProfileValue, type ChangeDef, type ChangeId, type Msg, type Project,
} from '../lib/flow'
import { STEP_MS, type Studio } from '../lib/useStudio'
import { howItWorks, persona, say, tweaks, unityFiles } from '../lib/personalise'
import { ProgressBar, SparkHeader, Spinner, Steps } from './Shell'

// ───────────────────────── Spark Helper questions (ONB-110) ─────────────────────────

export function HelperQuestions({
  answers, setAnswers, onSave, onSkip, large, badge, saveLabel = 'Show me ideas', skipLabel = 'Skip for now', note,
}: {
  badge?: string
  saveLabel?: string
  skipLabel?: string
  note?: string
  answers: Answers
  setAnswers: (patch: Partial<Answers>) => void
  onSave: () => void
  onSkip: () => void
  large?: boolean
}) {
  const answered = [answers.experience, answers.play, answers.games.trim(), answers.genres.length].filter(Boolean).length
  const done = answersComplete(answers)
  const Choice = ({ options, value, pick }: { options: string[]; value: string | null; pick: (v: string) => void }) => (
    <div className="chips">
      {options.map((o) => <button key={o} className={`chip ${value === o ? 'chip--on' : ''}`} onClick={() => pick(o)}>{o}</button>)}
    </div>
  )
  const toggleGenre = (g: string) => setAnswers({ genres: answers.genres.includes(g) ? answers.genres.filter((x) => x !== g) : [...answers.genres, g] })

  return (
    <div className={`helper ${large ? 'helper--large' : ''}`}>
      <SparkHeader helper badge={badge ?? (large ? 'Before your next project' : undefined)} />
      {!large && <p className="helper__intro">While that builds — a few quick questions so I can tailor your next steps and future ideas.</p>}
      <div className="helper__q">
        <h4>How much time have you spent making games?</h4>
        <Choice options={EXPERIENCE} value={answers.experience} pick={(v) => setAnswers({ experience: v })} />
      </div>
      <div className="helper__q">
        <h4>How do you like to play games?</h4>
        <Choice options={PLAY_STYLE} value={answers.play} pick={(v) => setAnswers({ play: v })} />
      </div>
      <div className="helper__q">
        <h4>What are your favourite games?</h4>
        <input
          className="helper__input" value={answers.games} placeholder="e.g. GTA 6, Stardew Valley"
          onChange={(e) => setAnswers({ games: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter' && done) onSave() }}
        />
      </div>
      <div className="helper__q">
        <h4>Any genres you particularly like?</h4>
        <div className="chips">
          {(large ? GENRES : GENRES.slice(0, 6)).map((g) => (
            <button key={g} className={`chip ${answers.genres.includes(g) ? 'chip--on' : ''}`} onClick={() => toggleGenre(g)}>{g}</button>
          ))}
        </div>
      </div>
      {large ? (
        <div className="helper__foot helper__foot--large">
          <span className="fine">{note ?? `Question ${Math.min(4, answered + 1)} of 4 · Your answers shape the ideas Spark suggests.`}</span>
          <span className="helper__actions">
            <button className="btn btn--ghost" onClick={onSkip}>{skipLabel}</button>
            <button className="btn btn--primary" onClick={onSave} disabled={!done}>{saveLabel}</button>
          </span>
        </div>
      ) : (
        <>
          <p className="fine helper__note">Answers shape your next steps and future project ideas.</p>
          <div className="helper__foot">
            <span className="helper__actions">
              <button className="btn btn--ghost btn--xs" onClick={onSkip}>Skip for now</button>
              {done && <button className="btn btn--primary btn--xs" onClick={onSave}>Save answers</button>}
            </span>
            <span className="fine">Question {Math.min(4, answered + 1)} of 4</span>
          </div>
        </>
      )}
    </div>
  )
}

export function AnswersSaved({ answers }: { answers: Answers }) {
  return (
    <div className="helper helper--saved">
      <SparkHeader helper badge="Answers saved" />
      <p>{answersSummary(answers)}</p>
    </div>
  )
}

// ───────────────────────── One profile question ─────────────────────────

/** Chips for single/multi choice (single saves on click), or a text box. */
export function QuestionInput({
  q, value, onSubmit, saveLabel = 'Save',
}: {
  q: ProfileQuestion
  value?: ProfileValue
  onSubmit: (v: ProfileValue) => void
  saveLabel?: string
}) {
  const [multi, setMulti] = useState<string[]>(Array.isArray(value) ? value : [])
  const [text, setText] = useState(typeof value === 'string' ? value : '')
  if (q.kind === 'single') {
    return (
      <div className="chips">
        {q.options!.map((o) => <button key={o} className={`chip ${value === o ? 'chip--on' : ''}`} onClick={() => onSubmit(o)}>{o}</button>)}
      </div>
    )
  }
  if (q.kind === 'multi') {
    const toggle = (o: string) => setMulti((m) => (m.includes(o) ? m.filter((x) => x !== o) : [...m, o]))
    return (
      <>
        <div className="chips">
          {q.options!.map((o) => <button key={o} className={`chip ${multi.includes(o) ? 'chip--on' : ''}`} onClick={() => toggle(o)}>{o}</button>)}
        </div>
        <div className="ask__save">
          <span className="fine">Pick any that apply</span>
          <button className="btn btn--primary btn--xs" disabled={!multi.length} onClick={() => onSubmit(multi)}>{saveLabel}</button>
        </div>
      </>
    )
  }
  return (
    <div className="ask__text">
      <input
        className="helper__input" value={text} placeholder={q.placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) onSubmit(text.trim()) }}
      />
      <button className="btn btn--primary btn--xs" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>{saveLabel}</button>
    </div>
  )
}

function AskCard({ qid, skipped, off, project, studio }: { qid: string; skipped?: boolean; off?: boolean; project: Project; studio: Studio }) {
  const q = QUESTION_BY_ID[qid]
  const value = studio.profile[qid]
  if (!q) return null
  if (isAnswered(value)) {
    return (
      <div className="helper helper--saved ask ask--done">
        <SparkHeader helper badge="Added to your profile" />
        <p className="ask__q-done">{q.text}</p>
        <p className="ask__a">{formatAnswer(value)}</p>
      </div>
    )
  }
  if (off) {
    return (
      <p className="fine helper-skipped">
        Spark Helper is off for this session.{' '}
        {studio.helperOff && <button className="link-btn" onClick={() => studio.setHelperOff(false)}>Turn it back on</button>}
      </p>
    )
  }
  if (skipped) return <p className="fine helper-skipped">Spark Helper · Skipped “{q.text}” for now</p>
  const busy = project.phase === 'building' || project.phase === 'working'
  return (
    <div className="helper ask">
      <SparkHeader helper badge={busy ? (project.phase === 'working' ? 'While Spark works' : 'While you wait') : 'When you’re ready'} />
      <p className="ask__group">{q.group}</p>
      <h4 className="ask__q">{q.text}</h4>
      <QuestionInput q={q} onSubmit={(v) => studio.answerQuestion(qid, v, project.id)} />
      <div className="ask__foot">
        <button className="btn btn--text btn--xs" onClick={() => studio.skipQuestion(project.id, qid)}>Skip</button>
        <button className="btn btn--text btn--xs" onClick={() => studio.skipQuestion(project.id, qid, true)}>Not now</button>
        <button className="btn btn--text btn--xs ask__off" onClick={() => studio.dismissHelper(project.id)}>Don’t ask again this session</button>
      </div>
    </div>
  )
}

// ───────────────────────── Thread ─────────────────────────

function ChangeThumb({ change }: { change: ChangeDef }) {
  const style: CSSProperties = { objectPosition: change.focus, transform: `scale(${change.zoom})`, transformOrigin: change.focus }
  return <div className="thumb"><img src={change.image} alt="" style={style} /></div>
}

function UserMsg({ text }: { text: string }) {
  return <div className="msg msg--user"><p>{text}</p></div>
}

export function ChatThread({
  project, studio, onPickChange, onPublish,
}: {
  project: Project
  studio: Studio
  onPickChange: (id: ChangeId | 'custom', text?: string) => void
  onPublish?: () => void
}) {
  const p = project
  const me = persona(studio.profile)
  const [showAll, setShowAll] = useState<number[]>([])
  const [learnOpen, setLearnOpen] = useState<number[]>([])
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [p.messages.length, p.thinking, p.buildStep, p.workStep])

  const msgs = p.messages
  const has = (kind: Msg['kind'], after = -1) => msgs.some((m, i) => i > after && m.kind === kind)
  const lastSpark = msgs.reduce((acc, m, i) => (m.kind !== 'user' ? i : acc), -1)
  const lastIndex = msgs.length - 1
  const ready = p.phase === 'ready' && !p.thinking
  const steps = buildStepsFor(p.look)

  const render = (m: Msg, i: number) => {
    switch (m.kind) {
      case 'user':
        return <UserMsg text={m.text} />

      case 'spark':
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            {m.title && <h3 className="msg__title">{m.title}</h3>}
            <p>{m.text}</p>
            {m.starting && !has('build') && <p className="starting"><Spinner size={16} /> Starting build…</p>}
          </div>
        )

      case 'clarify': {
        const answer = msgs[i + 1]?.kind === 'user' ? (msgs[i + 1] as { text: string }).text : null
        const active = p.phase === 'clarify' && !p.thinking
        const subject = /forest|wood/i.test(p.prompt) ? 'forest games' : /space|station|planet|rocket|orbit/i.test(p.prompt) ? 'space games' : /city|town|deliver/i.test(p.prompt) ? 'city games' : 'ideas like this'
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <p>Nice — {subject} can go lots of ways. One quick question so your first version feels right:</p>
            <h3 className="msg__question">What should the player mostly do?</h3>
            <div className="chips">
              {CLARIFY_OPTIONS.map((o) => (
                <button key={o} className={`chip ${answer?.startsWith(o) ? 'chip--on' : ''}`} disabled={!active} onClick={() => studio.answerClarify(p.id, o)}>{o}</button>
              ))}
            </div>
            {active && <button className="btn btn--text btn--sm skip" onClick={() => studio.answerClarify(p.id, null)}>Skip — just surprise me</button>}
          </div>
        )
      }

      case 'build': {
        if (has('buildDone', i)) return null
        if (has('helper', i)) {
          return (
            <div className="card build-mini">
              <Spinner size={16} />
              <div>
                <strong>Building · step {Math.min(p.buildStep + 1, steps.length)} of {steps.length}</strong>
                <span>{steps[Math.min(p.buildStep, steps.length - 1)]}</span>
              </div>
              <ProgressBar value={p.buildStep / steps.length} />
            </div>
          )
        }
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">Building your first playable</h3>
            <p>Setting up a Unity project with {THEMES[p.look].setup}.</p>
            <Steps items={steps} done={p.buildStep} />
            <ProgressBar value={p.buildStep / steps.length} />
          </div>
        )
      }

      case 'helper':
        // Older chats had the first four questions as one card; they're now asked one at a time.
        return studio.answersSaved ? <AnswersSaved answers={studio.answers} /> : null

      case 'ask':
        return <AskCard qid={m.qid} skipped={m.skipped} off={m.off} project={p} studio={studio} />

      case 'buildDone':
        return (
          <div className="card build-done">
            <span className="check">✓</span> Built in {Math.round((steps.length * STEP_MS + 500) / 1000)}s · {steps.length} of {steps.length} steps
          </div>
        )

      case 'ready':
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">Your first playable is ready.</h3>
            <p>{say(me.tone, {
              short: 'Press Play to try it.',
              friendly: 'Press Play in the preview to try it out.',
              detailed: `Press Play in the preview to try it out. Move with the arrow keys or WASD, or click to steer, and collect all ten ${THEMES[p.look].pickups}.`,
            })}</p>
          </div>
        )

      case 'feel': {
        if (i !== lastSpark) {
          return (
            <div className="msg msg--spark msg--compact">
              <SparkHeader />
              <strong>How does it feel?</strong>
              <span className="muted">Tell me what’s fun, and what you’d change.</span>
            </div>
          )
        }
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">How does it feel?</h3>
            <p>{say(me.tone, {
              short: 'What would you change?',
              friendly: 'Have a play, then tell me what you think — what’s fun, and what would you change?',
              detailed: 'Have a play, then tell me what you think. What’s fun, what feels off, and what would you change? The more specific, the better my suggestions.',
            })}</p>
            <div className="chips">
              {FEEDBACK_CHIPS.map((c) => <button key={c} className="chip" disabled={!ready} onClick={() => studio.sendFeedback(p.id, c)}>{c}</button>)}
            </div>
          </div>
        )
      }

      case 'next': {
        if (has('working', i)) {
          return (
            <div className="card collapsed">
              <strong>Suggested next steps</strong>
              <span>{m.order.map((k) => changesFor(p.look)[k].title.replace(/^Add an? /, '')).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}</span>
            </div>
          )
        }
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">{m.title}</h3>
            <span className="pill pill--helper">{m.basis}</span>
            <div className="next-list">
              {/* "Spark decides, I steer": lead with one recommendation, others on request. */}
              {(me.sparkDecides && !showAll.includes(i) ? m.order.slice(0, 1) : m.order).map((id, k) => {
                const c = changesFor(p.look)[id]
                const done = p.history.some((h) => h.id === id)
                return (
                  <div key={id} className={`next-card ${k === 0 ? 'next-card--rec' : ''}`}>
                    <div className="next-card__img">
                      <ChangeThumb change={c} />
                      {k === 0 && <span className="tag tag--rec">Best match</span>}
                    </div>
                    <div className="next-card__body">
                      <strong>{c.title}</strong>
                      <p>{c.desc}</p>
                      <div className="next-card__foot">
                        <button className={`btn btn--xs ${k === 0 ? 'btn--primary' : 'btn--ghost'}`} disabled={!ready || done} onClick={() => onPickChange(id)}>
                          {done ? 'Added ✓' : 'Do this next'}
                        </button>
                        <span className={`fine ${m.reasons?.[id] ? 'reason--personal' : ''}`}>{m.reasons?.[id] ?? c.reason}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {me.sparkDecides && !showAll.includes(i) && (
              <button className="btn btn--text btn--xs other-ideas" onClick={() => setShowAll((s) => [...s, i])}>Show other ideas</button>
            )}
          </div>
        )
      }

      case 'working':
        if (has('done', i)) return null
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">{m.change.doing}</h3>
            <p>{say(me.tone, {
              short: 'On it. You can undo this later.',
              friendly: 'On it. I’ll keep your current version, so you can undo this later.',
              detailed: `On it. ${m.change.about.replace(/^Spark is /, 'I’m ')} I’ll keep your current version, so you can undo this later.`,
            })}</p>
            <Steps items={m.change.steps} done={p.workStep} />
            <ProgressBar value={p.workStep / m.change.steps.length} />
          </div>
        )

      case 'done': {
        const slot = m.change.id
        const isLast = i === lastIndex || i === lastSpark
        const firstDone = msgs.findIndex((x) => x.kind === 'done') === i
        // Next chips: the change's own follow-ups, plus tweaks or "use my own art" if the profile asks for them.
        const chips = [
          ...m.change.next,
          ...(me.hands ? tweaks(slot, p.look).slice(0, 1) : []),
          ...(me.ownArt && slot === 'companion' ? [`Use my own ${THEMES[p.look].companion} art`] : []),
        ]
        return (
          <div className="msg msg--spark">
            <SparkHeader />
            <h3 className="msg__title">{m.change.doneTitle}</h3>
            {me.detail === 'result' ? (
              <p>{say(me.tone, { short: 'Press Play to try it.', friendly: 'Press Play in the preview to try it out.', detailed: 'It’s in the preview now. Press Play to try it out.' })}</p>
            ) : (
              <>
                <p>Here’s what changed in your project:</p>
                <ul className="changes">{m.change.changes.map((c) => <li key={c}><b>+</b>{c}</li>)}</ul>
                {me.detail === 'unity' && (
                  <div className="unity-files">
                    <span className="fine">Changed in Unity</span>
                    {unityFiles(slot, p.look).map((f) => <code key={f}>{f}</code>)}
                  </div>
                )}
              </>
            )}
            {me.teach && (
              <div className={`learn ${learnOpen.includes(i) ? 'is-open' : ''}`}>
                <button className="learn__toggle" onClick={() => setLearnOpen((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}>
                  <span>💡 How this works</span><span aria-hidden>{learnOpen.includes(i) ? '−' : '+'}</span>
                </button>
                {learnOpen.includes(i) && <p>{howItWorks(slot, p.look)}</p>}
              </div>
            )}
            {me.sharing && firstDone && !p.publishedAt && onPublish && (
              <div className="nudge">
                <span><b>Ready to show someone?</b> Publish a link friends can play in their browser.</span>
                <button className="btn btn--ghost btn--xs" onClick={onPublish}>Publish</button>
              </div>
            )}
            <h4 className="msg__sub">{say(me.tone, { short: 'Next:', friendly: 'Next, would you like to…', detailed: 'Next, would you like to…' })}</h4>
            <div className="chips">
              {chips.map((n) => {
                const known = changeByTitle(p.look, n)
                return <button key={n} className="chip" disabled={!ready || !isLast} onClick={() => (known ? onPickChange(known) : onPickChange('custom', n))}>{n}</button>
              })}
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div className="thread">
      {msgs.map((m, i) => {
        const el = render(m, i)
        return el ? <div key={i} className="thread__item">{el}</div> : null
      })}
      {p.thinking && (
        <div className="thread__item msg msg--spark">
          <SparkHeader />
          <div className="dots"><span /><span /><span /></div>
        </div>
      )}
      <div ref={end} />
    </div>
  )
}
