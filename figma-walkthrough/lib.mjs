// Primitives and Unity Spark components that emit Figma-friendly SVG.
// Every group gets an id so it lands in Figma as a named layer.
import { readFileSync } from 'node:fs'

export const W = 1440
export const H = 900

export const C = {
  bg: '#0e0f13', sidebar: '#121318', surface: '#15161b', card: '#1a1b21', card2: '#202128',
  line: '#24252d', line2: '#30313a', text: '#ededf2', text2: '#c4c5cf', muted: '#8d8e9a',
  faint: '#62636e', accent: '#c4b5fd', accent2: '#b3a1fb', accentInk: '#1b1533',
  accentText: '#b9a8ff', ok: '#7ad6a6', helper: '#7ad6a6', scrim: '#07080b',
}

const scenes = JSON.parse(readFileSync(new URL('./scenes.json', import.meta.url), 'utf8'))

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const name = (s) => esc(String(s).slice(0, 60))

/** Rough Inter text width; good enough for sizing pills and wrapping. */
export const tw = (str, size, weight = 400) => String(str).length * size * (weight >= 600 ? 0.56 : weight >= 500 ? 0.535 : 0.515)

export function wrap(str, maxW, size, weight = 400) {
  const words = String(str).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (tw(next, size, weight) > maxW && line) { lines.push(line); line = w } else line = next
  }
  if (line) lines.push(line)
  return lines
}

export function T(x, y, str, o = {}) {
  const { size = 14, weight = 400, fill = C.text, anchor, ls, id, opacity } = o
  return `<text id="${name(id ?? str)}" x="${x}" y="${y}" font-family="Inter" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}${ls ? ` letter-spacing="${ls}"` : ''}${opacity ? ` opacity="${opacity}"` : ''}>${esc(str)}</text>`
}

/** Wrapped paragraph. Returns { svg, h } where h is the block height. */
export function P(x, y, str, maxW, o = {}) {
  const { size = 14, lh = Math.round(size * 1.5), weight = 400, id } = o
  const lines = wrap(str, maxW, size, weight)
  const baseline = y + size
  const spans = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('')
  const { fill = C.text, anchor } = o
  const svg = `<text id="${name(id ?? str)}" x="${x}" y="${baseline}" font-family="Inter" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}>${spans}</text>`
  return { svg, h: lines.length * lh }
}

export function R(x, y, w, h, o = {}) {
  const { rx = 0, fill = 'none', stroke, sw = 1, id, opacity, fo } = o
  return `<rect${id ? ` id="${name(id)}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''} fill="${fill}"${fo != null ? ` fill-opacity="${fo}"` : ''}${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${opacity != null ? ` opacity="${opacity}"` : ''}/>`
}

export const G = (id, ...children) => `<g id="${name(id)}">${children.join('')}</g>`

// ───────────────────────── Scene art ─────────────────────────
let clipN = 0
export function scene(id, x, y, w, h, o = {}) {
  const { rx = 10, dim = 0, filter, layer = `Scene / ${id}` } = o
  const inner = scenes[id].replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
  const s = Math.max(w / 800, h / 500)
  const tx = x + (w - 800 * s) / 2
  const ty = y + (h - 500 * s) / 2
  const cid = `clip-${++clipN}`
  return `<g id="${name(layer)}"><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>`
    + `<g clip-path="url(#${cid})"${filter ? ` opacity="${filter}"` : ''}><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${inner}</g>`
    + (dim ? R(x, y, w, h, { fill: C.scrim, fo: dim, id: 'Dim' }) : '')
    + `</g></g>`
}

