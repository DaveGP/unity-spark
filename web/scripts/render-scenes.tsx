// Renders the three isometric scenes to static SVG markup for the Figma walkthrough generator.
// Build:  npx vite build --ssr scripts/render-scenes.tsx --outDir scripts/.build
// Run:    node scripts/.build/render-scenes.js
import { writeFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { Scene, type SceneId } from '../src/art/Scenes'

const ids: SceneId[] = ['woodland', 'orbital', 'city']
const out: Record<string, string> = {}

for (const id of ids) {
  const markup = renderToStaticMarkup(<Scene id={id} />)
  // useId() emits characters that are not valid in SVG url(#…) references.
  out[id] = markup.replace(/[«»:]/g, '')
}

const target = new URL('../../../figma-walkthrough/scenes.json', import.meta.url)
writeFileSync(target, JSON.stringify(out))
console.log('wrote', target.pathname)
