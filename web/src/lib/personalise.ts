// Turns Spark Helper's profile answers into decisions the rest of the app uses:
// which next step to suggest first (and why), how Spark talks, how much it shows,
// whether it teaches, and which new projects and nudges to offer.
// Every rule only kicks in once the relevant question has been answered.

import { THEMES, changesFor, type ChangeSlot, type Profile, type ProfileValue } from './flow'
import type { LookId } from './looks'

const has = (v: ProfileValue | undefined, x: string) => (Array.isArray(v) ? v.includes(x) : v === x)
const str = (v: ProfileValue | undefined) => (typeof v === 'string' ? v : '')

// ───────────────────────── How Spark talks and how much it shows ─────────────────────────

export type Tone = 'short' | 'friendly' | 'detailed'

export interface Persona {
  tone: Tone
  /** "Just the result" hides the change list; "Show me what changed in Unity" adds file paths. */
  detail: 'result' | 'summary' | 'unity'
  /** "Yes, teach me": a short "How this works" note after each change. */
  teach: boolean
  /** "Spark decides, I steer": one recommendation instead of three. */
  sparkDecides: boolean
  /** "I want control over details": offer tweak chips after a change. */
  hands: boolean
  /** Has their own art or music to bring in. */
  ownArt: boolean
  /** Making it for other people, so nudge toward publishing early. */
  sharing: boolean
  /** Short sessions: keep suggestions small. */
  quick: boolean
}

export function persona(p: Profile): Persona {
  const tone: Tone = has(p.tone, 'Short and to the point') ? 'short' : has(p.tone, 'Detailed') ? 'detailed' : 'friendly'
  const audience = Array.isArray(p.audience) ? p.audience : []
  return {
    tone,
    detail: has(p.detail, 'Just the result') ? 'result' : has(p.detail, 'Show me what changed in Unity') ? 'unity' : 'summary',
    teach: has(p.learn, 'Yes, teach me') || (!p.learn && has(p.goal, 'Learn how games are made')),
    sparkDecides: has(p.control, 'Spark decides, I steer'),
    hands: has(p.control, 'I want control over details'),
    ownArt: has(p.ownArt, 'Yes, I’ll upload them'),
    sharing: audience.some((a) => a !== 'Just me') || has(p.success, 'Friends enjoy it') || has(p.goal, 'Make something to share'),
    quick: has(p.session, 'A few minutes') || has(p.time, 'A quick try'),
  }
}

/** Pick the line for this user's preferred tone. */
export const say = (tone: Tone, lines: Record<Tone, string>) => lines[tone]

// ───────────────────────── Ranking next steps (ONB-109) ─────────────────────────

interface Rule { when: boolean; slot: ChangeSlot; score: number; label: string; reason: string }

export interface Ranking {
  order: ChangeSlot[]
  /** Short "why" shown on each card, in place of the generic reason. */
  reasons: Partial<Record<ChangeSlot, string>>
  /** What the ranking was based on, for the pill above the cards. */
  basis: string
}

