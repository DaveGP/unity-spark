// Content and types for the Unity Spark onboarding flow (matches Figma "Walkthrough v3").
import type { LookId } from './looks'

export const BUILD_STEPS = [
  'Creating a new Unity project',
  'Importing the asset pack',
  'Laying out the first level',
  'Adding a player controller',
  'Placing collectibles and goals',
  'Building a web preview',
]

/** Theme words used across the flow, so a space or city game never talks about fireflies. */
export const THEMES: Record<LookId, {
  pack: string; pickups: string; pickup: string; goal: string; setup: string; companion: string; player: string
}> = {
  woodland: { pack: 'the forest asset pack', pickups: 'fireflies', pickup: 'firefly', goal: 'before nightfall', setup: 'a forest look and a collect-the-fireflies loop', companion: 'fox', player: 'explorer' },
  orbital: { pack: 'the space station kit', pickups: 'power cells', pickup: 'power cell', goal: 'to power up the escape pod', setup: 'a space station look and a collect-the-power-cells loop', companion: 'robot dog', player: 'astronaut' },
  city: { pack: 'the tiny town pack', pickups: 'parcels', pickup: 'parcel', goal: 'before the clock runs out', setup: 'a tiny town look and a deliver-the-parcels loop', companion: 'drone', player: 'courier' },
}

export function buildStepsFor(look: LookId) {
  const t = THEMES[look]
  return BUILD_STEPS.map((s) => s.replace('the asset pack', t.pack).replace('collectibles', t.pickups))
}

export const MORE_IDEAS = [
  { title: 'Haunted lighthouse', prompt: 'A spooky lighthouse puzzle where you relight the lamps before the storm hits' },
  { title: 'Desert dune racer', prompt: 'A desert racing game where you drift a buggy over dunes and collect fuel' },
  { title: 'Robot garden', prompt: 'A cozy game where a little robot tends a rooftop garden and collects seeds' },
]

export const CLARIFY_OPTIONS = ['Explore and collect', 'Solve puzzles', 'Survive until morning', 'Build a base']
export const FEEDBACK_CHIPS = ['Love it!', 'Too easy', 'Feels a bit empty']

export const EXPERIENCE = ['Just starting out', 'A few projects', 'It’s my job']
export const PLAY_STYLE = ['Relaxed', 'Challenging', 'A bit of both']
export const GENRES = ['Open world', 'Cozy / life sim', 'Action', 'Puzzle', 'Racing', 'Strategy', 'Platformer']

export interface Answers {
  experience: string | null
  play: string | null
  games: string
  genres: string[]
}
export const EMPTY_ANSWERS: Answers = { experience: null, play: null, games: '', genres: [] }
export const answersComplete = (a: Answers) => !!a.experience && !!a.play && a.games.trim().length > 0 && a.genres.length > 0

export function answersSummary(a: Answers) {
  const genres = a.genres.map((g) => g.replace(' / life sim', '')).join(', ')
  return [a.experience, a.play, a.games.trim() && `Loves ${a.games.trim()}`, genres].filter(Boolean).join(' · ')
}

/** Every theme offers the same three kinds of next step, dressed for that world. */
export type ChangeId = 'companion' | 'atmosphere' | 'area' | 'custom'
export type ChangeSlot = Exclude<ChangeId, 'custom'>

/** Older saves used the forest names as ids. */
export const LEGACY_CHANGE_IDS: Record<string, ChangeSlot> = { fox: 'companion', dusk: 'atmosphere', clearing: 'area' }

export interface ChangeDef {
  id: ChangeId
  title: string
  desc: string
  reason: string
  image: string
  focus: string // CSS object-position for the thumbnail crop
  zoom: number
  doing: string // "Adding a fox companion"
  doneTitle: string // "Done — your fox is in."
  historyTitle: string // shown in Undo history
  about: string
  steps: string[]
  changes: string[]
  next: string[]
}