// ───────────────────────── Raster images (embedded as data URIs) ─────────────────────────
const imgCache = {}
export function img(file, x, y, w, h, o = {}) {
  const { rx = 0, layer = file, fit = 'slice' } = o
  if (!imgCache[file]) {
    const type = file.endsWith('.png') ? 'png' : 'jpeg'
    imgCache[file] = `data:image/${type};base64,${readFileSync(new URL(`./assets/${file}`, import.meta.url)).toString('base64')}`
  }
  const par = fit === 'slice' ? 'xMidYMid slice' : fit === 'meet' ? 'xMidYMid meet' : 'none'
  let image = `<image id="${name(layer)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${par}" href="${imgCache[file]}"/>`
  if (o.focus) {
    // Zoom in on a point of interest: draw the image larger than the box and clip it.
    const [IW, IH] = o.natural ?? [800, 500]
    const [fx, fy] = o.focus
    const s = Math.max(w / IW, h / IH) * (o.zoom ?? 1)
    const dw = IW * s, dh = IH * s
    const ix = Math.min(x, Math.max(x + w - dw, x + w / 2 - fx * dw))
    const iy = Math.min(y, Math.max(y + h - dh, y + h / 2 - fy * dh))
    image = `<image id="${name(layer)}" x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${dw.toFixed(1)}" height="${dh.toFixed(1)}" preserveAspectRatio="none" href="${imgCache[file]}"/>`
    if (!rx) o = { ...o, rx: 0.01 }
  }
  const radius = o.rx ?? rx
  if (!radius) return image
  const cid = `clip-${++clipN}`
  return `<g id="${name(layer)}"><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath><g clip-path="url(#${cid})">${image.replace(`id="${name(layer)}"`, 'id="Image"')}</g></g>`
}

/** Invisible named rectangle to make prototype hotspots easy to find. */
export const hotspot = (x, y, w, h, label) => `<rect id="Hotspot – ${name(label)}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" fill-opacity="0.01"/>`

// ───────────────────────── Atoms ─────────────────────────
export function logo(x, y, size = 17) {
  return G('Logo', T(x, y, 'Unity', { size, weight: 700 }), T(x + tw('Unity', size, 700) + 6, y, 'Spark', { size, weight: 500, fill: C.accent }))
}

export function eyebrow(x, y, label, fill = C.accentText) {
  return T(x, y, label.toUpperCase(), { size: 10, weight: 600, fill, ls: 0.9, id: `Eyebrow / ${label}` })
}

export function btn(x, y, label, o = {}) {
  const { variant = 'primary', h = 34, size = 13, w, disabled, id } = o
  const width = w ?? Math.round(tw(label, size, 500) + 28)
  const styles = {
    primary: { fill: C.accent, stroke: null, text: C.accentInk },
    ghost: { fill: C.card2, stroke: C.line2, text: C.text },
    text: { fill: 'none', stroke: null, text: C.muted },
  }[variant]
  const svg = G(id ?? `Button / ${variant === 'primary' ? 'Primary' : variant === 'ghost' ? 'Secondary' : 'Text'} – ${label}`,
    R(x, y, width, h, { rx: 7, fill: styles.fill, stroke: styles.stroke, opacity: disabled ? 0.45 : undefined, id: 'Container' }),
    T(x + width / 2, y + h / 2 + size * 0.36, label, { size, weight: 500, fill: styles.text, anchor: 'middle', opacity: disabled ? 0.6 : undefined, id: 'Label' }))
  return { svg, w: width, h }
}

export function chip(x, y, label, o = {}) {
  const { on, accent, h = 30, size = 12 } = o
  const w = Math.round(tw(label, size, accent ? 500 : 400) + 26)
  const fill = accent ? C.accent : on ? C.accent : C.card2
  const fo = on && !accent ? 0.1 : undefined
  const stroke = accent ? C.accent : on ? C.accent2 : C.line2
  const color = accent ? C.accentInk : on ? C.accent : C.text2
  const svg = G(`Chip${on ? ' / Selected' : accent ? ' / Accent' : ''} – ${label}`,
    R(x, y, w, h, { rx: 6, fill, fo, stroke, id: 'Container' }),
    T(x + w / 2, y + h / 2 + size * 0.36, label, { size, weight: accent ? 500 : 400, fill: color, anchor: 'middle', id: 'Label' }))
  return { svg, w, h }
}

export function chips(x, y, labels, maxW, opts = {}) {
  let cx = x, cy = y, out = ''
  for (const item of labels) {
    const [label, o] = Array.isArray(item) ? item : [item, {}]
    const probe = chip(0, 0, label, { ...opts, ...o })
    if (cx + probe.w > x + maxW && cx > x) { cx = x; cy += probe.h + 8 }
    out += chip(cx, cy, label, { ...opts, ...o }).svg
    cx += probe.w + 8
  }
  return { svg: G('Chips', out), h: cy - y + 30 }
}

