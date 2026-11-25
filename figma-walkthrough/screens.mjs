// One function per step of the suggested onboarding flow (see the FigJam flowchart).
import {
  W, H, C, T, P, R, G, tw, scene, logo, eyebrow, btn, chip, chips, pill, tag, progress, spinner,
  sidebar, topbar, userMsg, sparkHeader, composer, steps, BUILD_STEPS, previewPanel, controlBar, gameStage, frame, PX,
  img, hotspot,
} from './lib.mjs'

const PROJECT = 'Forest firefly collector'

// Full-width chat column and split-view chat column.
const FX = 476, FW = 720, FR = FX + FW
const SX = 252, SW = 340, SR = SX + SW

// ───────────────────────── Unity ecosystem screens ─────────────────────────
// unity.com/spark hero, captured from the live page, with the waitlist CTA replaced.
export function sLanding() {
  let s = R(0, 0, W, H, { fill: '#000', id: 'Background' })
  const scale = W / 1496
  s += img('spark-landing.jpg', 0, 0, W, 812 * scale, { layer: 'unity.com/spark – page capture' })
  s += R(240, 740, 40, 44, { fill: '#000', id: 'Cover – cursor' })
  // Replace “Join the waitlist” with the new CTA.
  s += R(18, 478, 160, 52, { fill: '#000', id: 'Cover – old CTA' })
  const label = 'Sign up and try now'
  const bw = Math.round(tw(label, 13.5, 600) + 64)
  s += G('Button / Sign up and try now', R(21, 483, bw, 41, { rx: 20.5, fill: '#3b5bdb', id: 'Container' }), T(21 + bw / 2, 508, label, { size: 13.5, weight: 600, fill: '#fff', anchor: 'middle', id: 'Label' }))
  s += hotspot(1189, 6, 102, 30, 'Get started')
  return frame('Unity Spark – Landing page (unity.com/spark)', s)
}

const LOGIN_BG = '#191919', L = 556 // column left edge (328 wide, centred)

function unityAuthChrome() {
  const links = [['Legal', 296], ['Privacy Policy', 345], ['Cookies', 439], ['Cookie Settings', 502], ['Do Not Sell or Share My Personal Information', 607]]
  return R(0, 0, W, H, { fill: LOGIN_BG, id: 'Background' })
    + img('unity-logo.png', 552, 152, 126, 48, { layer: 'Unity logo', fit: 'none' })
    + G('Footer', ...links.map(([t, x]) => T(x, 847, t, { size: 12, fill: '#b4b4b4' })), img('unity-lang.png', 1004, 827, 141, 33, { layer: 'Language – English', fit: 'none' }))
}

export function sSignIn() {
  let s = unityAuthChrome()
  s += T(L, 268, 'Sign in', { size: 32, weight: 600, fill: '#eeeeee', id: 'Heading' })
  s += T(L, 296, 'to continue to Unity', { size: 14, fill: '#b4b4b4', id: 'Subheading' })
  s += G('Field – Email', R(L, 316, 328, 42, { rx: 6, fill: '#262626', stroke: '#1a73d0', sw: 2, id: 'Input' }), T(L + 10, 343, 'sam@studio.com', { size: 16, fill: '#eeeeee', id: 'Value' }))
  s += G('Button / Continue', R(L, 376, 328, 40, { rx: 6, fill: '#0a6ec8', id: 'Container' }), T(720, 401, 'Continue', { size: 14, weight: 600, fill: '#fff', anchor: 'middle', id: 'Label' }))
  s += G('Create account', T(L, 447, 'New to Unity?', { size: 14, fill: '#eeeeee' }), T(L + 96, 447, 'Create an account', { size: 14, fill: '#6eb8ff', id: 'Link' }))
  s += G('Divider – or', R(L, 475, 150, 1, { fill: '#3a3a3a' }), T(720, 479, 'or', { size: 12, fill: '#b4b4b4', anchor: 'middle' }), R(L + 178, 475, 150, 1, { fill: '#3a3a3a' }))
  s += img('unity-social.png', 555.5, 499, 329, 198, { layer: 'Social sign-in buttons', fit: 'none' })
  ;['Continue with Google', 'Continue with Apple', 'Continue with Facebook', 'Continue with SSO'].forEach((t, i) => { s += hotspot(L, 500 + i * 52, 328, 40, t) })
  return frame('Unity ID – Sign in', s)
}

export function sPassword() {
  let s = unityAuthChrome()
  s += T(L, 268, 'Enter password', { size: 32, weight: 600, fill: '#eeeeee', id: 'Heading' })
  s += G('Account', `<path d="M ${L + 18} 292 H ${L + 2} M ${L + 8} 286 L ${L + 2} 292 L ${L + 8} 298" fill="none" stroke="#b4b4b4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`, T(L + 28, 297, 'sam@studio.com', { size: 15, fill: '#cfcfcf', id: 'Email' }))
  s += G('Label – Password', T(L, 338, 'Password', { size: 14, fill: '#eeeeee' }), T(L + 66, 338, '*', { size: 14, fill: '#e5484d' }))
  const eye = `<g id="Icon – Hide password" fill="none" stroke="#9a9a9a" stroke-width="1.6" stroke-linecap="round"><path d="M ${L + 296} 370 q 12 -12 24 0 q -12 12 -24 0 z"/><circle cx="${L + 308}" cy="370" r="3.5"/><path d="M ${L + 297} 360 L ${L + 319} 380"/></g>`
  s += G('Field – Password', R(L, 348, 328, 44, { rx: 6, fill: '#262626', stroke: '#1a73d0', sw: 2, id: 'Input' }), T(L + 12, 376, '••••••••••', { size: 16, fill: '#eeeeee', id: 'Value' }), eye)
  s += G('Button / Sign in', R(L, 408, 328, 40, { rx: 6, fill: '#0a6ec8', id: 'Container' }), T(720, 433, 'Sign in', { size: 14, weight: 600, fill: '#fff', anchor: 'middle', id: 'Label' }))
  s += T(L, 478, 'Reset your password', { size: 14, fill: '#6eb8ff', id: 'Link – Reset your password' })
  s += T(L, 506, 'Sign into a different account', { size: 14, fill: '#6eb8ff', id: 'Link – Sign into a different account' })
  return frame('Unity ID – Enter password', s)
}