export function rankNextSteps(p: Profile, feedback: string, look: LookId, done: ChangeSlot[] = []): Ranking {
  const f = feedback.toLowerCase()
  const t = THEMES[look]
  const calmLook = look !== 'orbital' // emergency lighting is moody, not calm
  const rules: Rule[] = [
    // What they just said counts most.
    { when: /lonely|empty|alone|quiet/.test(f), slot: 'companion', score: 4, label: 'your feedback', reason: 'You said it felt lonely' },
    { when: /easy|bigger|more to do|small|short|explore/.test(f), slot: 'area', score: 4, label: 'your feedback', reason: 'You wanted more to do' },
    { when: /cozy|relax|calm|night|dark|mood|atmos|pretty|look/.test(f), slot: 'atmosphere', score: 3, label: 'your feedback', reason: 'You mentioned the mood' },
    // What they enjoy, and what makes them stop playing.
    { when: has(p.enjoy, 'Exploring'), slot: 'area', score: 2, label: 'Exploring', reason: 'You enjoy exploring' },
    { when: has(p.enjoy, 'Collecting'), slot: 'companion', score: 1, label: 'Collecting', reason: `Helps you find ${t.pickups}` },
    { when: has(p.enjoy, 'Story'), slot: 'atmosphere', score: 1, label: 'Story', reason: 'Sets the scene' },
    { when: has(p.enjoy, 'Playing with friends'), slot: 'companion', score: 1, label: 'Playing with friends', reason: 'Someone to play alongside' },
    { when: has(p.quit, 'Repetitive'), slot: 'area', score: 2, label: 'Gets bored of repetition', reason: 'Keeps it fresh' },
    { when: has(p.quit, 'Too hard'), slot: 'companion', score: 2, label: 'Dislikes games that are too hard', reason: `Points you to the next ${t.pickup}` },
    { when: has(p.quit, 'Too slow'), slot: 'companion', score: 1, label: 'Dislikes slow games', reason: 'Speeds up the hunt' },
    // Mood, play style and genres.
    { when: has(p.mood, 'Calm') && calmLook, slot: 'atmosphere', score: 2, label: 'Calm', reason: 'Calm, like you asked' },
    { when: (has(p.mood, 'Tense') || has(p.mood, 'Spooky')) && look === 'orbital', slot: 'atmosphere', score: 2, label: str(p.mood), reason: 'Adds tension' },
    { when: has(p.mood, 'Epic'), slot: 'area', score: 1, label: 'Epic', reason: 'A bigger world' },
    { when: has(p.play, 'Relaxed') && calmLook, slot: 'atmosphere', score: 1, label: 'Relaxed', reason: 'Relaxed, no timer stress' },
    { when: has(p.play, 'Challenging'), slot: 'area', score: 1, label: 'Challenging', reason: 'More to master' },
    { when: has(p.genres, 'Open world'), slot: 'area', score: 1, label: 'Open world', reason: 'Open world' },
    { when: has(p.genres, 'Cozy / life sim') && calmLook, slot: 'atmosphere', score: 1, label: 'Cozy', reason: /stardew/i.test(str(p.games)) ? 'Cozy, like Stardew' : 'Cozy' },
  ]

  const score: Record<ChangeSlot, number> = { companion: 0.3, atmosphere: 0.2, area: 0.1 }
  const reasons: Partial<Record<ChangeSlot, string>> = {}
  const best: Partial<Record<ChangeSlot, number>> = {}
  const used: string[] = []
  for (const r of rules) {
    if (!r.when) continue
    score[r.slot] += r.score
    if ((best[r.slot] ?? 0) < r.score) { best[r.slot] = r.score; reasons[r.slot] = r.reason }
    if (!used.includes(r.label)) used.push(r.label)
  }
  for (const d of done) score[d] -= 10 // already added: push to the end
  const order = (Object.keys(score) as ChangeSlot[]).sort((a, b) => score[b] - score[a])
  const answers = used.filter((u) => u !== 'your feedback').slice(0, 3)
  const basis = answers.length ? `Based on your feedback · ${answers.join(' · ')}` : 'Based on your feedback'
  return { order, reasons, basis }
}

// ───────────────────────── After a change ─────────────────────────

/** Unity files a change touched, for people who asked to see what changed in Unity. */
export function unityFiles(slot: ChangeSlot | 'custom', look: LookId) {
  const name = (s: string) => s.replace(/^(Add|Added) (a |an )?/i, '').split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace(/[^A-Za-z0-9]/g, '')
  if (slot === 'custom') return ['Assets/Scenes/Main.unity', 'Assets/Scripts/GameTweaks.cs']
  const c = changesFor(look)[slot]
  if (slot === 'companion') return [`Assets/Prefabs/${name(THEMES[look].companion)}.prefab`, 'Assets/Scripts/CompanionFollow.cs', 'Assets/Animations/Companion.controller']
  if (slot === 'atmosphere') return [`Assets/Lighting/${name(c.title)}.lighting`, 'Assets/Scripts/LightingCycle.cs', 'Assets/Materials/PickupGlow.mat']
  return [`Assets/Scenes/${name(c.title)}.unity`, 'Assets/Scripts/AreaStreaming.cs']
}