export function pill(x, y, label, o = {}) {
  const { tone = 'neutral', size = 11 } = o
  const w = Math.round(String(label).length * size * 0.6 + 24)
  const t = {
    neutral: [C.card2, C.line2, C.text2],
    ok: [C.ok, C.ok, C.ok],
    helper: [C.helper, C.helper, C.helper],
    accent: [C.accent, C.accent, C.accent],
  }[tone]
  const tinted = tone !== 'neutral'
  return { svg: G(`Pill – ${label}`, R(x, y, w, 24, { rx: 12, fill: t[0], fo: tinted ? 0.1 : undefined, stroke: t[1], opacity: tinted ? 0.9 : undefined, id: 'Container' }), T(x + w / 2, y + 16, label, { size, fill: t[2], weight: 500, anchor: 'middle', id: 'Label' })), w }
}

export function tag(x, y, label, o = {}) {
  const w = Math.round(label.length * 9 * 0.72 + 18)
  const fill = o.rec ? C.accent : '#0e0f13'
  return G(`Tag – ${label}`, R(x, y, w, 20, { rx: 5, fill, fo: o.rec ? undefined : 0.85, id: 'Container' }), T(x + w / 2, y + 13.5, label.toUpperCase(), { size: 9, weight: 600, ls: 0.6, fill: o.rec ? C.accentInk : '#e7e7ee', anchor: 'middle', id: 'Label' }))
}

export function progress(x, y, w, frac, id = 'Progress') {
  return G(id, R(x, y, w, 4, { rx: 2, fill: C.line2, id: 'Track' }), R(x, y, Math.max(4, w * frac), 4, { rx: 2, fill: C.accent, id: 'Fill' }))
}

export function spinner(cx, cy, r = 9) {
  return G('Spinner', `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line2}" stroke-width="2"/>`, `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round"/>`)
}

export function avatar(cx, cy, letter, r = 14) {
  return G('Avatar', `<defs><linearGradient id="av-g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c4b5fd"/><stop offset="1" stop-color="#7ad6a6"/></linearGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#av-g)"/>`, T(cx, cy + 4, letter, { size: 12, weight: 700, fill: C.accentInk, anchor: 'middle', id: 'Initial' }))
}

// ───────────────────────── App chrome ─────────────────────────
export function sidebar({ active = null, recent = null } = {}) {
  const item = (y, label, on) => G(`Nav item – ${label}`, on ? R(12, y - 19, 208, 30, { rx: 7, fill: C.card2, id: 'Selected' }) : '', T(24, y, label, { size: 12.5, fill: on ? C.text : C.muted, id: 'Label' }))
  return G('Sidebar',
    R(0, 0, 232, H, { fill: C.sidebar, id: 'Background' }),
    R(231, 0, 1, H, { fill: C.line, id: 'Divider' }),
    logo(22, 38),
    G('Button / New conversation', R(16, 62, 200, 34, { rx: 7, fill: C.card2, stroke: C.line2, id: 'Container' }), T(30, 84, '+', { size: 15, fill: C.muted, id: 'Icon' }), T(48, 83.5, 'New conversation', { size: 12.5, id: 'Label' })),
    T(24, 132, 'WORKSPACE', { size: 9.5, weight: 600, ls: 0.9, fill: C.faint, id: 'Section label' }),
    item(160, 'Overview', active === 'overview'),
    item(190, 'My assets', active === 'assets'),
    T(24, 232, 'RECENT', { size: 9.5, weight: 600, ls: 0.9, fill: C.faint, id: 'Section label' }),
    recent ? [].concat(recent).map((r, i) => item(260 + i * 30, r, active === 'recent' && i === 0)).join('') : T(24, 258, 'No conversations yet', { size: 12, fill: C.faint }),
    T(24, 822, 'Your next idea starts here.', { size: 11.5, fill: C.faint }),
    R(16, 840, 200, 1, { fill: C.line, id: 'Divider' }),
    G('Account', avatar(36, 868, 'S'), T(58, 865, 'Sam Rivera', { size: 12.5, fill: C.text2, id: 'Name' }), T(58, 880, 'Personal workspace', { size: 11, fill: C.faint, id: 'Workspace' })),
  )
}