export const CHANGES_BY_LOOK: Record<LookId, Record<ChangeSlot, ChangeDef>> = {
  woodland: {
    companion: {
      id: 'companion', title: 'Add a fox companion', desc: 'A friendly fox follows you and points out nearby fireflies.', reason: 'Less lonely',
      image: 'assets/next-fox.jpg', focus: '43% 49%', zoom: 2.6,
      doing: 'Adding a fox companion', doneTitle: 'Done — your fox is in.', historyTitle: 'Added fox companion',
      about: 'Spark is adding a fox that follows the player and points toward nearby fireflies.',
      steps: ['Finding a fox in the asset pack', 'Adding follow behaviour', 'Pointing toward nearby fireflies', 'Animating idle and walk', 'Rebuilding the web preview'],
      changes: ['Fox companion that follows the player', 'Points toward the nearest firefly', 'Idle and walk animations'],
      next: ['Make the fox faster', 'Give the fox a name', 'Let the fox carry fireflies'],
    },
    atmosphere: {
      id: 'atmosphere', title: 'Gentle day–night cycle', desc: 'Fireflies glow brighter as dusk falls — no timer stress.', reason: 'Cozy, like Stardew',
      image: 'assets/next-dusk.jpg', focus: '50% 44%', zoom: 1.5,
      doing: 'Adding a gentle day–night cycle', doneTitle: 'Done — dusk now falls gently.', historyTitle: 'Added day–night cycle',
      about: 'Spark is adding a sky that drifts from day to dusk, with fireflies that glow brighter as night falls.',
      steps: ['Adding a sky cycle', 'Making fireflies glow at dusk', 'Tuning the lighting', 'Rebuilding the web preview'],
      changes: ['Sky drifts from day to dusk', 'Fireflies glow brighter as night falls', 'Warmer lighting in the cottage'],
      next: ['Make nights longer', 'Add stars to the sky', 'Add a cozy campfire'],
    },
    area: {
      id: 'area', title: 'Add a second clearing', desc: 'Grow the world with a new area to explore.', reason: 'Open world',
      image: 'assets/next-clearing.jpg', focus: '66% 50%', zoom: 1.6,
      doing: 'Adding a second clearing', doneTitle: 'Done — a new clearing is open.', historyTitle: 'Added a second clearing',
      about: 'Spark is growing the world with a second clearing, joined to the first by a little bridge.',
      steps: ['Generating a new clearing', 'Building a bridge between areas', 'Scattering fireflies and flowers', 'Rebuilding the web preview'],
      changes: ['A second clearing to explore', 'A wooden bridge connecting the two', 'More fireflies to find'],
      next: ['Add a hidden path', 'Put a secret in the clearing', 'Add a third area'],
    },
  },
  orbital: {
    companion: {
      id: 'companion', title: 'Add a robot dog companion', desc: 'A loyal robot dog trots beside you and sniffs out nearby power cells.', reason: 'Less lonely',
      image: 'assets/next-orbital-companion.jpg', focus: '58% 54%', zoom: 2.4,
      doing: 'Adding a robot dog companion', doneTitle: 'Done — your robot dog is online.', historyTitle: 'Added robot dog companion',
      about: 'Spark is adding a robot dog that follows the astronaut and scans for nearby power cells.',
      steps: ['Finding a robot dog in the station kit', 'Adding follow behaviour', 'Scanning for nearby power cells', 'Animating trot and idle', 'Rebuilding the web preview'],
      changes: ['Robot dog that follows the astronaut', 'Scans toward the nearest power cell', 'Trot and idle animations'],
      next: ['Give the robot dog a jetpack', 'Give the robot dog a name', 'Let it carry power cells'],
    },
    atmosphere: {
      id: 'atmosphere', title: 'Emergency lighting', desc: 'Lights dim to a red glow and power cells shine brighter in the dark.', reason: 'More atmosphere',
      image: 'assets/next-orbital-atmosphere.jpg', focus: '50% 45%', zoom: 1.4,
      doing: 'Adding emergency lighting', doneTitle: 'Done — the station is running on emergency power.', historyTitle: 'Added emergency lighting',
      about: 'Spark is dimming the station to emergency lighting, so the power cells glow brighter in the dark.',
      steps: ['Switching to emergency lighting', 'Making power cells glow', 'Adding warning-light pulses', 'Rebuilding the web preview'],
      changes: ['Station dims to a red emergency glow', 'Power cells shine brighter in the dark', 'Gentle warning-light pulses'],
      next: ['Add a countdown alarm', 'Add a view of the stars', 'Make the lights flicker'],
    },
    area: {
      id: 'area', title: 'Add a docking bay', desc: 'Open a new module to explore, linked by an airlock corridor.', reason: 'Open world',
      image: 'assets/next-orbital-area.jpg', focus: '60% 50%', zoom: 1.15,
      doing: 'Adding a docking bay', doneTitle: 'Done — the docking bay is open.', historyTitle: 'Added a docking bay',
      about: 'Spark is adding a docking bay module, joined to the station by an airlock corridor.',
      steps: ['Building a docking bay module', 'Connecting an airlock corridor', 'Scattering power cells and crates', 'Rebuilding the web preview'],
      changes: ['A docking bay module to explore', 'An airlock corridor connecting the two', 'More power cells to find'],
      next: ['Park an escape shuttle there', 'Add a zero-gravity room', 'Add a third module'],
    },
  },
  city: {
    companion: {
      id: 'companion', title: 'Add a delivery drone', desc: 'A little drone buzzes alongside and points out the next parcel.', reason: 'Less lonely',
      image: 'assets/next-city-companion.jpg', focus: '40% 55%', zoom: 2.2,
      doing: 'Adding a delivery drone', doneTitle: 'Done — your drone is airborne.', historyTitle: 'Added delivery drone',
      about: 'Spark is adding a delivery drone that hovers beside the courier and points toward the next parcel.',
      steps: ['Finding a drone in the town pack', 'Adding follow behaviour', 'Pointing toward the next parcel', 'Animating rotors and hover', 'Rebuilding the web preview'],
      changes: ['Delivery drone that follows the courier', 'Points toward the next parcel', 'Rotor and hover animations'],
      next: ['Make the drone faster', 'Give the drone a name', 'Let the drone carry parcels'],
    },
    atmosphere: {
      id: 'atmosphere', title: 'Evening rush hour', desc: 'Street lights flicker on and the town glows warm as the sun sets.', reason: 'Cozy evening feel',
      image: 'assets/next-city-atmosphere.jpg', focus: '50% 45%', zoom: 1.3,
      doing: 'Adding evening rush hour', doneTitle: 'Done — the sun is setting over town.', historyTitle: 'Added evening rush hour',
      about: 'Spark is moving the town into a warm evening, with street lights coming on and parcels easier to spot.',
      steps: ['Adding a sunset sky', 'Switching on the street lights', 'Lighting up the windows', 'Rebuilding the web preview'],
      changes: ['Warm sunset over the town', 'Street lights and glowing windows', 'Parcels glow so they’re easy to spot'],
      next: ['Add some traffic', 'Add a night market', 'Add fireworks over the bay'],
    },
    area: {
      id: 'area', title: 'Add a seaside district', desc: 'Unlock a boardwalk neighbourhood across a little bridge.', reason: 'Open world',
      image: 'assets/next-city-area.jpg', focus: '65% 55%', zoom: 1.15,
      doing: 'Adding a seaside district', doneTitle: 'Done — the seaside district is open.', historyTitle: 'Added a seaside district',
      about: 'Spark is adding a seaside boardwalk district, joined to the town by a little bridge.',
      steps: ['Building a seaside district', 'Adding a bridge between districts', 'Scattering parcels along the boardwalk', 'Rebuilding the web preview'],
      changes: ['A seaside district to explore', 'A bridge connecting the two', 'More parcels to deliver'],
      next: ['Add a ferry ride', 'Add an ice-cream stand', 'Add a third district'],
    },
  },
}

