import { useCallback, useEffect, useRef, useState } from 'react'
import { recommendLook, type LookId } from './looks'
import { dreamDraft, persona, rankNextSteps, say } from './personalise'
import { PITCHES, rankPitches } from './pitches'
import {
  BUILD_STEPS, MORE_IDEAS, STARTER_IDEAS, LEGACY_CHANGE_IDS, NEXT_ORDER, changeByTitle, changesFor, PROFILE_QUESTIONS, answersComplete, isAnswered, isShortPrompt, titleFor,
  type Answers, type PromptOption, type Profile, type ProfileQuestion, type ProfileValue, type ChangeDef, type ChangeId, type ChangeSlot, type Msg, type Project,
} from './flow'

/*
 * Scripted Spark. Every "AI" reply goes through `reply()` with a short thinking delay,
 * so a real model can be dropped in later by replacing the bodies of these actions.
 */

// ~58s first build, so there's real time to answer Spark Assist while it runs.
export const STEP_MS = 9500
export const WORK_MS = 3000
const KEY = 'unity-spark.studio'
let seq = 0
const uid = () => `p${Date.now().toString(36)}${(seq++).toString(36)}`

export const versionOf = (p: Project) => `v0.${1 + p.history.length}`
export const hasChange = (p: Project, id: ChangeId) => p.history.some((h) => h.id === id)
export const isPlayable = (p: Project) => p.messages.some((m) => m.kind === 'buildDone')

interface Saved {
  projects: Record<string, Project>; order: string[]; profile?: Profile; profileSkipped?: string[]
  /** Older saves kept the first four answers separately. */
  answers?: Answers
}

/** Prototype only: the prompts Spark offers. Anything else is a custom prompt the prototype can't build yet. */
function recommendedPrompts(profile: Profile): PromptOption[] {
  const dream = dreamDraft(profile)
  return [
    ...STARTER_IDEAS.map(({ title, prompt, look }) => ({ title, prompt, look })),
    ...MORE_IDEAS.map(({ title, prompt }) => ({ title, prompt, look: recommendLook(prompt) })),
    ...PITCHES.map(({ title, prompt, look }) => ({ title, prompt, look })),
    ...(dream ? [{ title: dream.title, prompt: dream.prompt, look: dream.look }] : []),
  ]
}

const samePrompt = (a: string, b: string) => a.trim().replace(/[.!?]+$/, '').toLowerCase() === b.trim().replace(/[.!?]+$/, '').toLowerCase()

/** Three prompts to offer instead: the best-fit pitches if the profile has anything in it, otherwise the starter ideas. */
function promptChoices(profile: Profile): PromptOption[] {
  if (Object.keys(profile).length === 0) return STARTER_IDEAS.map(({ title, prompt, look }) => ({ title, prompt, look }))
  return rankPitches(profile).slice(0, 3).map(({ pitch: { title, prompt, look } }) => ({ title, prompt, look }))
}

const HELPER_OFF_KEY = 'unity-spark.helper-off'

/** The first four profile questions, in the shape the rest of the app reads. */
export function answersOf(profile: Profile): Answers {
  const str = (v: ProfileValue | undefined) => (typeof v === 'string' ? v : '')
  return {
    experience: str(profile.experience) || null,
    play: str(profile.play) || null,
    games: str(profile.games),
    genres: Array.isArray(profile.genres) ? profile.genres : [],
  }
}

/** Next profile question to ask: unanswered ones in order, then ones skipped earlier (oldest skip first). */
export function nextQuestion(profile: Profile, skipped: string[]): ProfileQuestion | undefined {
  const open = PROFILE_QUESTIONS.filter((q) => !isAnswered(profile[q.id]))
  return open.find((q) => !skipped.includes(q.id)) ?? skipped.map((id) => open.find((q) => q.id === id)).find(Boolean)
}