export function topbar({ crumbs = ['New conversation'], status = '', publish = false } = {}) {
  let x = 252, out = ''
  crumbs.forEach((c, i) => {
    if (i) { out += T(x, 33, '/', { size: 13, fill: C.faint, id: 'Separator' }); x += 14 }
    out += T(x, 33, c, { size: 13, weight: 500, fill: i === crumbs.length - 1 ? C.text : C.text2, id: `Crumb – ${c}` })
    x += tw(c, 13, 500) + 8
  })
  let right = W - 20
  const share = btn(0, 0, 'Share', { variant: 'ghost', h: 30, size: 12 })
  right -= share.w
  let svg = btn(right, 13, 'Share', { variant: 'ghost', h: 30, size: 12 }).svg
  if (publish) {
    const p = btn(0, 0, 'Publish', { h: 30, size: 12 })
    right -= p.w + 10
    svg += btn(right, 13, 'Publish', { h: 30, size: 12 }).svg
  }
  if (status) svg += T(right - 16, 32, status.toUpperCase(), { size: 10, weight: 600, ls: 0.8, fill: C.muted, anchor: 'end', id: 'Status' })
  return G('Top bar', R(232, 0, W - 232, 56, { fill: C.bg, id: 'Background' }), R(232, 55, W - 232, 1, { fill: C.line, id: 'Divider' }), G('Breadcrumbs', out), svg)
}

// ───────────────────────── Chat ─────────────────────────
export function userMsg(rightX, y, text, maxW = 460) {
  const lines = wrap(text, maxW - 32, 13)
  const w = Math.min(maxW, Math.round(Math.max(...lines.map((l) => tw(l, 13))) + 34))
  const h = lines.length * 20 + 22
  const p = P(rightX - w + 16, y + 10, text, maxW - 32, { size: 13, lh: 20, id: 'Message' })
  return { svg: G('Message / User', R(rightX - w, y, w, h, { rx: 10, fill: C.card2, stroke: C.line2, id: 'Bubble' }), p.svg), h }
}

export function sparkHeader(x, y, label = 'Spark', o = {}) {
  if (o.helper) {
    return G('Agent / Helper', `<circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${C.helper}"/>`, T(x + 16, y, 'Spark Assist', { size: 11, weight: 600, fill: C.helper, id: 'Name' }), pill(x + 16 + Math.round(tw('Spark Assist', 11, 600) * 1.15) + 10, y - 16, o.badge ?? 'While you wait', { tone: 'helper', size: 10 }).svg)
  }
  return T(x, y, label, { size: 11, weight: 600, fill: C.accentText, id: 'Agent name' })
}

export function composer(x, y, w, o = {}) {
  const { placeholder = 'Describe your game idea…', value = '', foot = 'Unity Spark · Explore ideas before importing assets', h = 52, active } = o
  const send = btn(x + w - 8 - 58, y + h - 8 - 30, 'Send', { h: 30, size: 12, w: 58, disabled: !value && !active })
  const text = value
    ? T(x + 16, y + h / 2 + 5, value, { size: 13, id: 'Input value' }) + R(x + 16 + tw(value, 13) + 2, y + h / 2 - 9, 1.5, 18, { fill: C.accent, id: 'Caret' })
    : T(x + 16, y + h / 2 + 5, placeholder, { size: 13, fill: C.faint, id: 'Placeholder' })
  return G('Composer',
    R(x, y, w, h, { rx: 10, fill: C.card, stroke: value ? '#43444f' : C.line2, id: 'Container' }),
    text, send.svg,
    foot ? T(x, y + h + 18, foot, { size: 10.5, fill: C.faint, id: 'Footnote' }) : '')
}