// ───────────────────────── Sign-up screens ─────────────────────────
function showcase() {
  const x = 480
  let s = R(x, 0, W - x, H, { fill: C.bg, id: 'Background' })
  s += `<defs><radialGradient id="glow" cx=".7" cy=".1" r=".7"><stop stop-color="#c4b5fd" stop-opacity=".09"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0"/></radialGradient></defs>`
  s += R(x, 0, W - x, H, { fill: 'url(#glow)', id: 'Glow' })
  const fx = 560, fy = 150, fw = 800, fh = 470
  s += G('Look explorer card',
    R(fx, fy, fw, fh, { rx: 14, fill: C.surface, stroke: C.line, id: 'Card' }),
    eyebrow(fx + 16, fy + 30, 'Look explorer'),
    pill(fx + fw - 16 - 134, fy + 14, 'Enchanted woodland').svg,
    scene('woodland', fx + 14, fy + 48, fw - 28, fh - 62, { rx: 10 }))
  const ub = userMsg(1390, 208, 'Make me a cozy forest game where you collect fireflies.', 300)
  s += ub.svg
  s += G('Message / Spark', R(520, 520, 330, 78, { rx: 12, fill: C.card, stroke: C.line2, id: 'Bubble' }), sparkHeader(536, 542), P(536, 550, 'Here are a few ways it could go. Pick one and I’ll build your first playable.', 300, { size: 13, lh: 19 }).svg)
  const tW = 256
  ;['woodland', 'orbital', 'city'].forEach((id, i) => { s += scene(id, fx + i * (tW + 16), 650, tW, 150, { rx: 10 }) })
  return G('Showcase', s)
}

function formShell(stepIndex, content) {
  let s = R(0, 0, 480, H, { fill: C.sidebar, id: 'Background' }) + R(479, 0, 1, H, { fill: C.line, id: 'Divider' })
  s += logo(48, 72, 22)
  s += G('Progress', R(48, 104, 28, 3, { rx: 1.5, fill: stepIndex === 0 ? C.accent : C.accent2, opacity: stepIndex === 0 ? 1 : 0.5 }), R(82, 104, 28, 3, { rx: 1.5, fill: stepIndex === 1 ? C.accent : C.line2 }))
  return G('Form panel', s, content)
}

function field(y, label, placeholder, value) {
  return G(`Field – ${label}`, T(48, y, label, { size: 12, weight: 500, fill: C.text2, id: 'Label' }), R(48, y + 10, 384, 42, { rx: 7, fill: C.card, stroke: C.line2, id: 'Input' }), T(62, y + 36, value || placeholder, { size: 13.5, fill: value ? C.text : C.faint, id: value ? 'Value' : 'Placeholder' }))
}

export function s01() {
  let f = eyebrow(48, 250, 'Create your account')
  f += P(48, 262, 'Turn an idea into a playable game.', 384, { size: 27, weight: 600, lh: 34, id: 'Heading' }).svg
  f += P(48, 342, 'Describe it in plain words. Spark builds the first version in Unity with you.', 384, { size: 14, fill: C.muted, lh: 21, id: 'Intro' }).svg
  f += field(420, 'Name', 'Alex Rivera', 'Sam Rivera') + field(494, 'Email', 'you@studio.com', 'sam@studio.com') + field(568, 'Password', 'At least 8 characters', '••••••••••')
  f += btn(48, 646, 'Continue', { w: 384, h: 44, size: 14 }).svg
  f += G('Divider – or', R(48, 716, 172, 1, { fill: C.line }), T(240, 720, 'or', { size: 11, fill: C.faint, anchor: 'middle' }), R(260, 716, 172, 1, { fill: C.line }))
  f += btn(48, 740, 'Continue with Unity ID', { variant: 'ghost', w: 384, h: 44, size: 14 }).svg
  f += P(48, 800, 'By continuing you agree to the Unity Spark preview terms.', 384, { size: 11, fill: C.faint, lh: 16 }).svg
  return frame('01 · Sign up – Create account', formShell(0, f) + showcase())
}

export function s02() {
  let f = eyebrow(48, 250, 'A little about you')
  f += T(48, 290, 'Nice to meet you, Sam.', { size: 27, weight: 600, id: 'Heading' })
  f += P(48, 306, 'This helps Spark pitch its suggestions at the right level. You can change it any time.', 384, { size: 14, fill: C.muted, lh: 21 }).svg
  f += T(48, 390, 'What brings you to Spark?', { size: 12, weight: 500, fill: C.text2 })
  f += chips(48, 404, ['Explore an idea', ['Prototype a game', { on: true }], 'Learn Unity', 'Reskin an existing game'], 384).svg
  f += T(48, 500, 'How much time have you spent making games?', { size: 12, weight: 500, fill: C.text2 })
  ;['New to making games', 'Some experience', 'Professional developer'].forEach((o, i) => {
    const y = 514 + i * 50, on = i === 0
    f += G(`Option${on ? ' / Selected' : ''} – ${o}`, R(48, y, 384, 42, { rx: 7, fill: on ? C.accent : C.card, fo: on ? 0.06 : undefined, stroke: on ? C.accent2 : C.line2, id: 'Container' }),
      `<circle cx="70" cy="${y + 21}" r="7" fill="none" stroke="${on ? C.accent : C.faint}" stroke-width="1.5"/>` + (on ? `<circle cx="70" cy="${y + 21}" r="3.5" fill="${C.accent}"/>` : ''),
      T(88, y + 26, o, { size: 13, fill: on ? C.text : C.text2, id: 'Label' }))
  })
  f += btn(48, 690, 'Start creating', { w: 384, h: 44, size: 14 }).svg
  f += btn(48, 744, '← Back', { variant: 'text', h: 30, size: 13, w: 60 }).svg
  return frame('02 · Sign up – About you', formShell(1, f) + showcase())
}

// ───────────────────────── Full-width chat screens ─────────────────────────
function appShell(id, { recent, active, crumbs, status, publish }, body) {
  return frame(id, sidebar({ recent, active }) + topbar({ crumbs, status, publish }) + G('Main', body))
}

const IDEAS = [
  ['woodland', 'Cozy forest collector', 'Collect fireflies before nightfall in a storybook forest.'],
  ['orbital', 'Space station escape', 'Reroute power to escape a drifting station.'],
  ['city', 'Tiny city deliveries', 'Zip around town on a scooter and beat the clock.'],
]