export const changesFor = (look: LookId) => CHANGES_BY_LOOK[look]

/** Find the change a chip or typed message refers to, by title. */
export function changeByTitle(look: LookId, text: string): ChangeSlot | undefined {
  const all = changesFor(look)
  return (Object.keys(all) as ChangeSlot[]).find((k) => all[k].title.toLowerCase() === text.trim().toLowerCase())
}

export const NEXT_ORDER: ChangeSlot[] = ['companion', 'atmosphere', 'area']

/** A change that has been applied to a project (what Undo walks back through). */
export interface AppliedChange {
  id: ChangeId
  title: string
  version: number
  at: number
}

export type Msg =
  | { kind: 'user'; text: string }
  | { kind: 'spark'; title?: string; text: string; chips?: string[]; starting?: boolean }
  | { kind: 'clarify' }
  | { kind: 'build' }
  | { kind: 'helper' }
  | { kind: 'ask'; qid: string; skipped?: boolean; off?: boolean }
  | { kind: 'answersSaved' }
  | { kind: 'buildDone' }
  | { kind: 'ready' }
  | { kind: 'feel' }
  | { kind: 'next'; basis: string; title: string; order: ChangeSlot[]; reasons?: Partial<Record<ChangeSlot, string>> }
  | { kind: 'working'; change: ChangeDef; from: number }
  | { kind: 'done'; change: ChangeDef }

