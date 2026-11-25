// One-page feature brief (A4 portrait) in the Unity Spark style, for Figma.
// Text in [brackets] is a placeholder to replace with the written draft.
// Run: node brief.mjs  →  out/brief.svg
import { writeFileSync } from 'node:fs'
import { C, T, P, R, G, tw, img, logo, eyebrow } from './lib.mjs'

const W = 1240
const H = 1754
const M = 64 // page margin
const LX = M, LW = 680 // left column: the writing
const RX = 784, RW = W - M - RX // right column: flow + prototype

const ph = C.faint // placeholder text colour
let svg = ''

// ───────── Background ─────────
svg += R(0, 0, W, H, { fill: C.bg, id: 'Background' })
svg += `<defs><radialGradient id="brief-glow" cx=".85" cy="0" r=".7"><stop stop-color="#c4b5fd" stop-opacity=".10"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0"/></radialGradient></defs>`
svg += R(0, 0, W, 700, { fill: 'url(#brief-glow)', id: 'Glow' })

// ───────── Header ─────────
let h = logo(M, 92, 22)
h += T(W - M, 86, 'FEATURE BRIEF', { size: 10, weight: 600, fill: C.accentText, ls: 0.9, anchor: 'end', id: 'Doc type' })
h += T(W - M, 104, '[Draft v0.1 · 25 November 2026]', { size: 11.5, fill: ph, anchor: 'end', id: 'Version and date' })
h += eyebrow(M, 168, 'Onboarding · Unity Spark')
const title = P(M, 180, '[Feature name]: [what it does, in one line]', 1000, { size: 40, weight: 600, lh: 48, id: 'Title', fill: C.text })
h += title.svg
let y = 180 + title.h + 14
const sub = P(M, y, '[One sentence: the onboarding problem this fixes, and who it’s for.]', 980, { size: 17, lh: 26, fill: C.muted, id: 'Subtitle' })
h += sub.svg
y += sub.h + 14
h += T(M, y + 12, '[Your name] · Product design · Unity Spark prototype', { size: 12, fill: ph, id: 'Author' })
svg += G('Header', h)

// ───────── Links to the work ─────────
y += 42
const links = [
  ['Live prototype', 'davegp.github.io/unity-spark', C.accent],
  ['Figma walkthrough v3', '21 screens · click-through prototype', C.accent],
  ['FigJam flow', 'Current vs proposed onboarding', C.ok],
  ['Source on GitHub', 'github.com/DaveGP/unity-spark', C.muted],
]
const lw = (W - 2 * M - 3 * 14) / 4
let l = ''
links.forEach(([label, url, dot], i) => {
  const x = M + i * (lw + 14)
  l += G(`Link – ${label}`,
    R(x, y, lw, 62, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }),
    `<circle cx="${x + 20}" cy="${y + 24}" r="4" fill="${dot}"/>`,
    T(x + 32, y + 28.5, label, { size: 13, weight: 600, id: 'Label' }),
    T(x + lw - 16, y + 28.5, '↗', { size: 13, fill: C.muted, anchor: 'end', id: 'Arrow' }),
    T(x + 20, y + 47, url, { size: 11, fill: C.muted, id: 'Where' }))
})
svg += G('Links to the work', l)
y += 62 + 34
svg += R(M, y, W - 2 * M, 1, { fill: C.line, id: 'Divider' })
const top = y + 36

// ───────── Left column: the brief ─────────
const head = (n, title, hint, yy) =>
  T(LX, yy + 14, n, { size: 11, weight: 700, fill: C.accentText, ls: 0.6, id: 'Number' })
  + T(LX + 30, yy + 15, title, { size: 19, weight: 600, id: 'Heading' })
  + T(LX + LW, yy + 15, hint, { size: 11, fill: ph, anchor: 'end', id: 'Length guide' })

const body = (str, yy, w = LW) => P(LX, yy, str, w, { size: 14, lh: 22, fill: C.text2, id: 'Body (replace)' })

