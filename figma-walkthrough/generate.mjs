// Builds every walkthrough screen as SVG, plus one combined SVG (each screen a nested
// <svg>, which Figma imports as its own frame) and an HTML page to review them.
import { mkdirSync, writeFileSync } from 'node:fs'
import { SCREENS } from './screens.mjs'
import { W, H } from './lib.mjs'

const out = new URL('./out/', import.meta.url)
mkdirSync(out, { recursive: true })

const GAP = 200, COLS = 6
const parts = []
const names = []
SCREENS.forEach((fn, i) => {
  // Number frames by their position in the flow, whatever the function calls them.
  let svg = fn()
  const raw = svg.match(/^<svg id="([^"]+)"/)[1]
  const title = `${String(i + 1).padStart(2, '0')} · ${raw.replace(/^\d+ · /, '')}`
  svg = svg.replace(`<svg id="${raw}"`, `<svg id="${title}"`)
  names.push(title)
  writeFileSync(new URL(`${String(i + 1).padStart(2, '0')}.svg`, out), svg)
  // Review copy that loads Inter (Figma has Inter built in, so the import files don't need it).
  mkdirSync(new URL('preview/', out), { recursive: true })
  writeFileSync(new URL(`preview/${String(i + 1).padStart(2, '0')}.svg`, out), svg.replace(/^(<svg[^>]*>)/, `$1<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=block');</style>`))
  const col = i % COLS, row = Math.floor(i / COLS)
  parts.push(svg.replace(/^<svg /, `<svg x="${col * (W + GAP)}" y="${row * (H + GAP + 100)}" `).replace(' xmlns="http://www.w3.org/2000/svg"', ''))
})

const totalW = COLS * W + (COLS - 1) * GAP
const rows = Math.ceil(SCREENS.length / COLS)
const totalH = rows * H + (rows - 1) * (GAP + 100)
writeFileSync(new URL('all.svg', out), `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">${parts.join('')}</svg>`)

writeFileSync(new URL('index.html', out), `<!doctype html><meta charset="utf-8"><title>Walkthrough review</title>
<style>body{background:#1e1e1e;color:#ccc;font:13px Inter,system-ui;margin:24px}figure{margin:0 0 32px}img{width:100%;max-width:1440px;display:block;border:1px solid #333}</style>
${names.map((n, i) => `<figure><figcaption>${n}</figcaption><img src="${String(i + 1).padStart(2, '0')}.svg"></figure>`).join('')}`)

console.log(names.join('\n'))
