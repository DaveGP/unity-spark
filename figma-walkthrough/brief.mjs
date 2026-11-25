// One-page feature brief (A4 portrait) in the Unity Spark style, for Figma.
// Content: Spark Assist. Kept deliberately calm: few boxes, one visual per idea.
// Run: node brief.mjs  →  out/brief.svg
import { writeFileSync } from 'node:fs'
import { C, T, P, R, G, tw, logo, eyebrow } from './lib.mjs'

const W = 1240
const H = 1754
const M = 72 // page margin
const GUT = 48
const LW = 700 // left column: the argument
const LX = M
const RX = M + LW + GUT
const RW = W - M - RX // right column: the visuals

let svg = ''
svg += R(0, 0, W, H, { fill: C.bg, id: 'Background' })
svg += `<defs><radialGradient id="brief-glow" cx=".9" cy="0" r=".75"><stop stop-color="#c4b5fd" stop-opacity=".09"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0"/></radialGradient></defs>`
svg += R(0, 0, W, 760, { fill: 'url(#brief-glow)', id: 'Glow' })

// ───────── Header ─────────
let h = logo(M, 88, 22)
h += T(W - M, 88, 'FEATURE BRIEF · ONBOARDING', { size: 10, weight: 600, fill: C.muted, ls: 0.9, anchor: 'end', id: 'Doc type' })
h += eyebrow(M, 160, 'Onboarding')
h += T(M, 210, 'Spark Assist', { size: 46, weight: 600, id: 'Title' })
const sub = P(M, 230, 'Quick questions, asked while Spark builds. Spark Assist invites each user to tell us who they are. Every suggestion fits them, not our assumptions.', 820, { size: 18, lh: 27, fill: C.text2, id: 'Subtitle' })
h += sub.svg
svg += G('Header', h)