function promptHome(value) {
  let b = eyebrow(FX, 130, 'Welcome to Unity Spark')
  b += T(FX, 172, 'Nice to meet you, Sam.', { size: 32, weight: 600, id: 'Heading' })
  b += P(FX, 186, 'Turn an idea into a playable game. Describe it in plain words and Spark builds the first version in Unity with you — so, what do you want to make?', 660, { size: 14, fill: C.muted, lh: 21, id: 'Intro' }).svg
  // Prompt box with ideas inside (ONB-102)
  const y = 270, h = 150
  let box = R(FX, y, FW, h, { rx: 12, fill: C.card, stroke: value ? '#43444f' : C.line2, id: 'Container' })
  if (value) {
    box += T(FX + 18, y + 32, value, { size: 15, id: 'Input value' }) + R(FX + 18 + tw(value, 15) + 2, y + 17, 1.5, 20, { fill: C.accent, id: 'Caret' })
  } else {
    box += T(FX + 18, y + 32, 'Try “a cozy forest game where you collect fireflies before nightfall”', { size: 15, fill: C.faint, id: 'Placeholder – rotating idea' })
  }
  box += T(FX + 18, y + 92, 'Ideas to get you started', { size: 11, fill: C.faint, id: 'Ideas label' })
  box += chips(FX + 18, y + 104, [['✦ Cozy forest collector', {}], ['✦ Space station escape', {}], ['✦ Tiny city deliveries', {}], ['↻ More ideas', {}]], 632).svg
  box += btn(FX + FW - 14 - 64, y + h - 14 - 34, 'Send', { w: 64, disabled: !value }).svg
  b += G(`Prompt box${value ? '' : ' – ONB-102 ideas'}`, box)
  b += T(FX, y + h + 22, 'Unity Spark · Prototype', { size: 10.5, fill: C.faint, id: 'Footnote' })
  // Idea cards
  b += T(FX, 498, 'Or start from an idea', { size: 13, weight: 600, fill: C.text2 })
  const cw = (FW - 32) / 3
  IDEAS.forEach(([id, title, desc], i) => {
    const x = FX + i * (cw + 16), y2 = 516
    b += G(`Idea card – ${title}`, R(x, y2, cw, 244, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }), scene(id, x + 1, y2 + 1, cw - 2, 118, { rx: 9 }), T(x + 14, y2 + 144, title, { size: 14, weight: 600, id: 'Title' }), P(x + 14, y2 + 152, desc, cw - 28, { size: 12, fill: C.muted, lh: 17 }).svg, btn(x + 14, y2 + 202, 'Use this idea', { variant: 'ghost', h: 28, size: 11.5 }).svg)
  })
  return b
}

export function s03() {
  return appShell('03 · ONB-102 – Prompt ideas in the empty prompt box', { crumbs: ['New conversation'] }, promptHome(''))
}

export function s04() {
  return appShell('04 · User types first prompt (very short)', { crumbs: ['New conversation'] }, promptHome('forest game'))
}

function chatIntroUser(y, text) { return userMsg(FR, y, text) }

export function s05() {
  let b = ''
  const u = chatIntroUser(100, 'forest game')
  b += u.svg
  let y = 100 + u.h + 30
  b += sparkHeader(FX, y)
  b += P(FX, y + 10, 'Nice — forest games can go lots of ways. One quick question so your first version feels right:', 600, { size: 14, fill: C.text2, lh: 21 }).svg
  b += T(FX, y + 88, 'What should the player mostly do?', { size: 19, weight: 600, id: 'Question' })
  b += chips(FX, y + 106, ['Explore and collect', 'Solve puzzles', 'Survive until morning', 'Build a base'], FW).svg
  b += btn(FX, y + 150, 'Skip — just surprise me', { variant: 'text', h: 28, size: 12, w: 160 }).svg
  b = G('Message / Spark – ONB-111 clarifying question', b)
  b += P(FX, 730, 'Spark asks at most one question, and only when the first prompt is very short.', FW, { size: 11, fill: C.faint }).svg
  b += composer(FX, 790, FW, { placeholder: 'Answer, or describe it in your own words…' })
  return appShell('05 · ONB-111 – Agent asks one clarifying question', { recent: 'Forest game', active: 'recent', crumbs: ['Forest game'], status: 'Concept draft' }, b)
}

export function s06() {
  let b = ''
  const u = chatIntroUser(100, 'forest game')
  b += u.svg
  let y = 100 + u.h + 30
  b += G('Message / Spark', sparkHeader(FX, y), P(FX, y + 10, 'Nice — forest games can go lots of ways. One quick question so your first version feels right:', 600, { size: 14, fill: C.text2, lh: 21 }).svg, T(FX, y + 88, 'What should the player mostly do?', { size: 19, weight: 600 }))
  b += chips(FX, y + 106, [['Explore and collect', { on: true }], 'Solve puzzles', 'Survive until morning', 'Build a base'], FW).svg
  y += 170
  const a = chatIntroUser(y, 'Explore and collect — gather fireflies before nightfall.')
  b += a.svg
  y += a.h + 30
  b += G('Message / Spark – Starting build', sparkHeader(FX, y), P(FX, y + 10, 'Perfect. I’m building your first playable now — I’ll show you progress as I go.', 600, { size: 14, fill: C.text2, lh: 21 }).svg, G('Starting', spinner(FX + 9, y + 60, 8), T(FX + 26, y + 64.5, 'Starting build…', { size: 12.5, fill: C.text2 })))
  b += composer(FX, 790, FW, { placeholder: 'Describe a change…' })
  return appShell('06 · User answers the question', { recent: 'Forest game', active: 'recent', crumbs: ['Forest game'], status: 'Concept draft' }, b)
}

// ───────────────────────── Split-view screens ─────────────────────────
function splitChat(content, composerPlaceholder = 'Describe a change…') {
  return G('Chat', R(232, 56, PX - 232, H - 56, { fill: C.bg, id: 'Background' }), content, composer(SX, 806, SW, { placeholder: composerPlaceholder, foot: 'Unity Spark · Changes apply to your project' }))
}

/** Undo is always in the preview header; it's greyed out until there's a change to undo. */
function undoButton(rightX, enabled) {
  const u = btn(0, 0, '↶ Undo', { variant: 'ghost', h: 28, size: 12 })
  return { svg: btn(rightX - u.w, 80, '↶ Undo', { variant: 'ghost', h: 28, size: 12, disabled: !enabled, id: enabled ? 'Button / Undo (opens history)' : 'Button / Undo – disabled' }).svg, w: u.w }
}

function buildStatus(x, y, w, h, label, step, total) {
  return G('Build status',
    R(x + w / 2 - 170, y + h / 2 - 66, 340, 132, { rx: 10, fill: C.surface, fo: 0.95, stroke: C.line2, id: 'Card' }),
    spinner(x + w / 2, y + h / 2 - 34, 10),
    T(x + w / 2, y + h / 2 + 2, `${label}…`, { size: 13, weight: 500, anchor: 'middle', id: 'Current step' }),
    progress(x + w / 2 - 140, y + h / 2 + 18, 280, step / total),
    T(x + w / 2, y + h / 2 + 46, `Step ${step + 1} of ${total} · about ${(total - step) * 10}s left`, { size: 11, fill: C.faint, anchor: 'middle', id: 'Step count' }))
}

function buildingPanel(step) {
  return previewPanel({
    eyebrowText: 'First playable', title: PROJECT, sub: 'Building · Enchanted woodland style',
    action: (r) => btn(r - 96, 80, 'Building…', { w: 96, h: 28, size: 12, disabled: true }).svg + undoButton(r - 106, false).svg,
    hint: 'Live build',
    stage: (x, y, w, h) => scene('woodland', x, y, w, h, { rx: 0, dim: 0.55 }) + buildStatus(x, y, w, h, BUILD_STEPS[step], step, BUILD_STEPS.length),
    bar: controlBar({ playDisabled: true, note: 'Building web preview' }),
    aboutEyebrow: 'What Spark is doing', aboutTitle: 'Setting up your project',
    aboutBody: 'Spark is creating a Unity project, importing a forest asset pack and laying out a first level you can play straight away.',
  })
}