const bullet = (str, x, yy, w, color = C.accent) => {
  const p = P(x + 16, yy, str, w - 16, { size: 13.5, lh: 21, fill: C.text2, id: 'Bullet (replace)' })
  return { svg: `<circle cx="${x + 4}" cy="${yy + 10}" r="2.5" fill="${color}"/>` + p.svg, h: p.h }
}

let left = ''
y = top
const GAP = 40

// 01 The problem
{
  let s = head('01', 'The problem', '2–3 sentences', y)
  const b = body('[What’s going wrong in onboarding today: where in the flow it happens, who it affects and what it costs us. Name the moment, e.g. “new users wait a minute for their first build with nothing to do, then get generic next steps”.]', y + 34)
  s += b.svg
  left += G('01 The problem', s)
  y += 34 + b.h + GAP
}

// 02 Why we think so
{
  let s = head('02', 'Why we think so', '3 pieces of evidence', y)
  let yy = y + 36
  const tags = [['Data', C.accent], ['Research', C.ok], ['Prototype', '#e9c46a']]
  ;['[Evidence: a number from analytics, e.g. drop-off between first prompt and first play.]', '[Evidence: what users said or did in research or testing.]', '[Evidence: what building the prototype showed us.]'].forEach((t, i) => {
    const [tag, col] = tags[i]
    const tagW = Math.round(tw(tag, 10.5, 600) + 18)
    s += G(`Evidence ${i + 1}`,
      R(LX, yy, tagW, 22, { rx: 11, fill: col, fo: 0.1, stroke: col, sw: 1, id: 'Tag' }),
      T(LX + tagW / 2, yy + 15, tag, { size: 10.5, weight: 600, fill: col, anchor: 'middle', id: 'Tag label' }),
      P(LX + tagW + 12, yy + 2, t, LW - tagW - 12, { size: 13.5, lh: 21, fill: C.text2, id: 'Evidence (replace)' }).svg)
    yy += 34
  })
  left += G('02 Why we think so', s)
  y = yy - 34 + 22 + GAP
}