// ───────── The idea in one picture: the build wait, filled by Spark Assist ─────────
let y = 230 + sub.h + 40
{
  const x0 = M, x1 = W - M, wd = x1 - x0
  // Five steps. Every box except First build is the same width, and both waits use the same
  // question-mark spacing (d) and the same overhang (m) from the end question marks to the bracket ends:
  //   First build = 2m + 4d (five questions), every other box = 2m + d (two questions under Changes).
  const gap = 22, m = 30
  const d = (wd - 4 * gap - 5 * 2 * m) / 8
  const small = 2 * m + d, big = 2 * m + 4 * d
  const stages = [['First prompt'], ['First build', 'wait'], ['Play'], ['Next steps'], ['Changes', 'change']]
  let f = ''
  let sx = x0
  const pos = {}
  stages.forEach(([label, kind]) => {
    const sw = kind === 'wait' ? big : small
    const wait = !!kind
    pos[label] = [sx, sw]
    f += G(`Stage – ${label}`,
      R(sx, y, sw, 44, { rx: 10, fill: wait ? C.accent : C.card, fo: wait ? 0.1 : undefined, stroke: wait ? C.accent2 : C.line2, id: 'Bar' }),
      T(sx + 16, y + 27.5, label, { size: 13, weight: 600, fill: wait ? C.accentText : C.text2, id: 'Label' }),
      kind === 'wait' ? T(sx + sw - 16, y + 27.5, 'median 8 min 50 s', { size: 12, fill: C.muted, anchor: 'end', id: 'Duration' }) : '')
    sx += sw + gap
  })
  const qy = y + 62
  const mark = (dx, n) =>
    `<circle id="Question ${n}" cx="${dx}" cy="${qy + 32}" r="9" fill="${C.helper}" fill-opacity="${0.14 + (n - 1) * 0.05}" stroke="${C.helper}" stroke-width="1.2"/>`
    + T(dx, qy + 36, '?', { size: 10.5, weight: 700, fill: C.helper, anchor: 'middle', id: 'Mark' })
  const bracket = (bx, bw, id) => `<path id="${id}" d="M ${bx + 2} ${qy} v 8 H ${bx + bw - 2} v -8" fill="none" stroke="${C.helper}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
  const [ax, aw] = pos['First build']
  f += bracket(ax, aw, 'Bracket – first build')
  for (let i = 0; i < 5; i++) f += mark(ax + m + i * d, i + 1)
  const [cx, cw] = pos['Changes']
  f += bracket(cx, cw, 'Bracket – changes')
  for (let i = 0; i < 2; i++) f += mark(cx + m + i * d, i + 1)
  f += T(ax + aw / 2, qy + 66, 'Spark Assist asks one question at a time while the user waits', { size: 12.5, fill: C.helper, anchor: 'middle', id: 'Caption' })
  f += T(cx + cw / 2, qy + 66, 'Additional questions', { size: 12.5, fill: C.helper, anchor: 'middle', id: 'Caption – changes' })
  svg += G('Flow – where Spark Assist fits', f)
  y = qy + 66 + 28
}
svg += R(M, y, W - 2 * M, 1, { fill: C.line, id: 'Divider' })
const top = y + 32

// ───────── Left column: the argument ─────────
const head = (n, title, yy) =>
  T(LX, yy + 15, n, { size: 11, weight: 700, fill: C.accentText, ls: 0.6, id: 'Number' })
  + T(LX + 30, yy + 16, title, { size: 20, weight: 600, id: 'Heading' })
const HEAD = 33, GAP = 28
const body = (str, yy, x = LX, w = LW) => P(x, yy, str, w, { size: 14, lh: 22, fill: C.text2, id: 'Body' })
const bullet = (str, x, yy, w, color = C.accent) => {
  const p = P(x + 18, yy, str, w - 18, { size: 14, lh: 22, fill: C.text2, id: 'Bullet' })
  return { svg: `<circle cx="${x + 4}" cy="${yy + 11}" r="2.8" fill="${color}"/>` + p.svg, h: p.h }
}

let left = ''
y = top

// 01 The problem
{
  let s = head('01', 'The problem', y)
  const b = body('Unity Spark lets anyone make the game they have in their head. We can expect a wide variety of users, from casual gamers to experienced developers. Unity Spark needs to understand every user’s interests, understanding and communication style to provide the best possible experience and keep them engaged.', y + HEAD)
  s += b.svg
  left += G('01 The problem', s)
  y += HEAD + b.h + GAP
}

// 02 Why we think so
{
  let s = head('02', 'Why we think so', y)
  let yy = y + HEAD
  ;[
    'The onboarding funnel shows 38% of users abandon their project during the initial build (median 8 min 50 s), as there is nothing to keep them engaged.',
    'User sessions show users with wildly different backgrounds and skill levels. Each type of user needs a different level of support and prompting.',
    'AI models increasingly use memory to tailor their responses, so users increasingly expect personalisation.',
  ].forEach((t) => { const b = bullet(t, LX, yy, LW); s += b.svg; yy += b.h + 8 })
  left += G('02 Why we think so', s)
  y = yy - 8 + GAP
}

// 03 The feature
{
  let s = head('03', 'The feature', y)
  const a = body('Spark Assist is a series of questions designed to learn about the user. It asks them while the primary agent is building prototypes and making changes, keeping users engaged during these waits while building up a profile that informs future decisions across projects. Users can check and amend their profile at any time from their account page.', y + HEAD)
  s += a.svg
  left += G('03 The feature', s)
  y += HEAD + a.h + GAP
}

// 04 Roadmap
{
  let s = head('04', 'Roadmap', y)
  const yy = y + HEAD
  const cw = (LW - 28) / 2
  const col = (x, label, color, text) => {
    const p = P(x, yy + 30, text, cw, { size: 14, lh: 22, fill: C.text2, id: 'Body' })
    return { svg: R(x, yy, cw, 2, { rx: 1, fill: color, id: 'Rule' }) + T(x, yy + 22, label.toUpperCase(), { size: 10.5, weight: 600, fill: color, ls: 0.8, id: 'Label' }) + p.svg, h: 30 + p.h }
  }
  const list = (x, label, color, items) => {
    let out = R(x, yy, cw, 2, { rx: 1, fill: color, id: 'Rule' }) + T(x, yy + 22, label.toUpperCase(), { size: 10.5, weight: 600, fill: color, ls: 0.8, id: 'Label' })
    let by = yy + 32
    items.forEach((t) => {
      const p = P(x + 14, by, t, cw - 14, { size: 13.5, lh: 20, fill: C.text2, id: 'Bullet' })
      out += `<circle cx="${x + 3}" cy="${by + 10}" r="2.5" fill="${color}"/>` + p.svg
      by += p.h + 5
    })
    return { svg: out, h: by - 5 - yy }
  }
  const a = list(LX, 'First version', C.accent, [
    'One question per wait, starting with the four core questions',
    'Skip, Not now and Don’t ask again',
    'Answers editable on the Account page',
    'Answers rank next steps and pitch new projects',
  ])
  const b = col(LX + cw + 28, 'Later', C.muted, 'The AI team uses the profile to further improve the quality of responses and refine the experience for each individual.')
  s += G('First version', a.svg) + G('Later', b.svg)
  left += G('04 Roadmap', s)
  y = yy + Math.max(a.h, b.h) + GAP
}

// 05 How we'll know it worked
{
  let s = head('05', 'How we’ll know it worked', y)
  const a = body('More people sticking around long enough to get something playable, and through each step of the funnel after that. We’d also expect the end result to be better suited to each user’s ideas and preferences.', y + HEAD)
  s += a.svg
  let my = y + HEAD + a.h + 14
  const metrics = [
    ['Primary', 'First-build abandonment falls from 38% to 25%', C.accent],
    ['Leading signal', 'Share of users who answer a question, and average answered', C.ok],
    ['Personalisation', 'Share of suggested next steps chosen with “Do this next”', C.ok],
    ['Guardrails', 'Low dismiss rate; time to first playable unchanged', '#e9c46a'],
  ]
  metrics.forEach(([k, v, col], i) => {
    s += G(`Metric – ${k}`,
      i ? R(LX, my, LW, 1, { fill: C.line, id: 'Rule' }) : '',
      T(LX, my + 20, k.toUpperCase(), { size: 10, weight: 600, fill: col, ls: 0.8, id: 'Kind' }),
      T(LX + 132, my + 20.5, v, { size: 13.5, fill: C.text2, id: 'Measure' }))
    my += 28
  })
  const ab = P(LX, my + 10, 'We’ll A/B test it first: Spark Assist on versus off for new users.', LW, { size: 13.5, lh: 20, fill: C.muted, id: 'Test plan' })
  s += ab.svg
  const py = my + 10 + ab.h - 28
  left += G('05 How we’ll know it worked', s)
  y = py + 28 + GAP
}

// 06 Risks
{
  let s = head('06', 'Risks', y)
  const a = body('Some users may find the questions annoying, so they can dismiss Spark Assist and turn it back on later from their profile. Others may worry about what we store, so answers are optional, visible, editable and only used inside Spark.', y + HEAD)
  s += a.svg
  left += G('06 Risks', s)
  y += HEAD + a.h
}

svg += G('Brief', left)
const leftEnd = y

// ───────── Right column: the visuals ─────────
let right = ''
y = top
// The number that matters.
{
  const ch = 168
  right += G('Stat – build abandonment',
    R(RX, y, RW, ch, { rx: 16, fill: C.card, stroke: C.line2, id: 'Card' }),
    T(RX + 28, y + 92, '38%', { size: 64, weight: 600, fill: C.accent, id: 'Number' }),
    P(RX + 28, y + 110, 'of new users abandon their project during the first build', RW - 56, { size: 14, lh: 21, fill: C.text2, id: 'Caption' }).svg,
    T(RX + RW - 24, y + 30, 'Source: onboarding funnel, Q3 2026', { size: 10.5, fill: C.faint, anchor: 'end', id: 'Source' }))
  y += ch + 24
}
// A sketch of what the user sees: one question at a time.
{
  const pad = 22
  const iw = RW - 2 * pad
  let yy = y + pad
  let k = ''
  k += `<circle cx="${RX + pad + 5}" cy="${yy + 9}" r="5" fill="${C.helper}"/>`
  k += T(RX + pad + 16, yy + 13, 'Spark Assist', { size: 12, weight: 600, fill: C.helper, id: 'Name' })
  const bw = Math.round(tw('While you wait', 10.5) * 1.1 + 18)
  k += G('Badge', R(RX + pad + 112, yy - 1, bw, 20, { rx: 10, fill: C.helper, fo: 0.08, stroke: C.helper, id: 'Pill' }), T(RX + pad + 112 + bw / 2, yy + 13, 'While you wait', { size: 10.5, fill: C.helper, anchor: 'middle', id: 'Label' }))
  yy += 38
  k += T(RX + pad, yy, 'GOALS', { size: 10, weight: 600, fill: C.faint, ls: 0.6, id: 'Topic' })
  const q = P(RX + pad, yy + 10, 'What would you like to get out of Spark?', iw, { size: 15, lh: 21, weight: 600, fill: C.text, id: 'Question' })
  k += q.svg
  yy += 10 + q.h + 12
  let cx = RX + pad, cy = yy
  ;['Have fun making something', 'Learn how games are made', 'Prototype an idea', 'Make something to share'].forEach((t, i) => {
    const w = Math.round(tw(t, 12) * 1.08 + 24)
    if (cx + w > RX + pad + iw) { cx = RX + pad; cy += 36 }
    const on = i === 1
    k += G(`Chip – ${t}`, R(cx, cy, w, 28, { rx: 6, fill: on ? C.accent : C.card2, fo: on ? 0.1 : undefined, stroke: on ? C.accent2 : C.line2, id: 'Chip' }), T(cx + w / 2, cy + 18.5, t, { size: 12, fill: on ? C.accent : C.text2, anchor: 'middle', id: 'Label' }))
    cx += w + 8
  })
  yy = cy + 28 + 18
  let fx = RX + pad
  ;['Skip', 'Not now', 'Don’t ask again this session'].forEach((t) => { k += T(fx, yy + 4, t, { size: 11.5, fill: C.muted, id: `Action – ${t}` }); fx += tw(t, 11.5) * 1.08 + 18 })
  const ch = yy + 4 + pad - y
  const c = R(RX, y, RW, ch, { rx: 16, fill: C.helper, fo: 0.04, stroke: C.helper, opacity: 0.45, id: 'Card' })
  right += G('Sketch – one question at a time', c, k)
  y += ch + 12
  right += T(RX + 4, y + 14, 'Asked during builds and changes. Users can skip, pause or dismiss.', { size: 11.5, fill: C.muted, id: 'Sketch caption' })
  right += T(RX + 4, y + 36, 'Try it in the prototype →', { size: 12, weight: 600, fill: C.accentText, id: 'Try it link' })
  y += 62
}
// What it learns: one of the most important parts, so it gets a proper heading.
{
  y += 6
  right += G('What it learns – heading',
    T(RX, y + 44, 'What Spark Assist learns', { size: 26, weight: 600, fill: C.text, id: 'Heading' }))
  y += 66
  const topics = [
    ['Goals and motivations', 'guide them to what they want to achieve'],
    ['Experience and confidence', 'talk to them on their level'],
    ['Taste in games', 'suggest things they’ll enjoy'],
    ['Look and style', 'guide asset pack recommendations'],
    ['Practical context', 'set the scope of suggestions and nudges'],
    ['Feedback style', 'match how Spark communicates'],
  ]
  const rh = 54
  topics.forEach(([t, why], i) => {
    const ry = y + i * rh
    right += G(`Topic – ${t}`,
      i ? R(RX, ry, RW, 1, { fill: C.line, id: 'Rule' }) : '',
      T(RX, ry + 24, String(i + 1).padStart(2, '0'), { size: 11, weight: 700, fill: C.helper, ls: 0.6, id: 'Number' }),
      T(RX + 30, ry + 24, t, { size: 14.5, weight: 600, fill: C.text, id: 'Topic' }),
      T(RX + 30, ry + 42, `To ${why}`, { size: 12.5, fill: C.muted, id: 'Why' }))
  })
  y += topics.length * rh
}
svg += G('Visuals', right)
const rightEnd = y

// ───────── Footer: where to find the work ─────────
const fy = H - 110
let ft = R(M, fy, W - 2 * M, 1, { fill: C.line, id: 'Divider' })
const links = [
  ['Prototype', 'davegp.github.io/unity-spark'],
  ['Figma', 'Unity Spark – Onboarding walkthrough'],
  ['FigJam', 'Onboarding flow (Testing board)'],
  ['Code', 'github.com/DaveGP/unity-spark'],
]
const colW = (W - 2 * M) / links.length
links.forEach(([k, v], i) => {
  const x = M + i * colW
  ft += G(`Link – ${k}`, T(x, fy + 28, k.toUpperCase(), { size: 10, weight: 600, fill: C.accentText, ls: 0.8, id: 'Kind' }), T(x, fy + 46, v, { size: 12, fill: C.text2, id: 'Where' }))
})
ft += T(M, H - 22, 'Unity Spark · Spark Assist feature brief', { size: 11, fill: C.faint, id: 'Footer' })
ft += T(W - M, H - 22, 'David Pearson · 26 November 2026', { size: 11, fill: C.faint, anchor: 'end', id: 'Author' })
svg += G('Footer', ft)

const out = `<svg id="Feature brief – Spark Assist (A4)" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`
writeFileSync(new URL('./out/brief.svg', import.meta.url), out)
console.log('out/brief.svg', (out.length / 1024).toFixed(0) + ' KB', 'left ends', leftEnd, 'right ends', rightEnd, 'footer at', fy)