export type Phase = 'clarify' | 'building' | 'ready' | 'working'

export interface Project {
  id: string
  title: string
  prompt: string
  look: LookId
  messages: Msg[]
  phase: Phase
  buildStep: number
  workStep: number
  history: AppliedChange[]
  /** Changes stepped back over with Undo, newest first, so they can be redone. */
  future: AppliedChange[]
  playedOnce: boolean
  thinking: boolean
  publishedAt: number | null
  editedAt: number
  createdAt: number
}

export const STARTER_IDEAS = [
  { look: 'woodland' as LookId, title: 'Cozy forest collector', prompt: 'A cozy forest game where you collect fireflies before nightfall', blurb: 'Collect fireflies before nightfall in a storybook forest.' },
  { look: 'orbital' as LookId, title: 'Space station escape', prompt: 'A space station puzzle where you reroute power to escape', blurb: 'Reroute power to escape a drifting station.' },
  { look: 'city' as LookId, title: 'Tiny city deliveries', prompt: 'A tiny city delivery game where you zip around on a scooter', blurb: 'Zip around town on a scooter and beat the clock.' },
]

export function titleFor(prompt: string, clarification?: string) {
  const p = prompt.toLowerCase()
  if (/forest|firefl|woods/.test(p) && (/collect|firefl/.test(p) || /collect/i.test(clarification ?? ''))) return 'Forest firefly collector'
  const idea = STARTER_IDEAS.find((i) => i.prompt === prompt)
  if (idea) return idea.title
  if (/heist/.test(p)) return 'Palm City heist'
  const cleaned = prompt.replace(/^(i want to|i'd like to|let's|make|build|create)\s+/i, '').replace(/^(me\s+)?(a|an|the)\s+/i, '')
  const head = cleaned.split(/\s+(?:where|with|that|in which|about|set in|for)\s+/i)[0].replace(/[.!?]+$/, '')
  const words = head.split(/\s+/).slice(0, 5).join(' ')
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Untitled game'
}

export const isShortPrompt = (prompt: string) => prompt.trim().split(/\s+/).length <= 3