/** Reload-safe: anything mid-build when the page closed is treated as finished. */
function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Saved
    for (const p of Object.values(s.projects)) {
      p.thinking = false
      if (p.phase === 'building') {
        p.phase = 'ready'
        p.messages.push({ kind: 'buildDone' }, { kind: 'ready' })
      }
      if (p.phase === 'working') p.phase = 'ready'
      p.future ??= []
      p.createdAt ??= p.editedAt
      // Older saves used forest names (fox / dusk / clearing) as change ids.
      const fix = <T extends { id: string }>(c: T) => (LEGACY_CHANGE_IDS[c.id] ? { ...c, id: LEGACY_CHANGE_IDS[c.id] } : c)
      p.history = p.history.map(fix)
      p.future = p.future.map(fix)
      p.messages = p.messages.map((m) => (m.kind === 'next' ? { ...m, order: m.order.map((o) => LEGACY_CHANGE_IDS[o] ?? o) } : m))
    }
    // Move the first four answers from older saves into the profile.
    const a = s.answers
    if (a) {
      s.profile = { ...(s.profile ?? {}) }
      if (a.experience && !s.profile.experience) s.profile.experience = a.experience
      if (a.play && !s.profile.play) s.profile.play = a.play
      if (a.games.trim() && !s.profile.games) s.profile.games = a.games.trim()
      if (a.genres.length && !s.profile.genres) s.profile.genres = a.genres
    }
    return s
  } catch {
    return null
  }
}