/** A short explanation of how the change works, for people learning as they go. */
export function howItWorks(slot: ChangeSlot | 'custom', look: LookId) {
  const t = THEMES[look]
  if (slot === 'companion') return `A companion is its own object with a small “follow” script. Every frame it moves a little toward a spot just behind you, then turns to face the nearest ${t.pickup}. That’s why it trails you smoothly instead of copying your moves.`
  if (slot === 'atmosphere') return `Lighting in Unity is set per scene. Spark added a script that slowly changes the light’s colour and brightness over time, and made the ${t.pickups} “emissive” so they glow on their own when it gets darker.`
  if (slot === 'area') return 'The new area is a second scene joined to the first. Unity loads it in the background as you get close, so the world feels bigger without a loading screen.'
  return 'Spark edited the scene and scripts to match your request, then rebuilt the web preview so you can try it straight away.'
}

/** Tweak chips for people who want control over details. */
export function tweaks(slot: ChangeSlot | 'custom', look: LookId) {
  const t = THEMES[look]
  if (slot === 'companion') return [`Adjust ${t.companion} speed`, `Change how often it points out ${t.pickups}`]
  if (slot === 'atmosphere') return ['Adjust how dark it gets', 'Change the light colour']
  if (slot === 'area') return ['Adjust the new area’s size', `Choose how many ${t.pickups} go there`]
  return ['Adjust the settings for this change']
}

// ───────────────────────── New projects and nudges ─────────────────────────

export interface Draft { title: string; tag: string; image: string; look: LookId; meta: string; prompt: string; why: string }

const SETTING_DRAFTS: Record<string, Draft> = {
  'Sci-fi': {
    title: 'Asteroid salvage run', tag: 'Because you like sci-fi', image: 'assets/next-orbital-area.jpg', look: 'orbital',
    meta: 'Stylized 3D · Sci-fi · Space station kit',
    prompt: 'A space salvage game where you pilot a little drone between drifting station modules, collecting parts and docking before your oxygen runs low.',
    why: 'You picked sci-fi as a setting you like, so this builds on the station look with a clear goal, sized for a first project.',
  },
  'Modern city': {
    title: 'Seaside courier rush', tag: 'Because you like city settings', image: 'assets/next-city-area.jpg', look: 'city',
    meta: 'Stylized 3D · Modern city · Tiny town pack',
    prompt: 'A delivery game in a sunny seaside town where you ride a scooter between districts, delivering parcels before the ferry leaves.',
    why: 'You picked modern cities as a setting you like, so this keeps the town look and adds a seaside district to explore.',
  },
  'Nature': {
    title: 'Firefly meadows', tag: 'Because you like nature', image: 'assets/next-clearing.jpg', look: 'woodland',
    meta: 'Stylized 3D · Nature',
    prompt: 'An exploration game across floating meadow islands, collecting rare fireflies and unlocking new clearings as you go.',
    why: 'You picked nature as a setting you like, so this grows the forest into a set of islands to explore.',
  },
}