/** Draft the next project's opening prompt from what the player told Spark Helper. */
export function draftFromAnswers(a: Answers) {
  const games = a.games.toLowerCase()
  if (/gta|grand theft|heist/.test(games)) {
    return {
      title: 'Palm City heist', tag: 'Inspired by GTA 6', image: 'assets/palm-city.jpg', look: 'city' as LookId,
      meta: 'Synty POLYGON – Palm City · Low-poly 3D · Open world',
      prompt: 'A heist game set in a sunny coastal city, built with Synty’s POLYGON Palm City pack. Plan the job, grab the loot and escape in a getaway car before the police close in.',
      why: 'You said GTA 6 is a favourite and you like open worlds, so this keeps that sunny city, cars-and-chases feel, sized for a first project.',
    }
  }
  if (/stardew|farm|animal crossing/.test(games)) {
    return {
      title: 'Cozy valley farm', tag: 'Inspired by Stardew Valley', image: 'assets/next-dusk.jpg', look: 'woodland' as LookId,
      meta: 'Stylized 3D · Cozy / life sim',
      prompt: 'A cozy farming game in a small valley. Plant crops, befriend the villagers and decorate a little cottage through the seasons.',
      why: 'You love Stardew Valley and relaxed play, so this keeps the cozy routine of tending a farm, sized for a first project.',
    }
  }
  return {
    title: 'Open-world firefly hunt', tag: 'Based on your answers', image: 'assets/next-clearing.jpg', look: 'woodland' as LookId,
    meta: 'Stylized 3D · Open world',
    prompt: 'An open-world exploration game across floating forest islands, collecting rare fireflies and unlocking new areas as you go.',
    why: 'This builds on what you enjoyed in your first project and opens it up into a bigger world to explore.',
  }
}

// ───────────────────────── Spark Helper profile questions ─────────────────────────
// Asked one at a time whenever the user is waiting on a build or a change. The first four
// (ONB-110) come first; the rest build up the user's profile over later builds and changes.

export type QuestionKind = 'single' | 'multi' | 'text'

export interface ProfileQuestion {
  id: string
  group: ProfileGroup
  text: string
  kind: QuestionKind
  options?: string[]
  placeholder?: string
}