export function steps(x, y, items, done, active, w = 300) {
  let out = ''
  items.forEach((s, i) => {
    const yy = y + i * 26
    const isDone = i < done, isActive = i === active
    const icon = isDone
      ? `<circle cx="${x + 9}" cy="${yy + 9}" r="9" fill="${C.accent}"/>` + T(x + 9, yy + 13, '✓', { size: 10, weight: 700, fill: C.accentInk, anchor: 'middle', id: 'Check' })
      : isActive ? spinner(x + 9, yy + 9, 8) : `<circle cx="${x + 9}" cy="${yy + 9}" r="8.5" fill="none" stroke="${C.line2}" stroke-width="1.5"/>`
    out += G(`Step – ${s}`, icon, T(x + 28, yy + 13.5, s, { size: 12.5, fill: isDone ? C.text2 : isActive ? C.text : C.faint, id: 'Label' }))
  })
  return { svg: G('Build steps', out), h: items.length * 26 }
}

export const BUILD_STEPS = [
  'Creating a new Unity project',
  'Importing the forest asset pack',
  'Laying out the first level',
  'Adding a player controller',
  'Placing fireflies and goals',
  'Building a web preview',
]

// ───────────────────────── Preview panel (split view) ─────────────────────────
export const PX = 612 // panel left edge in split view

export function previewPanel(o) {
  const { eyebrowText, title, sub, action, stageTabs = ['Game', 'Forest firefly collector'], hint = 'Scene preview', stage, bar, aboutEyebrow, aboutTitle, aboutBody, extra = '' } = o
  const x = PX + 24, w = W - PX - 48
  let svg = R(PX, 56, W - PX, H - 56, { fill: C.bg, id: 'Background' })
  svg += eyebrow(x, 92, eyebrowText)
  svg += T(x, 122, title, { size: 20, weight: 600, id: 'Title' })
  svg += T(x, 144, sub, { size: 12, fill: C.muted, id: 'Subtitle' })
  if (action) svg += action(x + w)
  // preview card
  const cy = 166, stageH = Math.round((w) * 9 / 16 * 0.82)
  let card = R(x, cy, w, 44 + stageH + 46, { rx: 10, fill: C.card, stroke: C.line2, id: 'Card' })
  card += G('Tabs', R(x + 10, cy + 9, tw(stageTabs[0], 11.5) + 22, 26, { rx: 5, fill: C.card2, stroke: C.line2, id: 'Selected tab' }), T(x + 21, cy + 26, stageTabs[0], { size: 11.5, id: 'Tab' }), T(x + 21 + tw(stageTabs[0], 11.5) + 24, cy + 26, stageTabs[1], { size: 11.5, fill: C.text2, id: 'Tab' }), T(x + w - 14, cy + 26, hint, { size: 11, fill: C.faint, anchor: 'end', id: 'Hint' }))
  card += R(x, cy + 43, w, 1, { fill: C.line, id: 'Divider' })
  card += G('Stage', stage(x, cy + 44, w, stageH))
  const by = cy + 44 + stageH
  card += R(x, by, w, 1, { fill: C.line, id: 'Divider' })
  card += G('Controls', bar(x + 10, by + 9, w - 20))
  svg += G('Preview', card)
  const ay = by + 46 + 28
  svg += R(x, ay, w, 1, { fill: C.line, id: 'Divider' })
  if (aboutTitle) {
    svg += G('About', eyebrow(x, ay + 30, aboutEyebrow), T(x, ay + 56, aboutTitle, { size: 16, weight: 600, id: 'Heading' }), P(x, ay + 66, aboutBody, 560, { size: 12.5, fill: C.muted, lh: 19 }).svg)
  }
  svg += extra
  return G('Preview panel', R(PX - 1, 56, 1, H - 56, { fill: C.line, id: 'Divider' }), svg)
}

export function controlBar({ play = 'Play', playDisabled, note = 'Illustrative preview' } = {}) {
  return (x, y, w) => {
    const p = btn(x, y, play, { variant: 'ghost', h: 26, size: 11, disabled: playDisabled })
    const r = btn(x + p.w + 8, y, 'Reset view', { variant: 'ghost', h: 26, size: 11 })
    const f = btn(0, 0, 'Fullscreen', { variant: 'ghost', h: 26, size: 11 })
    return p.svg + r.svg + T(x + p.w + r.w + 22, y + 17, note, { size: 11, fill: C.faint, id: 'Note' }) + btn(x + w - f.w, y, 'Fullscreen', { variant: 'ghost', h: 26, size: 11 }).svg
  }
}