/** A drafted prompt from their own long-standing game idea, if they told Spark Helper about one. */
export function dreamDraft(p: Profile): Draft | null {
  const idea = str(p.dream).trim()
  if (!idea) return null
  const look: LookId = /space|station|planet|rocket|robot|sci/i.test(idea) ? 'orbital' : /city|town|car|van|deliver|drive|race|heist/i.test(idea) ? 'city' : 'woodland'
  const image = look === 'orbital' ? 'assets/next-orbital-companion.jpg' : look === 'city' ? 'assets/next-city-companion.jpg' : 'assets/next-fox.jpg'
  const prompt = /^(a|an|the)\s/i.test(idea) ? idea.charAt(0).toUpperCase() + idea.slice(1) : `A game: ${idea}`
  // "a space racing game around asteroid rings" → "Space racing game"
  const head = idea.replace(/^(i want to make |make |build )?(a|an|the)\s+/i, '').split(/\s+(?:around|across|through|where|with|that|about|in|on|set|for)\s+/i)[0]
  const words = head.split(/\s+/).slice(0, 4).join(' ')
  return {
    title: words.charAt(0).toUpperCase() + words.slice(1), tag: 'Your idea', image, look,
    meta: 'From your profile · Stylized 3D',
    prompt: /[.!?]$/.test(prompt) ? prompt : `${prompt}.`,
    why: 'You told Spark Helper you’ve wanted to make this for a while. Here’s a first version to start from: send it as it is or add details.',
  }
}

const SCI_FI_GAMES = /halo|no man|starfield|mass effect|elite|star wars|destiny|outer wilds|subnautica/i
const CITY_GAMES = /gta|grand theft|cities|sim ?city|mario kart|forza|need for speed|crazy taxi/i

/** Setting-based ideas: from settings they picked, or inferred from favourite games. */
export function settingDrafts(p: Profile): Draft[] {
  const settings = Array.isArray(p.setting) ? [...p.setting] : []
  const games = str(p.games)
  const sci = games.match(SCI_FI_GAMES)
  if (sci && !settings.includes('Sci-fi')) settings.push('Sci-fi')
  if (CITY_GAMES.test(games) && !settings.includes('Modern city')) settings.push('Modern city')
  return settings.map((s) => SETTING_DRAFTS[s]).filter(Boolean).map((d) =>
    d.look === 'orbital' && sci && !(Array.isArray(p.setting) && p.setting.includes('Sci-fi'))
      ? { ...d, tag: `Inspired by ${sci[0].replace(/^\w/, (c) => c.toUpperCase())}`, why: `You said ${sci[0].replace(/^\w/, (c) => c.toUpperCase())} is a favourite, so this keeps that sci-fi feel with a clear goal, sized for a first project.` }
      : d)
}

/** Extra notes on a drafted idea from platform and camera answers. */
export function draftNotes(p: Profile) {
  const notes: string[] = []
  if (has(p.platform, 'Phone')) notes.push('Touch controls for phones')
  const cam = str(p.camera)
  if (cam && cam !== 'No preference') notes.push(`${cam} camera`)
  if (has(p.deadline, 'This week') || has(p.purpose, 'Game jam')) notes.push('Scoped to finish this week')
  return notes
}

/** The third "Suggested for today" card on the overview. */
export function overviewNudge(p: Profile): { title: string; desc: string; cta: string; action: 'publish' | 'change'; change?: string } {
  if (has(p.purpose, 'Portfolio') || has(p.purpose, 'Pitch')) {
    return { title: 'Make it portfolio-ready', desc: 'Add a title screen and credits so it’s ready to show.', cta: 'Start →', action: 'change', change: 'Add a title screen and credits' }
  }
  if (has(p.purpose, 'Game jam')) {
    return { title: 'Polish for the jam', desc: 'Add a start screen, a clear goal and a short how-to-play.', cta: 'Start →', action: 'change', change: 'Add a start screen and a how-to-play card' }
  }
  if (has(p.purpose, 'School or course')) {
    return { title: 'Show your progress', desc: 'Publish a link so your teacher or class can play each version.', cta: 'Publish →', action: 'publish' }
  }
  return { title: 'Share it with friends', desc: 'Publish a build friends can play from a link, or publish it to Google Playgrounds.', cta: 'Publish →', action: 'publish' }
}