export type ProfileGroup = 'Getting started' | 'Goals' | 'Experience' | 'Taste in games' | 'Look and style' | 'Practical' | 'Feedback style'
export const PROFILE_GROUPS: ProfileGroup[] = ['Getting started', 'Goals', 'Experience', 'Taste in games', 'Look and style', 'Practical', 'Feedback style']

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  { id: 'experience', group: 'Getting started', kind: 'single', text: 'How much time have you spent making games?', options: EXPERIENCE },
  { id: 'play', group: 'Getting started', kind: 'single', text: 'How do you like to play games?', options: PLAY_STYLE },
  { id: 'games', group: 'Getting started', kind: 'text', text: 'What are your favourite games?', placeholder: 'e.g. GTA 6, Stardew Valley' },
  { id: 'genres', group: 'Getting started', kind: 'multi', text: 'Any genres you particularly like?', options: GENRES },

  { id: 'goal', group: 'Goals', kind: 'single', text: 'What would you like to get out of Spark?', options: ['Have fun making something', 'Learn how games are made', 'Prototype an idea', 'Make something to share', 'Build toward a real release'] },
  { id: 'audience', group: 'Goals', kind: 'multi', text: 'Who’s this game for?', options: ['Just me', 'Friends and family', 'My kids', 'A class or club', 'Players I don’t know yet'] },
  { id: 'platform', group: 'Goals', kind: 'multi', text: 'Where would you like people to play it?', options: ['Browser', 'Phone', 'PC', 'Console', 'Not sure yet'] },
  { id: 'dream', group: 'Goals', kind: 'text', text: 'Is there a game idea you’ve wanted to make for a while?', placeholder: 'e.g. a racing game where you drive a delivery van' },
  { id: 'success', group: 'Goals', kind: 'single', text: 'What would make this project feel like a success?', options: ['I can play it start to finish', 'Friends enjoy it', 'I learned something', 'It looks great'] },

  { id: 'tools', group: 'Experience', kind: 'multi', text: 'Have you used any game or creative tools before?', options: ['Unity', 'Roblox Studio', 'Minecraft', 'Scratch', 'Blender', 'None yet'] },
  { id: 'code', group: 'Experience', kind: 'single', text: 'Have you written code before?', options: ['Never', 'A little', 'Comfortable', 'It’s my job'] },
  { id: 'detail', group: 'Experience', kind: 'single', text: 'When Spark makes a change, how much do you want to see?', options: ['Just the result', 'A short summary', 'Show me what changed in Unity'] },
  { id: 'learn', group: 'Experience', kind: 'single', text: 'Would you like to learn as you go?', options: ['Yes, teach me', 'Only if I ask', 'No, just build it'] },
  { id: 'control', group: 'Experience', kind: 'single', text: 'How hands-on do you want to be?', options: ['Spark decides, I steer', 'We decide together', 'I want control over details'] },

  { id: 'enjoy', group: 'Taste in games', kind: 'multi', text: 'What do you enjoy most when you play?', options: ['Exploring', 'Story', 'Competing', 'Building and creating', 'Collecting', 'Solving puzzles', 'Playing with friends'] },
  { id: 'quit', group: 'Taste in games', kind: 'multi', text: 'What usually makes you stop playing a game?', options: ['Too hard', 'Too slow', 'Repetitive', 'Too complicated', 'Nothing to do with friends'] },
  { id: 'social', group: 'Taste in games', kind: 'single', text: 'Single-player or with others?', options: ['Solo', 'Co-op', 'Competitive', 'Doesn’t matter'] },
  { id: 'session', group: 'Taste in games', kind: 'single', text: 'How long do you usually play in one go?', options: ['A few minutes', 'Around half an hour', 'Hours'] },
  { id: 'camera', group: 'Taste in games', kind: 'single', text: 'Which camera do you prefer?', options: ['Top-down', 'Side-on (2D)', 'Third person', 'First person', 'No preference'] },
  { id: 'feel', group: 'Taste in games', kind: 'text', text: 'Is there a game you love the feel of, even if it’s a different genre?', placeholder: 'e.g. the way Mario Kart drifts' },

  { id: 'art', group: 'Look and style', kind: 'multi', text: 'Which art style appeals most?', options: ['Cozy / stylized', 'Low-poly', 'Pixel art', 'Realistic', 'Cartoon', 'Dark / moody'] },
  { id: 'setting', group: 'Look and style', kind: 'multi', text: 'What kind of setting do you like?', options: ['Fantasy', 'Sci-fi', 'Modern city', 'Nature', 'Horror', 'Historical'] },
  { id: 'mood', group: 'Look and style', kind: 'single', text: 'What mood should your games have?', options: ['Calm', 'Funny', 'Tense', 'Spooky', 'Epic'] },
  { id: 'ownArt', group: 'Look and style', kind: 'single', text: 'Do you have your own art, music or characters you’d like to use?', options: ['Yes, I’ll upload them', 'Maybe later', 'No'] },

  { id: 'time', group: 'Practical', kind: 'single', text: 'How much time do you expect to spend on Spark?', options: ['A quick try', 'An hour or two a week', 'Lots, it’s a hobby', 'It’s for work or school'] },
  { id: 'purpose', group: 'Practical', kind: 'single', text: 'Are you making this for something specific?', options: ['Game jam', 'School or course', 'Portfolio', 'Pitch', 'Just because'] },
  { id: 'deadline', group: 'Practical', kind: 'single', text: 'Do you have a deadline?', options: ['No', 'This week', 'This month', 'Later this year'] },
  { id: 'team', group: 'Practical', kind: 'single', text: 'Are you working alone or with others?', options: ['Solo', 'With a friend', 'Team or class'] },

  { id: 'help', group: 'Feedback style', kind: 'single', text: 'When something isn’t working, what helps most?', options: ['Suggest a fix', 'Give me options', 'Explain why'] },
  { id: 'tone', group: 'Feedback style', kind: 'single', text: 'How would you like Spark to talk to you?', options: ['Short and to the point', 'Friendly and chatty', 'Detailed'] },
]

export const QUESTION_BY_ID = Object.fromEntries(PROFILE_QUESTIONS.map((q) => [q.id, q])) as Record<string, ProfileQuestion>

export type ProfileValue = string | string[]
export type Profile = Record<string, ProfileValue>

export const formatAnswer = (v: ProfileValue | undefined) => (Array.isArray(v) ? v.join(', ') : v ?? '')
export const isAnswered = (v: ProfileValue | undefined) => (Array.isArray(v) ? v.length > 0 : !!v?.trim())