// 03 The feature
{
  let s = head('03', 'The feature', '1 short paragraph', y)
  const b = body('[What we’re building and how it fixes the problem. One paragraph: what the user sees, when it appears and why it helps.]', y + 34)
  s += b.svg
  let yy = y + 34 + b.h + 16
  const cw = (LW - 2 * 12) / 3
  ;[['When', '[What triggers it]'], ['What they see', '[What the user is shown]'], ['What changes', '[What’s different afterwards]']].forEach(([k, v], i) => {
    const x = LX + i * (cw + 12)
    s += G(`Step ${i + 1} – ${k}`,
      R(x, yy, cw, 76, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' }),
      `<circle cx="${x + 24}" cy="${yy + 24}" r="10" fill="${C.accent}" fill-opacity=".14"/>`,
      T(x + 24, yy + 28, String(i + 1), { size: 11, weight: 700, fill: C.accentText, anchor: 'middle', id: 'Step number' }),
      T(x + 42, yy + 28.5, k, { size: 12.5, weight: 600, id: 'Step' }),
      P(x + 16, yy + 42, v, cw - 32, { size: 12.5, lh: 18, fill: ph, id: 'Step detail (replace)' }).svg)
  })
  left += G('03 The feature', s)
  y = yy + 76 + GAP
}

// 04 First version vs later
{
  let s = head('04', 'What’s in the first version', 'v1 vs later', y)
  const yy = y + 36
  const cw = (LW - 14) / 2
  const col = (x, title, color, items, id) => {
    let c = R(x, yy, cw, 176, { rx: 12, fill: color === C.accent ? C.accent : C.card, fo: color === C.accent ? 0.05 : undefined, stroke: color === C.accent ? C.accent2 : C.line2, id: 'Card' })
    c += T(x + 18, yy + 30, title, { size: 13.5, weight: 600, fill: color === C.accent ? C.accentText : C.text2, id: 'Title' })
    let by = yy + 46
    items.forEach((t) => { const b = bullet(t, x + 18, by, cw - 36, color); c += b.svg; by += b.h + 8 })
    return G(id, c)
  }
  s += col(LX, 'First version', C.accent, ['[Must-have 1]', '[Must-have 2]', '[Must-have 3]', '[Must-have 4]'], 'In v1')
  s += col(LX + cw + 14, 'Later', C.faint, ['[Nice-to-have, and why it can wait]', '[Nice-to-have]', '[Nice-to-have]', '[Nice-to-have]'], 'Later')
  left += G('04 First version vs later', s)
  y = yy + 176 + GAP
}

// 05 How we'll know it worked
{
  let s = head('05', 'How we’ll know it worked', 'metric + target', y)
  const yy = y + 36
  const cw = (LW - 2 * 12) / 3
  ;[['Primary metric', '[What success looks like, e.g. % of new users who reach a playable build]', C.accent],
    ['Leading signal', '[An early sign it’s working, e.g. % who answer Spark Helper questions]', C.ok],
    ['Guardrail', '[What mustn’t get worse, e.g. time to first playable]', '#e9c46a']].forEach(([k, v, colr], i) => {
    const x = LX + i * (cw + 12)
    s += G(`Metric – ${k}`,
      R(x, yy, cw, 140, { rx: 12, fill: C.card, stroke: C.line2, id: 'Card' }),
      R(x, yy + 14, 3, 22, { rx: 1.5, fill: colr, id: 'Accent' }),
      T(x + 16, yy + 30, k.toUpperCase(), { size: 10, weight: 600, fill: colr, ls: 0.8, id: 'Kind' }),
      P(x + 16, yy + 42, v, cw - 32, { size: 12.5, lh: 18, fill: C.text2, id: 'Metric (replace)' }).svg,
      T(x + 16, yy + 124, 'Target: [x%]', { size: 13, weight: 600, fill: C.text, id: 'Target (replace)' }))
  })
  left += G('05 How we’ll know it worked', s)
  y = yy + 140 + GAP
}

// 06 Risks and open questions
{
  let s = head('06', 'Risks and open questions', 'optional', y)
  let yy = y + 36
  ;['[Risk, and how we’d reduce it]', '[Open question we’d answer with the first version]'].forEach((t) => { const b = bullet(t, LX, yy, LW, C.muted); s += b.svg; yy += b.h + 8 })
  left += G('06 Risks and open questions', s)
  y = yy
}
svg += G('Brief', left)
const leftEnd = y

// ───────── Right column: flow + prototype ─────────
let right = ''
y = top
{
  // Onboarding flow, with the focus feature highlighted.
  const steps = [
    ['unity.com/spark', 'Sign up and try now'],
    ['Unity ID sign-in', 'Google, Apple, email…'],
    ['First prompt', 'Ideas in the prompt box · ONB-102'],
    ['Clarifying question', 'Only if the prompt is short · ONB-111'],
    ['First build, live progress', 'Split view · ONB-104'],
    ['Spark Helper asks', 'One question per wait · ONB-110', true],
    ['Play and give feedback', 'How does it feel?'],
    ['Personalised next steps', 'Ranked from the profile · ONB-109'],
    ['Next project pitch', 'Matched to a Synty pack'],
  ]
  const pad = 20, nh = 40, gap = 10
  const ch = 58 + steps.length * nh + (steps.length - 1) * gap + pad
  let f = R(RX, y, RW, ch, { rx: 14, fill: C.surface, stroke: C.line2, id: 'Card' })
  f += eyebrow(RX + pad, y + 30, 'The flow')
  f += T(RX + RW - pad, y + 30, 'Proposed onboarding', { size: 11, fill: C.muted, anchor: 'end', id: 'Caption' })
  let ny = y + 48
  steps.forEach(([t, d, focus], i) => {
    const x = RX + pad, w = RW - 2 * pad
    f += G(`Step – ${t}`,
      R(x, ny, w, nh, { rx: 9, fill: focus ? C.helper : C.card, fo: focus ? 0.08 : undefined, stroke: focus ? C.helper : C.line2, id: focus ? 'Card / Focus' : 'Card' }),
      `<circle cx="${x + 18}" cy="${ny + nh / 2}" r="4" fill="${focus ? C.helper : C.accent}"${focus ? '' : ' fill-opacity=".7"'}/>`,
      T(x + 32, ny + 17, t, { size: 12.5, weight: 600, fill: focus ? C.helper : C.text, id: 'Step' }),
      T(x + 32, ny + 32, d, { size: 10.5, fill: C.muted, id: 'Detail' }),
      focus ? G('Focus tag', R(x + w - 66, ny + 9, 54, 22, { rx: 11, fill: C.helper, id: 'Tag' }), T(x + w - 39, ny + 24, 'Focus', { size: 10.5, weight: 700, fill: '#0e2a1c', anchor: 'middle', id: 'Tag label' })) : '')
    if (i < steps.length - 1) {
      const ax = x + 18, a0 = ny + nh, a1 = ny + nh + gap
      f += `<path id="Arrow" d="M ${ax} ${a0 + 2} V ${a1 - 3} M ${ax - 3.5} ${a1 - 6} L ${ax} ${a1 - 2} L ${ax + 3.5} ${a1 - 6}" fill="none" stroke="${C.line2}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    }
    ny += nh + gap
  })
  right += G('Flow', f)
  y += ch + 20
}
{
  // Prototype screens.
  const pad = 20
  const sw = RW - 2 * pad, sh = Math.round(sw * 750 / 1200)
  // Zoomed in on the chat column, where the feature lives.
  const shots = [
    ['screen-09.jpg', 'Spark Helper asks while the first build runs', [0.36, 0.5]],
    ['screen-12.jpg', 'Next steps ranked from feedback and the profile', [0.34, 0.45]],
  ]
  const ch = 50 + shots.length * (sh + 40) + 6
  let p = R(RX, y, RW, ch, { rx: 14, fill: C.surface, stroke: C.line2, id: 'Card' })
  p += eyebrow(RX + pad, y + 30, 'The prototype')
  p += T(RX + RW - pad, y + 30, 'davegp.github.io/unity-spark', { size: 11, fill: C.muted, anchor: 'end', id: 'Caption' })
  let sy = y + 46
  shots.forEach(([file, cap, focus]) => {
    p += G(`Screen – ${cap}`,
      R(RX + pad - 1, sy - 1, sw + 2, sh + 2, { rx: 9, fill: C.line2, id: 'Border' }),
      img(`brief/${file}`, RX + pad, sy, sw, sh, { rx: 8, layer: 'Screenshot', focus, zoom: 1.7, natural: [1200, 750] }),
      T(RX + pad, sy + sh + 22, cap, { size: 11.5, fill: C.text2, id: 'Caption' }))
    sy += sh + 40
  })
  right += G('Prototype', p)
  y += ch
}
svg += G('Visuals', right)

// ───────── Footer: what's been built ─────────
let fy = Math.max(leftEnd, y) + 44
const built = ['21-screen walkthrough', 'Clickable prototype', 'Working web app', '30-question profile', 'Personalised suggestions', '10 Synty pitches']
let ft = R(M, fy, W - 2 * M, 1, { fill: C.line, id: 'Divider' })
ft += eyebrow(M, fy + 32, 'Built so far', C.muted)
let fx = M + 110
built.forEach((b) => {
  const w = Math.round(tw(b, 11.5, 500) * 1.12 + 24)
  ft += G(`Built – ${b}`, R(fx, fy + 16, w, 26, { rx: 13, fill: C.card2, stroke: C.line2, id: 'Pill' }), T(fx + w / 2, fy + 33, b, { size: 11.5, weight: 500, fill: C.text2, anchor: 'middle', id: 'Label' }))
  fx += w + 8
})
ft += T(M, H - 40, 'Unity Spark · Onboarding feature brief', { size: 11, fill: C.faint, id: 'Footer' })
ft += T(W - M, H - 40, 'Page 1 of 1', { size: 11, fill: C.faint, anchor: 'end', id: 'Page' })
svg += G('Footer', ft)

const out = `<svg id="Feature brief – Onboarding (A4)" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`
writeFileSync(new URL('./out/brief.svg', import.meta.url), out)
console.log('out/brief.svg', (out.length / 1024).toFixed(0) + ' KB', 'left ends', leftEnd, 'right ends', y, 'footer at', fy)