function buildMessage(y, done, active, compact) {
  if (compact) {
    return G('Message / Spark – Build progress (collapsed)', R(SX, y, SW, 64, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }), spinner(SX + 22, y + 22, 8), T(SX + 40, y + 27, `Building · step ${active + 1} of 6`, { size: 12.5, weight: 500 }), T(SX + 40, y + 46, BUILD_STEPS[active], { size: 11.5, fill: C.muted }), progress(SX + 14, y + 56, SW - 28, active / 6))
  }
  const st = steps(SX, y + 72, BUILD_STEPS, done, active)
  return G('Message / Spark – ONB-104 progress', sparkHeader(SX, y), T(SX, y + 28, 'Building your first playable', { size: 17, weight: 600 }), P(SX, y + 36, 'Setting up a Unity project with a forest look and a collect-the-fireflies loop.', SW, { size: 12.5, fill: C.text2, lh: 18 }).svg, st.svg, progress(SX, y + 72 + st.h + 10, SW, done / 6))
}

function priorChat() {
  const u = userMsg(SR, 80, 'Explore and collect — gather fireflies before nightfall.', 300)
  return { svg: u.svg, h: 80 + u.h }
}

export function s07() {
  const p = priorChat()
  let c = p.svg
  c += buildMessage(p.h + 30, 2, 2)
  return appShell('ONB-104 – Show progress during first generation', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview' }, splitChat(c) + buildingPanel(2))
}

// What the user told Spark Assist (ONB-110). Reused wherever Spark explains a suggestion.
const ANSWERS = { experience: 'Just starting out', play: 'Relaxed', games: 'GTA 6, Stardew Valley', genres: 'Open world, Cozy' }

export function s08() {
  const p = priorChat()
  let c = p.svg
  let y = p.h + 24
  c += buildMessage(y, 3, 3, true)
  y += 88
  const x = SX + 16, iw = SW - 32
  let h = R(SX, y, SW, 512, { rx: 12, fill: C.helper, fo: 0.04, stroke: C.helper, opacity: 0.35, id: 'Card' })
  h += sparkHeader(x, y + 28, '', { helper: true })
  h += P(x, y + 40, 'While that builds — a few quick questions so I can tailor your next steps and future ideas.', iw, { size: 12.5, fill: C.text2, lh: 18 }).svg
  h += T(x, y + 100, 'How much time have you spent making games?', { size: 13.5, weight: 600, id: 'Question 1' })
  h += chips(x, y + 112, [['Just starting out', { on: true }], 'A few projects', 'It’s my job'], iw).svg
  h += T(x, y + 204, 'How do you like to play games?', { size: 13.5, weight: 600, id: 'Question 2' })
  h += chips(x, y + 216, [['Relaxed', { on: true }], 'Challenging', 'A bit of both'], iw).svg
  h += T(x, y + 276, 'What are your favourite games?', { size: 13.5, weight: 600, id: 'Question 3' })
  h += G('Field – Favourite games', R(x, y + 288, iw, 36, { rx: 7, fill: C.card, stroke: C.accent2, id: 'Input' }), T(x + 12, y + 311, ANSWERS.games, { size: 12.5, id: 'Value' }), R(x + 12 + tw(ANSWERS.games, 12.5) + 2, y + 297, 1.5, 18, { fill: C.accent, id: 'Caret' }))
  h += T(x, y + 350, 'Any genres you particularly like?', { size: 13.5, weight: 600, id: 'Question 4' })
  h += chips(x, y + 362, [['Open world', { on: true }], ['Cozy / life sim', { on: true }], 'Action', 'Puzzle', 'Racing', 'Strategy'], iw).svg
  h += T(x, y + 456, 'Answers shape your next steps and future project ideas.', { size: 11, fill: C.faint })
  h += btn(x, y + 468, 'Skip for now', { variant: 'ghost', h: 28, size: 11.5 }).svg
  h += T(SX + SW - 16, y + 487, 'Question 4 of 4', { size: 11, fill: C.faint, anchor: 'end' })
  c += G('Message / Spark Assist – ONB-110 preferences', h)
  return appShell('ONB-110 – Secondary agent asks preferences during build', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview' }, splitChat(c, 'Answer, or describe a change…') + buildingPanel(3))
}

function readyPanel({ playing = false, fox = false, version = 'v0.1', updated = false, undo = false } = {}) {
  return previewPanel({
    eyebrowText: updated ? 'Updated just now' : 'First playable', title: PROJECT, sub: `${version} · Web build · Enchanted woodland style`,
    action: (r) => {
      const label = updated ? '● Updated' : '● Build ready'
      const p = pill(0, 0, label, { tone: 'ok' })
      return pill(r - p.w, 82, label, { tone: 'ok' }).svg + undoButton(r - p.w - 10, undo).svg
    },
    hint: playing ? 'Live preview' : 'Scene preview',
    stage: (x, y, w, h) => playing
      ? gameStage(x, y, w, h, { fox })
      : scene('woodland', x, y, w, h, { rx: 0 }) + G('Button / Play your game', R(x + w / 2 - 92, y + h / 2 - 24, 184, 48, { rx: 24, fill: C.accent, id: 'Container' }), T(x + w / 2 + 6, y + h / 2 + 5, '▶  Play your game', { size: 14, weight: 600, fill: C.accentInk, anchor: 'middle', id: 'Label' })),
    bar: controlBar({ play: playing ? 'Stop' : 'Play', note: `Web build · ${version}` }),
    aboutEyebrow: 'How to play', aboutTitle: 'Collect all ten fireflies',
    aboutBody: 'Move with the arrow keys or WASD, or click to steer. Gather every firefly before nightfall.',
  })
}

function readyMessage(y) {
  return G('Message / Spark – Playable ready', sparkHeader(SX, y), T(SX, y + 28, 'Your first playable is ready.', { size: 17, weight: 600 }), P(SX, y + 36, 'Press Play in the preview to try it out.', SW, { size: 12.5, fill: C.text2, lh: 18 }).svg)
}

/** Chat history once the first build lands: answers saved (ONB-110), build complete, playable ready. */
function readyChat() {
  const p = priorChat()
  let y = p.h + 24
  let c = p.svg
  c += G('Message / Spark Assist – Answers saved', R(SX, y, SW, 80, { rx: 10, fill: C.helper, fo: 0.04, stroke: C.helper, opacity: 0.35, id: 'Card' }), sparkHeader(SX + 14, y + 26, '', { helper: true, badge: 'Answers saved' }), P(SX + 14, y + 38, `${ANSWERS.experience} · ${ANSWERS.play} · Loves ${ANSWERS.games} · ${ANSWERS.genres}`, SW - 28, { size: 11.5, fill: C.text2, lh: 17 }).svg)
  y += 92
  c += G('Build complete', R(SX, y, SW, 44, { rx: 10, fill: C.card, stroke: C.line2 }), `<circle cx="${SX + 22}" cy="${y + 22}" r="9" fill="${C.accent}"/>`, T(SX + 22, y + 26, '✓', { size: 10, weight: 700, fill: C.accentInk, anchor: 'middle' }), T(SX + 40, y + 27, 'Built in 58s · 6 of 6 steps', { size: 12.5, fill: C.text2 }))
  y += 72
  c += readyMessage(y)
  return { svg: c, h: y + 70 }
}

export function s09() {
  return appShell('User gets something playable', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview', publish: true }, splitChat(readyChat().svg, 'Tell Spark what you think…') + readyPanel())
}

const FEEDBACK_CHIPS = ['Love it!', 'Too easy', 'Feels a bit empty']

export function s10() {
  const r = readyChat()
  const y = r.h + 26
  const m = G('Message / Spark – Try it and share feedback', sparkHeader(SX, y), T(SX, y + 28, 'How does it feel?', { size: 17, weight: 600 }), P(SX, y + 36, 'Have a play, then tell me what you think — what’s fun, and what would you change?', SW, { size: 12.5, fill: C.text2, lh: 18 }).svg, chips(SX, y + 82, FEEDBACK_CHIPS, SW).svg)
  return appShell('Playing – Spark asks them to try it and share feedback', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview', publish: true }, splitChat(r.svg + m, 'Tell Spark what you think…') + readyPanel({ playing: true }))
}

const NEXT = [
  ['Add a fox companion', 'A friendly fox follows you and points out nearby fireflies.', 'Less lonely', true, 'next-fox.jpg', { focus: [0.43, 0.49], zoom: 2.6 }],
  ['Gentle day–night cycle', 'Fireflies glow brighter as dusk falls — no timer stress.', 'Cozy, like Stardew', false, 'next-dusk.jpg', { focus: [0.5, 0.44], zoom: 1.5 }],
  ['Add a second clearing', 'Grow the world with a new area to explore.', 'Open world', false, 'next-clearing.jpg', { focus: [0.66, 0.5], zoom: 1.6 }],
]

export function s11() {
  let y = 80
  let c = G('Message / Spark – How does it feel? (earlier)', sparkHeader(SX, y), T(SX, y + 26, 'How does it feel?', { size: 14, weight: 600 }), T(SX, y + 46, 'Tell me what’s fun, and what you’d change.', { size: 12, fill: C.muted }))
  y += 72
  const u = userMsg(SR, y, 'Love it! Collecting fireflies is really relaxing, but it feels a bit lonely on my own.', 300)
  c += u.svg
  y += u.h + 26
  let m = sparkHeader(SX, y) + T(SX, y + 28, 'Nice! Here’s what I’d do next', { size: 17, weight: 600 })
  m += pill(SX, y + 42, 'Based on your feedback and favourite games', { tone: 'helper', size: 10.5 }).svg
  y += 82
  NEXT.forEach(([title, desc, why, rec, image, crop], i) => {
    const cy = y + i * 122
    m += G(`Next step card – ${title}`, R(SX, cy, SW, 112, { rx: 10, fill: C.card, stroke: rec ? C.accent2 : C.line2, id: 'Card' }),
      img(image, SX + 10, cy + 8, 112, 96, { rx: 7, layer: `Image – ${title}`, ...crop }),
      rec ? tag(SX + 16, cy + 80, 'Best match', { rec: true }) : '',
      T(SX + 134, cy + 26, title, { size: 13.5, weight: 600, id: 'Title' }),
      P(SX + 134, cy + 34, desc, SW - 146, { size: 11.5, fill: C.muted, lh: 16 }).svg,
      btn(SX + 134, cy + 76, 'Do this next', { variant: rec ? 'primary' : 'ghost', h: 26, size: 11 }).svg,
      T(SX + SW - 12, cy + 93, why, { size: 10.5, fill: C.faint, anchor: 'end', id: 'Reason' }))
  })
  c += G('Message / Spark – ONB-109 next steps', m)
  return appShell('User shares feedback – ONB-109 suggests next steps', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview', publish: true }, splitChat(c, 'Or describe your own change…') + readyPanel())
}

function nextStepsCollapsed(y) {
  return G('Message / Spark – Next steps (earlier)', R(SX, y, SW, 56, { rx: 10, fill: C.card, stroke: C.line2 }), T(SX + 14, y + 24, 'Suggested next steps', { size: 12.5, weight: 500 }), T(SX + 14, y + 42, 'Fox companion · Day–night cycle · Second clearing', { size: 11, fill: C.muted }))
}

const FOX_STEPS = ['Finding a fox in the asset pack', 'Adding follow behaviour', 'Pointing toward nearby fireflies', 'Animating idle and walk', 'Rebuilding the web preview']

export function sWorking() {
  let y = 80
  let c = nextStepsCollapsed(y)
  y += 80
  const u = userMsg(SR, y, 'Add a fox companion', 300)
  c += u.svg
  y += u.h + 28
  const st = steps(SX, y + 72, FOX_STEPS, 2, 2)
  c += G('Message / Spark – Working on the change', sparkHeader(SX, y), T(SX, y + 28, 'Adding a fox companion', { size: 17, weight: 600 }), P(SX, y + 36, 'On it. I’ll keep your current version, so you can undo this later.', SW, { size: 12.5, fill: C.text2, lh: 18 }).svg, st.svg, progress(SX, y + 72 + st.h + 10, SW, 2 / FOX_STEPS.length))
  const panel = previewPanel({
    eyebrowText: 'Updating to v0.2', title: PROJECT, sub: 'v0.1 · Web build · Change in progress',
    action: (r) => btn(r - 96, 80, 'Updating…', { w: 96, h: 28, size: 12, disabled: true }).svg + undoButton(r - 106, false).svg,
    hint: 'Live build',
    stage: (x, yy, w, h) => gameStage(x, yy, w, h) + R(x, yy, w, h, { fill: C.scrim, fo: 0.55, id: 'Dim' }) + buildStatus(x, yy, w, h, FOX_STEPS[2], 2, FOX_STEPS.length),
    bar: controlBar({ playDisabled: true, note: 'Rebuilding web preview' }),
    aboutEyebrow: 'What Spark is doing', aboutTitle: 'Adding a fox companion',
    aboutBody: 'Spark is adding a fox that follows the player and points toward nearby fireflies. Your v0.1 build is kept, so you can undo.',
  })
  return appShell('Spark works on the suggested change', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview', publish: true }, splitChat(c, 'Keep chatting while Spark works…') + panel)
}

function editChat() {
  let y = 80
  let c = nextStepsCollapsed(y)
  y += 80
  const u = userMsg(SR, y, 'Add a fox companion', 300)
  c += u.svg
  y += u.h + 28
  let m = sparkHeader(SX, y) + T(SX, y + 28, 'Done — your fox is in.', { size: 17, weight: 600 })
  m += P(SX, y + 36, 'Here’s what changed in your project:', SW, { size: 12.5, fill: C.text2, lh: 18 }).svg
  const changes = ['Fox companion that follows the player', 'Points toward the nearest firefly', 'Idle and walk animations']
  changes.forEach((t, i) => { m += G(`Change – ${t}`, T(SX, y + 80 + i * 24, '+', { size: 14, weight: 600, fill: C.ok }), T(SX + 18, y + 80 + i * 24, t, { size: 12.5, fill: C.text2 })) })
  m += T(SX, y + 166, 'Next, would you like to…', { size: 13, weight: 600, id: 'Next prompt' })
  m += chips(SX, y + 178, ['Make the fox faster', 'Give the fox a name', 'Let the fox carry fireflies'], SW).svg
  c += G('Message / Spark – Edit applied', m)
  return c
}

export function s12() {
  return appShell('Change ready – User makes an edit', { recent: PROJECT, active: 'recent', crumbs: [PROJECT], status: '◧ Split preview', publish: true }, splitChat(editChat(), 'Tell Spark what to change next…') + readyPanel({ playing: true, fox: true, version: 'v0.2', updated: true, undo: true }))
}

export function s12b() {
  // Undo history popover, anchored under the Undo button in the preview header.
  const pw = 300, px = W - 24 - pw, py = 116
  const items = [
    ['Added fox companion', 'v0.2 · just now', 'Undo', true],
    ['First playable built', 'v0.1 · 6 min ago', 'Restore', false],
  ]
  let pop = R(px, py, pw, 210, { rx: 10, fill: C.surface, stroke: C.line2, id: 'Container' })
  pop += T(px + 16, py + 28, 'Undo history', { size: 13, weight: 600, id: 'Title' })
  pop += T(px + 16, py + 46, 'Step back through Spark’s changes.', { size: 11.5, fill: C.muted })
  items.forEach(([t, meta, action, current], i) => {
    const iy = py + 62 + i * 56
    pop += G(`History item – ${t}`, R(px + 8, iy, pw - 16, 48, { rx: 7, fill: current ? C.card2 : 'none', id: 'Row' }),
      `<circle cx="${px + 24}" cy="${iy + 24}" r="4" fill="${current ? C.accent : C.faint}"/>`,
      T(px + 38, iy + 21, t, { size: 12.5, weight: 500, id: 'Change' }), T(px + 38, iy + 37, meta, { size: 11, fill: C.faint, id: 'Version' }),
      btn(px + pw - 16 - (current ? 58 : 70), iy + 11, action, { variant: current ? 'primary' : 'ghost', h: 26, size: 11, w: current ? 58 : 70 }).svg)
  })
  pop += T(px + 16, py + 196, 'Undoing keeps later versions, so you can redo.', { size: 10.5, fill: C.faint })
  const base = sidebar({ recent: PROJECT, active: 'recent' }) + topbar({ crumbs: [PROJECT], status: '◧ Split preview', publish: true }) + G('Main', splitChat(editChat(), 'Tell Spark what to change next…') + readyPanel({ playing: true, fox: true, version: 'v0.2', updated: true, undo: true }))
  return frame('Undo history (from the Undo button)', base + G('Popover / Undo history', pop))
}

export function s13() {
  let b = eyebrow(FX, 120, 'Good morning')
  b += T(FX, 162, 'Welcome back, Sam.', { size: 32, weight: 600, id: 'Heading' })
  b += T(FX, 190, 'Pick up where you left off.', { size: 14, fill: C.muted })
  const y = 220
  b += G(`Project card – ${PROJECT}`, R(FX, y, FW, 240, { rx: 12, fill: C.card, stroke: C.line2, id: 'Card' }),
    img('next-fox.jpg', FX + 12, y + 12, 300, 216, { rx: 8, layer: 'Latest build preview' }),
    tag(FX + 22, y + 22, 'v0.2'),
    T(FX + 336, y + 44, PROJECT, { size: 19, weight: 600, id: 'Title' }),
    T(FX + 336, y + 68, 'Edited yesterday · Enchanted woodland style', { size: 12, fill: C.muted, id: 'Meta' }),
    P(FX + 336, y + 88, 'Last change: added a cheeky fox companion that points toward fireflies.', FW - 360, { size: 13, fill: C.text2, lh: 19 }).svg,
    btn(FX + 336, y + 178, 'Continue building', { h: 36, id: 'Button / Continue building (back to chat)' }).svg,
    btn(FX + 336 + 158, y + 178, 'Play latest', { variant: 'ghost', h: 36, id: 'Button / Play latest (last build)' }).svg)
  b += T(FX, 504, 'Suggested for today', { size: 13, weight: 600, fill: C.text2 })
  b += T(FX + FW, 504, 'Based on your answers: Stardew Valley · Open world', { size: 11, fill: C.helper, anchor: 'end' })
  const sug = [
    ['Gentle day–night cycle', 'Fireflies glow brighter as dusk falls.'],
    ['Add a second clearing', 'A new area to explore with your fox.'],
    ['Share it with friends', 'Publish a build friends can play from a link, or publish it to Google Playgrounds.'],
  ]
  const cw = (FW - 32) / 3
  sug.forEach(([t, d], i) => {
    const x = FX + i * (cw + 16)
    b += G(`Suggestion – ${t}`, R(x, 520, cw, 140, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }), T(x + 14, 548, t, { size: 13.5, weight: 600 }), P(x + 14, 556, d, cw - 28, { size: 12, fill: C.muted, lh: 17 }).svg, T(x + 14, 644, i === 2 ? 'Publish →' : 'Start →', { size: 12, weight: 500, fill: C.accentText }))
  })
  b += composer(FX, 790, FW, { placeholder: 'Start something new, or ask Spark about your game…', foot: 'Unity Spark · Your projects are saved automatically' })
  return appShell('User comes back the next day', { recent: PROJECT, active: 'overview', crumbs: ['Overview'] }, b)
}

export function s13b() {
  // “Play latest” opens the most recent build straight away, full width.
  const x = 256, w = W - 256 - 24
  let b = eyebrow(x, 86, 'Latest build · v0.2')
  b += T(x, 116, PROJECT, { size: 20, weight: 600, id: 'Title' })
  const cb = btn(0, 0, 'Continue building', { h: 32 })
  b += btn(x + w - cb.w, 84, 'Continue building', { h: 32 }).svg
  const back = btn(0, 0, '← Back to overview', { variant: 'ghost', h: 32 })
  b += btn(x + w - cb.w - 10 - back.w, 84, '← Back to overview', { variant: 'ghost', h: 32 }).svg
  const sh = Math.round(w * 9 / 16 * 0.86)
  b += G('Player', R(x, 136, w, sh + 46, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }), gameStage(x + 1, 137, w - 2, sh, { fox: true, collected: 0 }),
    R(x, 137 + sh, w, 1, { fill: C.line }), G('Controls', controlBar({ play: 'Stop', note: 'Arrow keys or WASD to move · Esc to exit' })(x + 10, 146 + sh, w - 20)))
  return appShell('Play latest build', { recent: PROJECT, active: 'recent', crumbs: [PROJECT, 'v0.2'], publish: true }, b)
}

function publishBackdrop() {
  const p = priorChat()
  return sidebar({ recent: PROJECT, active: 'recent' }) + topbar({ crumbs: [PROJECT], status: '◧ Split preview', publish: true }) + G('Main', splitChat(editChat(), 'Tell Spark what to change next…') + readyPanel({ version: 'v0.2', updated: true, undo: true }))
}

export function s14() {
  const mx = 470, my = 120, mw = 500, mh = 660
  let m = R(mx, my, mw, mh, { rx: 14, fill: C.surface, stroke: C.line2, id: 'Container' })
  m += T(mx + 28, my + 46, 'Publish your game', { size: 21, weight: 600, id: 'Title' })
  m += T(mx + mw - 28, my + 44, '×', { size: 20, fill: C.muted, anchor: 'end', id: 'Close' })
  m += T(mx + 28, my + 70, 'Get a link anyone can play in their browser.', { size: 13, fill: C.muted })
  m += scene('woodland', mx + 28, my + 92, mw - 56, 160, { rx: 10, layer: 'Cover image' })
  m += btn(mx + mw - 28 - 108, my + 214, 'Change cover', { variant: 'ghost', h: 28, size: 11.5 }).svg
  m += G('Field – Game name', T(mx + 28, my + 284, 'Game name', { size: 12, weight: 500, fill: C.text2 }), R(mx + 28, my + 294, mw - 56, 40, { rx: 7, fill: C.card, stroke: C.line2 }), T(mx + 42, my + 319, PROJECT, { size: 13.5 }))
  m += T(mx + 28, my + 366, 'Who can play it?', { size: 12, weight: 500, fill: C.text2 })
  ;[['Anyone with the link', 'Not listed publicly. Great for testing.', true], ['Public on Google Playgrounds', 'Discoverable by everyone on Google Playgrounds.', false]].forEach(([t, d, on], i) => {
    const y = my + 378 + i * 64
    m += G(`Option${on ? ' / Selected' : ''} – ${t}`, R(mx + 28, y, mw - 56, 56, { rx: 8, fill: on ? C.accent : C.card, fo: on ? 0.06 : undefined, stroke: on ? C.accent2 : C.line2 }), `<circle cx="${mx + 50}" cy="${y + 28}" r="7" fill="none" stroke="${on ? C.accent : C.faint}" stroke-width="1.5"/>` + (on ? `<circle cx="${mx + 50}" cy="${y + 28}" r="3.5" fill="${C.accent}"/>` : ''), T(mx + 68, y + 24, t, { size: 13, weight: 500 }), T(mx + 68, y + 42, d, { size: 11.5, fill: C.muted }))
  }
  )
  m += G('Checkbox – Allow remixes', R(mx + 28, my + 518, 16, 16, { rx: 4, fill: C.accent }), T(mx + 36, my + 530, '✓', { size: 11, weight: 700, fill: C.accentInk, anchor: 'middle' }), T(mx + 54, my + 531, 'Let players remix it in Unity Spark', { size: 12.5, fill: C.text2 }))
  m += R(mx, my + mh - 76, mw, 1, { fill: C.line, id: 'Divider' })
  m += btn(mx + mw - 28 - 92, my + mh - 54, 'Publish', { w: 92, h: 36 }).svg
  m += btn(mx + mw - 28 - 92 - 10 - 80, my + mh - 54, 'Cancel', { variant: 'ghost', w: 80, h: 36 }).svg
  m += T(mx + 28, my + mh - 31, 'Publishing builds v0.2 for the web.', { size: 11, fill: C.faint })
  return frame('14 · Publish – Choose settings', publishBackdrop() + R(0, 0, W, H, { fill: C.scrim, fo: 0.7, id: 'Scrim' }) + G('Modal / Publish', m))
}

export function s15() {
  const mx = 470, my = 190, mw = 500, mh = 480
  let m = R(mx, my, mw, mh, { rx: 14, fill: C.surface, stroke: C.line2, id: 'Container' })
  m += scene('woodland', mx + 1, my + 1, mw - 2, 170, { rx: 13, layer: 'Cover image' })
  m += G('Success badge', `<circle cx="${mx + mw / 2}" cy="${my + 171}" r="26" fill="${C.surface}"/><circle cx="${mx + mw / 2}" cy="${my + 171}" r="21" fill="${C.ok}"/>`, T(mx + mw / 2, my + 178, '✓', { size: 18, weight: 700, fill: '#0e2a1c', anchor: 'middle' }))
  m += T(mx + mw / 2, my + 236, 'Your game is live!', { size: 22, weight: 600, anchor: 'middle', id: 'Title' })
  m += T(mx + mw / 2, my + 262, 'Anyone with the link can play it in their browser.', { size: 13, fill: C.muted, anchor: 'middle' })
  m += G('Link field', R(mx + 28, my + 290, mw - 56 - 104, 40, { rx: 7, fill: C.card, stroke: C.line2 }), T(mx + 42, my + 315, 'playgrounds.google.com/sam/forest-firefly-collector', { size: 12.5, fill: C.text2 }))
  m += btn(mx + mw - 28 - 94, my + 293, 'Copy link', { w: 94, h: 34 }).svg
  m += btn(mx + 28, my + 352, 'Open game', { variant: 'ghost', w: (mw - 66) / 2, h: 36 }).svg
  m += btn(mx + 38 + (mw - 66) / 2, my + 352, 'Share', { variant: 'ghost', w: (mw - 66) / 2, h: 36 }).svg
  m += R(mx, my + mh - 66, mw, 1, { fill: C.line, id: 'Divider' })
  m += T(mx + 28, my + mh - 28, 'v0.2 · Published just now', { size: 11.5, fill: C.faint })
  m += btn(mx + mw - 28 - 76, my + mh - 48, 'Done', { w: 76, h: 32 }).svg
  return frame('15 · Publish – Game is live', publishBackdrop() + R(0, 0, W, H, { fill: C.scrim, fo: 0.7, id: 'Scrim' }) + G('Modal / Published', m))
}

// New conversation, before any prompt: Spark Assist asks the ONB-110 questions up front
// (the ones it would otherwise ask while the first project builds).
export function sNewChatQuestions() {
  let b = eyebrow(FX, 120, 'New project')
  b += T(FX, 162, 'Before we start, Sam…', { size: 32, weight: 600, id: 'Heading' })
  b += P(FX, 176, 'A few quick questions so I can suggest ideas that fit you. You can skip and describe your own idea any time.', 660, { size: 14, fill: C.muted, lh: 21, id: 'Intro' }).svg
  const y = 244, x = FX + 24, iw = FW - 48
  let h = R(FX, y, FW, 470, { rx: 12, fill: C.helper, fo: 0.04, stroke: C.helper, opacity: 0.35, id: 'Card' })
  h += sparkHeader(x, y + 30, '', { helper: true, badge: 'Before your next project' })
  h += T(x, y + 74, 'How much time have you spent making games?', { size: 15, weight: 600, id: 'Question 1' })
  h += chips(x, y + 88, [['Just starting out', { on: true }], 'A few projects', 'It’s my job'], iw).svg
  h += T(x, y + 148, 'How do you like to play games?', { size: 15, weight: 600, id: 'Question 2' })
  h += chips(x, y + 162, [['Relaxed', { on: true }], 'Challenging', 'A bit of both'], iw).svg
  h += T(x, y + 222, 'What are your favourite games?', { size: 15, weight: 600, id: 'Question 3' })
  h += G('Field – Favourite games', R(x, y + 236, iw, 40, { rx: 7, fill: C.card, stroke: C.accent2, id: 'Input' }), T(x + 14, y + 261, ANSWERS.games, { size: 13.5, id: 'Value' }), R(x + 14 + tw(ANSWERS.games, 13.5) + 2, y + 246, 1.5, 20, { fill: C.accent, id: 'Caret' }))
  h += T(x, y + 312, 'Any genres you particularly like?', { size: 15, weight: 600, id: 'Question 4' })
  h += chips(x, y + 326, [['Open world', { on: true }], ['Cozy / life sim', { on: true }], 'Action', 'Puzzle', 'Racing', 'Strategy', 'Platformer'], iw).svg
  h += R(FX, y + 388, FW, 1, { fill: C.helper, opacity: 0.25, id: 'Divider' })
  h += T(x, y + 434, 'Question 4 of 4 · Your answers shape the ideas Spark suggests.', { size: 11.5, fill: C.faint })
  const go = btn(0, 0, 'Show me ideas', { h: 36 })
  h += btn(FX + FW - 24 - go.w, y + 410, 'Show me ideas', { h: 36, id: 'Button / Show me ideas (to drafted prompt)' }).svg
  const skip = btn(0, 0, 'Skip for now', { variant: 'ghost', h: 36 })
  h += btn(FX + FW - 24 - go.w - 10 - skip.w, y + 410, 'Skip for now', { variant: 'ghost', h: 36 }).svg
  b += G('Message / Spark Assist – Questions before a new project', h)
  b += composer(FX, 790, FW, { placeholder: 'Or skip ahead and describe your idea…', foot: 'Unity Spark · Spark Assist asks these once, if you didn’t answer them during your first build' })
  return appShell('New conversation – Spark Assist asks questions first', { recent: ['New conversation', PROJECT], active: 'recent', crumbs: ['New conversation'] }, b)
}

// A fresh conversation that opens with a prompt drafted from the ONB-110 answers.
export function sNewChat() {
  let b = eyebrow(FX, 120, 'New project')
  b += T(FX, 162, 'What’s next, Sam?', { size: 32, weight: 600, id: 'Heading' })
  b += P(FX, 176, 'I’ve drafted a starting point from the games you told me you love. Send it as it is, or change anything first.', 660, { size: 14, fill: C.muted, lh: 21, id: 'Intro' }).svg
  const y = 240, h = 172
  const prompt = 'A heist game set in a sunny coastal city, built with Synty’s POLYGON Palm City pack. Plan the job, grab the loot and escape in a getaway car before the police close in.'
  let box = R(FX, y, FW, h, { rx: 12, fill: C.card, stroke: '#43444f', id: 'Container' })
  box += pill(FX + 16, y + 14, '✦ Drafted from your favourite games', { tone: 'helper', size: 10.5 }).svg
  box += P(FX + 18, y + 50, prompt, FW - 120, { size: 15, lh: 23, id: 'Drafted prompt' }).svg
  box += chips(FX + 18, y + h - 44, ['↻ Another idea', '✎ Edit the prompt'], 400).svg
  box += btn(FX + FW - 14 - 64, y + h - 14 - 34, 'Send', { w: 64 }).svg
  b += G('Prompt box – Drafted starting prompt', box)
  b += T(FX, y + h + 22, 'Unity Spark · Ideas use what you shared during your first build', { size: 10.5, fill: C.faint, id: 'Footnote' })
  const cy = 482
  b += T(FX, cy - 14, 'Why this idea', { size: 13, weight: 600, fill: C.text2 })
  b += G('Idea card – Palm City heist', R(FX, cy, FW, 214, { rx: 12, fill: C.card, stroke: C.line2, id: 'Card' }),
    img('palm-city.jpg', FX + 12, cy + 12, 290, 190, { rx: 8, layer: 'Preview – POLYGON Palm City (Synty Store)' }),
    tag(FX + 22, cy + 22, 'Inspired by GTA 6'),
    T(FX + 326, cy + 42, 'Palm City heist', { size: 19, weight: 600, id: 'Title' }),
    T(FX + 326, cy + 64, 'Synty POLYGON – Palm City · Low-poly 3D · Open world', { size: 12, fill: C.muted, id: 'Meta' }),
    P(FX + 326, cy + 82, 'You said GTA 6 is a favourite and you like open worlds, so this keeps that sunny city, cars-and-chases feel, sized for a first project.', FW - 350, { size: 13, fill: C.text2, lh: 19 }).svg,
    pill(FX + 326, cy + 168, 'Based on: GTA 6 · Open world · Just starting out', { tone: 'helper', size: 10.5 }).svg)
  b += T(FX, 730, 'More ideas for you', { size: 13, weight: 600, fill: C.text2 })
  b += chips(FX, 742, ['✦ Cozy farm life sim (like Stardew Valley)', '✦ Open-world firefly hunt', '✦ Getaway driving challenge'], FW).svg
  return appShell('New chat – Starting prompt from your answers', { recent: ['New conversation', PROJECT], active: 'recent', crumbs: ['New conversation'] }, b)
}

export const SCREENS = [sLanding, sSignIn, sPassword, s03, s04, s05, s06, s07, s08, s09, s10, s11, sWorking, s12, s12b, s13, s13b, s14, s15, sNewChatQuestions, sNewChat]