/** Simple top-down render of the starter game, used for the "playing" state. */
export function gameStage(x, y, w, h, { fox = false, collected = 3 } = {}) {
  let out = ''
  const cell = 46
  for (let r = 0; r * cell < h; r++) for (let c = 0; c * cell < w; c++) {
    out += R(x + c * cell, y + r * cell, Math.min(cell, w - c * cell), Math.min(cell, h - r * cell), { fill: (r + c) % 2 ? '#98c27c' : '#a9cf8e' })
  }
  const blocks = [[0.08, 0.18, 70, 60], [0.3, 0.1, 90, 50], [0.62, 0.2, 60, 80], [0.82, 0.12, 70, 60], [0.14, 0.62, 80, 70], [0.42, 0.55, 60, 60], [0.7, 0.62, 90, 60], [0.88, 0.7, 50, 60]]
  let obs = ''
  for (const [fx, fy, bw, bh] of blocks) {
    const bx = x + fx * w, by = y + fy * h
    obs += R(bx + 5, by + 9, bw, bh, { rx: 10, fill: '#000', fo: 0.18 }) + R(bx, by, bw, bh, { rx: 10, fill: '#4f8a4a' }) + R(bx, by - 7, bw, bh - 4, { rx: 10, fill: '#6fae5f' })
  }
  const flies = [[0.22, 0.42], [0.52, 0.3], [0.58, 0.82], [0.9, 0.45], [0.33, 0.85], [0.76, 0.4], [0.05, 0.85]]
  let ff = ''
  for (const [fx, fy] of flies) {
    const cx = x + fx * w, cy = y + fy * h
    ff += `<circle cx="${cx}" cy="${cy}" r="16" fill="#fff3b0" fill-opacity=".45"/><circle cx="${cx}" cy="${cy}" r="6" fill="#f7d774"/>`
  }
  const px = x + w * 0.46, py = y + h * 0.46
  let player = `<ellipse cx="${px + 3}" cy="${py + 10}" rx="12" ry="6" fill="#000" fill-opacity=".22"/><circle cx="${px}" cy="${py}" r="12" fill="#f0a45d"/><circle cx="${px - 4}" cy="${py - 4}" r="4" fill="#fff" fill-opacity=".55"/>`
  if (fox) player += `<g id="Fox companion"><ellipse cx="${px - 34}" cy="${py + 18}" rx="10" ry="5" fill="#000" fill-opacity=".2"/><path d="M ${px - 44} ${py + 12} q 10 -16 20 0 q -10 8 -20 0 z" fill="#e0703a"/><circle cx="${px - 28}" cy="${py + 6}" r="7" fill="#e8834a"/><path d="M ${px - 32} ${py} l 2 -7 l 3 6 z M ${px - 26} ${py} l 2 -7 l 3 6 z" fill="#e8834a"/><circle cx="${px - 26}" cy="${py + 6}" r="1.4" fill="#1b1533"/></g>`
  const hud = G('HUD', R(x + 10, y + 10, 64, 24, { rx: 6, fill: C.bg, fo: 0.75 }), T(x + 20, y + 26, `✦ ${collected}/10`, { size: 12, weight: 600, id: 'Score' }), R(x + w - 52, y + 10, 42, 24, { rx: 6, fill: C.bg, fo: 0.75 }), T(x + w - 42, y + 26, '12s', { size: 12, weight: 600, id: 'Timer' }))
  return `<g id="Game"><clipPath id="game-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#game-clip)">${G('Ground', out)}${G('Obstacles', obs)}${G('Fireflies', ff)}${G('Player', player)}</g>${hud}</g>`
}

// ───────────────────────── Frame ─────────────────────────
export function frame(id, body) {
  return `<svg id="${name(id)}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${R(0, 0, W, H, { fill: C.bg, id: 'Background' })}${body}</svg>`
}