export function useStudio() {
  const [initial] = useState(load)
  const [projects, setProjects] = useState<Record<string, Project>>(initial?.projects ?? {})
  const [order, setOrder] = useState<string[]>(initial?.order ?? [])
  const [profile, setProfile] = useState<Profile>(initial?.profile ?? {})
  // "Don't ask again this session": kept in sessionStorage so a reload in the same tab respects it.
  const [helperOff, setHelperOffState] = useState(() => { try { return sessionStorage.getItem(HELPER_OFF_KEY) === '1' } catch { return false } })
  const helperOffRef = useRef(helperOff)
  helperOffRef.current = helperOff
  const answers = answersOf(profile)
  const answersSaved = answersComplete(answers)
  const [profileSkipped, setProfileSkipped] = useState<string[]>(initial?.profileSkipped ?? [])
  const profileRef = useRef({ profile, profileSkipped })
  profileRef.current = { profile, profileSkipped }
  const timers = useRef<number[]>([])
  const projectsRef = useRef(projects)
  projectsRef.current = projects

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ projects, order, profile, profileSkipped })) } catch { /* private mode */ }
  }, [projects, order, profile, profileSkipped])

  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }, [])

  const update = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((all) => (all[id] ? { ...all, [id]: { ...fn(all[id]), editedAt: Date.now() } } : all))
  }, [])
  const push = useCallback((id: string, ...msgs: Msg[]) => update(id, (p) => ({ ...p, messages: [...p.messages, ...msgs] })), [update])

  const reply = useCallback((id: string, fn: () => void, ms = 900) => {
    update(id, (p) => ({ ...p, thinking: true }))
    later(() => { update(id, (p) => ({ ...p, thinking: false })); fn() }, ms)
  }, [later, update])

  // ───────── Spark Assist: profile questions during builds and changes, one at a time ─────────
  /** Ask the next profile question, but only while the user is waiting and nothing else is open. */
  const askNext = useCallback((id: string) => {
    const p = projectsRef.current[id]
    if (!p || helperOffRef.current || (p.phase !== 'building' && p.phase !== 'working')) return
    const { profile: prof, profileSkipped: skips } = profileRef.current
    if (p.messages.some((m) => m.kind === 'ask' && !m.skipped && !isAnswered(prof[m.qid]))) return
    const q = nextQuestion(prof, skips)
    if (q) push(id, { kind: 'ask', qid: q.id })
  }, [push])

  // ───────── First build (ONB-104) ─────────
  const startBuild = useCallback((id: string) => {
    update(id, (p) => ({ ...p, phase: 'building', buildStep: 0, messages: [...p.messages, { kind: 'build' }] }))
    // Spark Assist (ONB-110) joins while the build is running, one question at a time.
    later(() => askNext(id), 4000)
    BUILD_STEPS.forEach((_, i) => {
      later(() => update(id, (p) => ({ ...p, buildStep: i + 1 })), STEP_MS * (i + 1))
    })
    later(() => {
      update(id, (p) => ({ ...p, phase: 'ready', messages: [...p.messages, { kind: 'buildDone' }, { kind: 'ready' }] }))
    }, STEP_MS * BUILD_STEPS.length + 500)
  }, [askNext, later, update])

  const startProject = useCallback((prompt: string, opts: { look?: LookId; title?: string } = {}) => {
    const text = prompt.trim()
    if (!text) return null
    const id = uid()
    const project: Project = {
      id, title: opts.title ?? titleFor(text), prompt: text, look: opts.look ?? recommendLook(text),
      messages: [{ kind: 'user', text }], phase: 'clarify', buildStep: 0, workStep: 0,
      history: [], future: [], playedOnce: false, thinking: false, publishedAt: null, editedAt: Date.now(), createdAt: Date.now(),
    }
    setProjects((all) => ({ ...all, [id]: project }))
    setOrder((o) => [id, ...o])
    const prof = profileRef.current.profile
    const known = opts.look !== undefined || recommendedPrompts(prof).some((r) => samePrompt(r.prompt, text))
    if (!known && !isShortPrompt(text)) {
      // Prototype only: custom prompts come in the final build, so offer recommended ones instead.
      reply(id, () => { update(id, (p) => ({ ...p, phase: 'pick' })); push(id, { kind: 'pickPrompt', options: promptChoices(prof) }) }, 900)
    } else if (isShortPrompt(text)) {
      // ONB-111: one clarifying question, only when the first prompt is very short.
      reply(id, () => push(id, { kind: 'clarify' }), 1000)
    } else {
      reply(id, () => {
        const tone = persona(profileRef.current.profile).tone
        push(id, { kind: 'spark', starting: true, text: say(tone, {
          short: 'On it. Building your first playable now.',
          friendly: 'Love it. I’m building your first playable now — I’ll show you progress as I go.',
          detailed: 'Love it. I’ll create a Unity project, import an asset pack, lay out a first level, add a player and build a web preview, showing each step as I go.',
        }) })
        later(() => startBuild(id), 1200)
      }, 900)
    }
    return id
  }, [later, push, reply, startBuild, update])

  const answerClarify = useCallback((id: string, answer: string | null, typed = false) => {
    const p = projectsRef.current[id]
    if (!p || p.phase !== 'clarify') return
    const forest = /forest|wood/i.test(p.prompt)
    const text = answer === null ? 'Just surprise me.'
      : !typed && forest && answer === 'Explore and collect' ? 'Explore and collect — gather fireflies before nightfall.'
      : answer
    push(id, { kind: 'user', text })
    update(id, (q) => ({
      ...q, phase: 'building',
      title: answer === null && forest ? 'Forest firefly collector' : titleFor(q.prompt, answer ?? ''),
      look: recommendLook(`${q.prompt} ${answer ?? ''}`),
    }))
    reply(id, () => {
      const tone = persona(profileRef.current.profile).tone
      push(id, { kind: 'spark', starting: true, text: say(tone, {
        short: 'Got it. Building your first playable now.',
        friendly: 'Perfect. I’m building your first playable now — I’ll show you progress as I go.',
        detailed: 'Perfect. I’ll create a Unity project, import an asset pack, lay out a first level, add a player and build a web preview, showing each step as I go.',
      }) })
      later(() => startBuild(id), 1400)
    })
  }, [later, push, reply, startBuild, update])

  /** Prototype only: the user picked a recommended prompt after trying a custom one. */
  const pickPrompt = useCallback((id: string, choice: PromptOption) => {
    const p = projectsRef.current[id]
    if (!p || p.phase !== 'pick' || p.thinking) return
    push(id, { kind: 'user', text: choice.prompt })
    update(id, (q) => ({ ...q, phase: 'building', prompt: choice.prompt, title: choice.title, look: choice.look }))
    reply(id, () => {
      const tone = persona(profileRef.current.profile).tone
      push(id, { kind: 'spark', starting: true, text: say(tone, {
        short: 'Good pick. Building your first playable now.',
        friendly: 'Good pick. I’m building your first playable now — I’ll show you progress as I go.',
        detailed: 'Good pick. I’ll create a Unity project, import an asset pack, lay out a first level, add a player and build a web preview, showing each step as I go.',
      }) })
      later(() => startBuild(id), 1200)
    })
  }, [later, push, reply, startBuild, update])

  // ───────── Spark Assist answers (ONB-110) ─────────
  /** Set any of the first four answers (used by the new-chat question screen). */
  const setAnswers = useCallback((patch: Partial<Answers>) => {
    setProfile((p) => {
      const next = { ...p }
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || (typeof v === 'string' && !v.trim() && k !== 'games')) delete next[k]
        else next[k] = v as ProfileValue
      }
      return next
    })
  }, [])

  /** Spark Assist off (or back on) for the rest of this browser session. */
  const setHelperOff = useCallback((off: boolean) => {
    setHelperOffState(off)
    try { if (off) sessionStorage.setItem(HELPER_OFF_KEY, '1'); else sessionStorage.removeItem(HELPER_OFF_KEY) } catch { /* private mode */ }
  }, [])

  /** "Don't ask again this session" on a question card. */
  const dismissHelper = useCallback((id: string) => {
    setHelperOff(true)
    update(id, (p) => ({ ...p, messages: p.messages.map((m) => (m.kind === 'ask' && !m.skipped && !isAnswered(profileRef.current.profile[m.qid]) ? { ...m, skipped: true, off: true } : m)) }))
  }, [setHelperOff, update])

  /** Save a profile answer; if Spark is still busy, follow up with the next question. */
  const answerQuestion = useCallback((qid: string, value: ProfileValue, id?: string) => {
    setProfile((p) => ({ ...p, [qid]: value }))
    setProfileSkipped((s) => s.filter((x) => x !== qid))
    if (id) later(() => askNext(id), 1400)
  }, [askNext, later])

  /** "Skip" moves on to another question; "Not now" (stop) waits until the next build or change. */
  const skipQuestion = useCallback((id: string, qid: string, stop = false) => {
    setProfileSkipped((s) => [...s.filter((x) => x !== qid), qid])
    update(id, (p) => ({ ...p, messages: p.messages.map((m) => (m.kind === 'ask' && m.qid === qid && !m.skipped ? { ...m, skipped: true } : m)) }))
    if (!stop) later(() => askNext(id), 800)
  }, [askNext, later, update])

  // ───────── Playing and feedback (ONB-109) ─────────
  const played = useCallback((id: string) => {
    const p = projectsRef.current[id]
    if (!p || p.playedOnce) return
    update(id, (q) => ({ ...q, playedOnce: true }))
    later(() => push(id, { kind: 'feel' }), 1200)
  }, [later, push, update])

  const sendFeedback = useCallback((id: string, text: string) => {
    push(id, { kind: 'user', text })
    const lower = text.toLowerCase()
    const p = projectsRef.current[id]
    if (!p) return
    // Rank the three next steps from this feedback plus everything in the profile.
    const prof = profileRef.current.profile
    const { order, reasons, basis } = rankNextSteps(prof, text, p.look, p.history.map((h) => h.id).filter((h): h is ChangeSlot => h !== 'custom'))
    const liked = /love|great|fun|nice|good/.test(lower)
    const title = say(persona(prof).tone, {
      short: 'Next steps',
      friendly: liked ? 'Nice! Here’s what I’d do next' : 'Good shout. Here’s what I’d do next',
      detailed: liked ? 'Glad you like it. Here’s what I’d do next, and why' : 'Thanks, that helps. Here’s what I’d do next, and why',
    })
    reply(id, () => push(id, { kind: 'next', basis, title, order, reasons }), 1200)
  }, [push, reply])

  // ───────── Changes, undo and publishing ─────────
  const applyChange = useCallback((id: string, changeId: ChangeId, customText?: string) => {
    const p = projectsRef.current[id]
    if (!p || p.phase !== 'ready' || p.thinking) return
    const def: ChangeDef = changeId === 'custom'
      ? {
          id: 'custom', title: customText ?? 'Your change', desc: '', reason: '', image: '', focus: '50% 50%', zoom: 1,
          doing: 'Working on your change', doneTitle: 'Done — your change is in.', historyTitle: customText ?? 'Custom change',
          about: `Spark is updating your project: “${customText}”.`,
          steps: ['Reading your request', 'Updating the project', 'Rebuilding the web preview'],
          changes: [customText ?? 'Your change'],
          next: NEXT_ORDER.filter((k) => !p.history.some((h) => h.id === k)).map((k) => changesFor(p.look)[k].title),
        }
      : changesFor(p.look)[changeId]
    push(id, { kind: 'user', text: customText ?? def.title })
    update(id, (q) => ({ ...q, phase: 'working', workStep: 0 }))
    reply(id, () => {
      push(id, { kind: 'working', change: def, from: 1 + (projectsRef.current[id]?.history.length ?? 0) })
      later(() => askNext(id), 2500)
      def.steps.forEach((_, i) => later(() => update(id, (q) => ({ ...q, workStep: i + 1 })), WORK_MS * (i + 1)))
      later(() => {
        update(id, (q) => ({
          ...q, phase: 'ready', future: [],
          history: [...q.history.filter((h) => h.id === 'custom' || h.id !== def.id), { id: def.id, title: def.historyTitle, version: q.history.length + 2, at: Date.now() }],
          messages: [...q.messages, { kind: 'done', change: def }],
        }))
      }, WORK_MS * def.steps.length + 400)
    }, 800)
  }, [askNext, later, push, reply, update])

  /** Free text from the composer: route it to whatever Spark is waiting for. */
  const send = useCallback((id: string, raw: string) => {
    const text = raw.trim()
    const p = projectsRef.current[id]
    if (!text || !p || p.thinking) return
    if (p.phase === 'clarify') return answerClarify(id, text, true)
    if (p.phase === 'pick') {
      const match = recommendedPrompts(profileRef.current.profile).find((r) => samePrompt(r.prompt, text) || samePrompt(r.title, text))
      if (match) return pickPrompt(id, match)
      push(id, { kind: 'user', text })
      return reply(id, () => push(id, { kind: 'pickPrompt', options: promptChoices(profileRef.current.profile), again: true }))
    }
    if (p.phase === 'building' || p.phase === 'working') {
      push(id, { kind: 'user', text })
      return reply(id, () => push(id, { kind: 'spark', text: 'Noted — I’ll pick that up as soon as this build finishes.' }))
    }
    const last = [...p.messages].reverse().find((m) => m.kind !== 'user')
    if (last?.kind === 'feel') return sendFeedback(id, text)
    const known = changeByTitle(p.look, text)
    applyChange(id, known ?? 'custom', known ? undefined : text)
  }, [answerClarify, applyChange, pickPrompt, push, reply, sendFeedback])

  /** Keep the first `keep` changes; later ones move to `future` (oldest first) so they can be redone. */
  const undoTo = useCallback((id: string, keep: number) => {
    update(id, (p) => {
      if (keep >= p.history.length) return p
      const undone = p.history.slice(keep)
      const history = p.history.slice(0, keep)
      const text = undone.length === 1
        ? `Undone: ${undone[0].title.charAt(0).toLowerCase()}${undone[0].title.slice(1)}. You’re back on v0.${1 + history.length}.`
        : `Restored v0.${1 + history.length}. Later versions are kept in your history, so you can redo them.`
      return { ...p, history, future: [...undone, ...p.future], messages: [...p.messages, { kind: 'spark', text }] }
    })
  }, [update])

  /** Re-apply undone changes up to and including `future[index]`. */
  const redoTo = useCallback((id: string, index: number) => {
    update(id, (p) => {
      const back = p.future.slice(0, index + 1)
      if (!back.length) return p
      const history = [...p.history, ...back]
      return {
        ...p, history, future: p.future.slice(index + 1),
        messages: [...p.messages, { kind: 'spark', text: `Redone: ${back.map((b) => b.title.toLowerCase()).join(', ')}. You’re on v0.${1 + history.length}.` }],
      }
    })
  }, [update])

  const publish = useCallback((id: string) => update(id, (p) => ({ ...p, publishedAt: Date.now() })), [update])

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setProjects({}); setOrder([]); setProfile({}); setProfileSkipped([]); setHelperOff(false)
  }, [setHelperOff])

  return {
    projects, order, answers, answersSaved, profile, profileSkipped, helperOff,
    startProject, answerClarify, pickPrompt, setAnswers, setHelperOff, dismissHelper, answerQuestion, skipQuestion,
    played, sendFeedback, applyChange, send, undoTo, redoTo, publish, reset,
  }
}

export type Studio = ReturnType<typeof useStudio>
