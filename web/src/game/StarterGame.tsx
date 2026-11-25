import { useEffect, useRef, useState } from 'react'
import type { Look } from '../lib/looks'

/*
 * The "first playable" Spark hands back: a tiny top-down collect game themed for each look.
 *   woodland – an explorer collecting fireflies among bushes; companion: a fox
 *   orbital  – an astronaut collecting power cells between station modules; companion: a robot dog
 *   city     – a courier on a scooter collecting parcels between buildings; companion: a delivery drone
 * Arrow keys / WASD, or click to steer toward a point.
 */

const W = 800
const H = 500
const PICKUPS = 10

interface Rect { x: number; y: number; w: number; h: number }
type Ctx = CanvasRenderingContext2D

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function makeLevel(seed: number) {
  const rand = rng(seed)
  const obstacles: Rect[] = []
  while (obstacles.length < 14) {
    const w = 40 + rand() * 50
    const h = 40 + rand() * 50
    const r = { x: 40 + rand() * (W - 80 - w), y: 40 + rand() * (H - 80 - h), w, h }
    const nearStart = Math.hypot(r.x + w / 2 - W / 2, r.y + h / 2 - H / 2) < 110
    const overlaps = obstacles.some((o) => r.x < o.x + o.w + 24 && r.x + r.w + 24 > o.x && r.y < o.y + o.h + 24 && r.y + r.h + 24 > o.y)
    if (!nearStart && !overlaps) obstacles.push(r)
  }
  const pickups: { x: number; y: number; got: boolean }[] = []
  while (pickups.length < PICKUPS) {
    const p = { x: 30 + rand() * (W - 60), y: 30 + rand() * (H - 60), got: false }
    const blocked = obstacles.some((o) => p.x > o.x - 18 && p.x < o.x + o.w + 18 && p.y > o.y - 18 && p.y < o.y + o.h + 18)
    if (!blocked) pickups.push(p)
  }
  return { obstacles, pickups }
}

const round = (ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) => {
  ctx.fillStyle = fill
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill()
}
const circle = (ctx: Ctx, x: number, y: number, r: number, fill: string) => {
  ctx.fillStyle = fill
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
}
const glow = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
}
const shadow = (ctx: Ctx, x: number, y: number, rx: number, ry: number, a = 0.22) => {
  ctx.fillStyle = `rgba(0,0,0,${a})`
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
}

const CITY_BUILDINGS = [['#e8806b', '#f4a48f'], ['#e9c46a', '#f6dc8f'], ['#4cb8a8', '#7fd6c8'], ['#b39ddb', '#d1c4f0']]

// ───────── Obstacles ─────────
function drawObstacle(ctx: Ctx, look: Look, o: Rect, i: number, t: number, night: boolean) {
  const pal = look.palette
  round(ctx, o.x + 6, o.y + 10, o.w, o.h, 10, 'rgba(0,0,0,0.18)')
  if (look.id === 'city') {
    const [side, top] = CITY_BUILDINGS[i % CITY_BUILDINGS.length]
    round(ctx, o.x, o.y, o.w, o.h, 6, side)
    round(ctx, o.x, o.y - 10, o.w, o.h - 4, 6, top)
    // roof windows, lit up in the evening
    ctx.fillStyle = night ? 'rgba(255, 221, 140, 0.95)' : 'rgba(255, 255, 255, 0.45)'
    for (let wy = o.y - 2; wy < o.y + o.h - 20; wy += 14) for (let wx = o.x + 8; wx < o.x + o.w - 12; wx += 14) ctx.fillRect(wx, wy, 6, 6)
    return
  }
  round(ctx, o.x, o.y, o.w, o.h, 10, pal.obstacle)
  round(ctx, o.x, o.y - 8, o.w, o.h - 4, 10, pal.obstacleTop)
  if (look.id === 'orbital') {
    // light strip along each module: cyan normally, pulsing red on emergency power
    ctx.fillStyle = night ? `rgba(255, 90, 110, ${0.6 + 0.3 * Math.sin(t * 3 + i)})` : 'rgba(126, 230, 255, 0.85)'
    ctx.fillRect(o.x + 8, o.y + o.h - 9, o.w - 16, 3)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(o.x + 10, o.y + 2, o.w - 20, 4)
  }
}

// ───────── Pickups ─────────
function drawPickup(ctx: Ctx, look: Look, x: number, y: number, t: number, night: boolean) {
  const boost = night ? 1.6 : 1
  if (look.id === 'orbital') {
    // power cell: battery with a lightning bolt
    glow(ctx, x, y, 20 * boost, 'rgba(126, 230, 255, 0.55)')
    round(ctx, x - 6, y - 10, 12, 20, 3, '#dff9ff')
    round(ctx, x - 3, y - 13, 6, 4, 1, '#9aa3b8')
    round(ctx, x - 4, y - 6, 8, 12, 2, '#3fd3f5')
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.moveTo(x + 1, y - 5); ctx.lineTo(x - 2, y + 1); ctx.lineTo(x + 1, y + 1); ctx.lineTo(x - 1, y + 6); ctx.lineTo(x + 3, y - 1); ctx.lineTo(x, y - 1); ctx.closePath(); ctx.fill()
    return
  }
  if (look.id === 'city') {
    // parcel: cardboard box with tape
    if (night) glow(ctx, x, y, 22, 'rgba(255, 209, 102, 0.55)')
    shadow(ctx, x + 2, y + 9, 10, 4, 0.18)
    round(ctx, x - 9, y - 8, 18, 15, 2, '#c8915a')
    round(ctx, x - 9, y - 11, 18, 5, 2, '#dcaa72')
    ctx.fillStyle = '#f3e2b3'
    ctx.fillRect(x - 1.5, y - 11, 3, 18)
    return
  }
  // firefly: glowing body with little wings
  glow(ctx, x, y, 22 * boost, look.palette.glow)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  const flap = Math.sin(t * 18) * 0.6
  ctx.beginPath(); ctx.ellipse(x - 4, y - 3, 4, 2.5 + flap, -0.6, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + 4, y - 3, 4, 2.5 + flap, 0.6, 0, Math.PI * 2); ctx.fill()
  circle(ctx, x, y, 4.5, look.palette.pickup)
  circle(ctx, x, y + 2, 3, '#fff3b0')
}

// ───────── Player ─────────
function drawPlayer(ctx: Ctx, look: Look, x: number, y: number, vx: number) {
  if (look.id === 'orbital') {
    // astronaut: helmet, visor and backpack
    shadow(ctx, x + 3, y + 11, 12, 6)
    round(ctx, x - 13, y - 6, 6, 14, 2, '#9aa3b8')
    circle(ctx, x, y, 12, '#f4f6fb')
    const look2 = Math.sign(vx) * 2
    round(ctx, x - 6 + look2, y - 6, 13, 8, 4, '#2b3a67')
    ctx.fillStyle = 'rgba(126, 230, 255, 0.8)'
    ctx.fillRect(x - 3 + look2, y - 5, 4, 2)
    return
  }
  if (look.id === 'city') {
    // courier on a scooter
    shadow(ctx, x + 3, y + 12, 15, 6)
    round(ctx, x - 14, y + 4, 28, 7, 3, '#e05a47')
    circle(ctx, x - 11, y + 11, 3.5, '#2d2d38')
    circle(ctx, x + 11, y + 11, 3.5, '#2d2d38')
    circle(ctx, x, y - 2, 10, look.palette.player)
    circle(ctx, x, y - 6, 6, '#ffffff')
    ctx.fillStyle = '#e05a47'
    ctx.fillRect(x - 6, y - 7, 12, 2)
    return
  }
  shadow(ctx, x + 3, y + 10, 12, 6)
  circle(ctx, x, y, 12, look.palette.player)
  circle(ctx, x - 4, y - 4, 4, 'rgba(255,255,255,0.55)')
}

// ───────── Companions ─────────
function drawFox(ctx: Ctx, bx: number, by: number) {
  shadow(ctx, bx + 2, by + 9, 10, 5, 0.2)
  ctx.fillStyle = '#e0703a'
  ctx.beginPath(); ctx.ellipse(bx - 9, by + 2, 8, 4, -0.5, 0, Math.PI * 2); ctx.fill()
  circle(ctx, bx, by, 8, '#e8834a')
  ctx.beginPath(); ctx.moveTo(bx - 6, by - 4); ctx.lineTo(bx - 4, by - 13); ctx.lineTo(bx - 1, by - 5); ctx.fill()
  ctx.beginPath(); ctx.moveTo(bx + 1, by - 5); ctx.lineTo(bx + 4, by - 13); ctx.lineTo(bx + 6, by - 4); ctx.fill()
  circle(ctx, bx + 2, by + 3, 3.5, '#fff4e6')
  circle(ctx, bx + 3, by - 1, 1.3, '#1b1533')
}

function drawRobotDog(ctx: Ctx, bx: number, by: number, now: number, target?: { x: number; y: number }) {
  if (target) {
    // scanner cone toward the nearest power cell
    const a = Math.atan2(target.y - (by - 8), target.x - (bx + 12))
    ctx.fillStyle = 'rgba(63, 211, 245, 0.16)'
    ctx.beginPath(); ctx.moveTo(bx + 12, by - 8)
    ctx.arc(bx + 12, by - 8, 46, a - 0.25, a + 0.25); ctx.closePath(); ctx.fill()
  }
  shadow(ctx, bx + 1, by + 10, 12, 4.5, 0.25)
  const step = Math.sin(now / 90) * 1.5
  ctx.fillStyle = '#8b93a8'
  ctx.fillRect(bx - 8, by + 3, 3, 7 + step); ctx.fillRect(bx - 2, by + 3, 3, 7 - step); ctx.fillRect(bx + 4, by + 3, 3, 7 + step)
  round(ctx, bx - 11, by - 4, 20, 10, 4, '#e3e7f0')
  round(ctx, bx + 5, by - 11, 10, 9, 3, '#f4f6fb')
  round(ctx, bx + 9, by - 9, 6, 3, 1.5, '#3fd3f5')
  ctx.strokeStyle = '#8b93a8'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(bx + 8, by - 11); ctx.lineTo(bx + 7, by - 17); ctx.stroke()
  circle(ctx, bx + 7, by - 18, 2, '#ff6b8b')
  ctx.beginPath(); ctx.moveTo(bx - 11, by - 2); ctx.lineTo(bx - 16, by - 7 + step); ctx.stroke()
}

function drawDrone(ctx: Ctx, bx: number, by: number, now: number, target?: { x: number; y: number }) {
  const hover = by - 22 + Math.sin(now / 220) * 3
  shadow(ctx, bx, by + 8, 11, 4, 0.16)
  if (target) {
    // dashed guide line to the next parcel
    ctx.strokeStyle = 'rgba(224, 90, 71, 0.55)'; ctx.lineWidth = 2; ctx.setLineDash([5, 6])
    ctx.beginPath(); ctx.moveTo(bx, hover + 5); ctx.lineTo(target.x, target.y); ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.strokeStyle = '#9aa0ad'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(bx - 10, hover - 6); ctx.lineTo(bx + 10, hover + 6); ctx.moveTo(bx + 10, hover - 6); ctx.lineTo(bx - 10, hover + 6); ctx.stroke()
  const spin = now / 40
  for (const [rx, ry] of [[-10, -6], [10, -6], [-10, 6], [10, 6]]) {
    circle(ctx, bx + rx, hover + ry, 5.5, 'rgba(255,255,255,0.35)')
    ctx.strokeStyle = 'rgba(60,60,70,0.7)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(bx + rx - Math.cos(spin) * 5, hover + ry - Math.sin(spin) * 2); ctx.lineTo(bx + rx + Math.cos(spin) * 5, hover + ry + Math.sin(spin) * 2); ctx.stroke()
  }
  round(ctx, bx - 6, hover - 4, 12, 9, 3, '#ffffff')
  ctx.fillStyle = '#e05a47'
  ctx.fillRect(bx - 6, hover + 2, 12, 2)
  circle(ctx, bx, hover, 1.8, '#2d2d38')
}

// ───────── Atmosphere change: dusk, emergency power or evening rush ─────────
function drawLighting(ctx: Ctx, look: Look, t: number, obstacles: Rect[]) {
  if (look.id === 'orbital') {
    ctx.fillStyle = `rgba(90, 8, 30, ${0.42 + 0.06 * Math.sin(t * 2.4)})`
    ctx.fillRect(0, 0, W, H)
    return
  }
  if (look.id === 'city') {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(120, 60, 140, 0.45)'); g.addColorStop(1, 'rgba(255, 140, 70, 0.32)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    for (const o of obstacles) glow(ctx, o.x + o.w + 10, o.y + o.h + 8, 34, 'rgba(255, 214, 130, 0.5)')
    return
  }
  ctx.fillStyle = 'rgba(20, 18, 60, 0.45)'
  ctx.fillRect(0, 0, W, H)
}

/** Lights stay bright above the darkening overlay: red module strips, lit city windows. */
function drawLightsOnTop(ctx: Ctx, look: Look, t: number, obstacles: Rect[]) {
  obstacles.forEach((o, i) => {
    if (look.id === 'orbital') {
      ctx.fillStyle = `rgba(255, 90, 110, ${0.65 + 0.3 * Math.sin(t * 3 + i)})`
      ctx.fillRect(o.x + 8, o.y + o.h - 9, o.w - 16, 3)
      glow(ctx, o.x + o.w / 2, o.y + o.h - 8, o.w / 2, 'rgba(255, 70, 100, 0.18)')
    } else if (look.id === 'city') {
      ctx.fillStyle = 'rgba(255, 221, 140, 0.95)'
      for (let wy = o.y - 2; wy < o.y + o.h - 20; wy += 14) for (let wx = o.x + 8; wx < o.x + o.w - 12; wx += 14) ctx.fillRect(wx, wy, 6, 6)
    }
  })
}

export function StarterGame({
  look, running, resetKey, companion = false, night = false,
}: { look: Look; running: boolean; resetKey: number; companion?: boolean; night?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [won, setWon] = useState(false)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const pal = look.palette
    const level = makeLevel(7 + resetKey * 13 + look.id.length)
    const player = { x: W / 2, y: H / 2, vx: 0, vy: 0 }
    const buddy = { x: W / 2 - 30, y: H / 2 + 20 }
    const keys = new Set<string>()
    let target: { x: number; y: number } | null = null
    let collected = 0
    let elapsed = 0
    let last = performance.now()
    let raf = 0
    let done = false
    setScore(0)
    setTime(0)
    setWon(false)

    const down = (e: KeyboardEvent) => {
      if (!running) return
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        keys.add(k)
        target = null
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
    const click = (e: PointerEvent) => {
      if (!running) return
      const r = c.getBoundingClientRect()
      target = { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    c.addEventListener('pointerdown', click)

    const hit = (x: number, y: number) =>
      x < 12 || y < 12 || x > W - 12 || y > H - 12 ||
      level.obstacles.some((o) => x > o.x - 11 && x < o.x + o.w + 11 && y > o.y - 11 && y < o.y + o.h + 11)

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (running && !done) {
        elapsed += dt
        let ax = 0
        let ay = 0
        if (keys.has('arrowleft') || keys.has('a')) ax -= 1
        if (keys.has('arrowright') || keys.has('d')) ax += 1
        if (keys.has('arrowup') || keys.has('w')) ay -= 1
        if (keys.has('arrowdown') || keys.has('s')) ay += 1
        if (target) {
          const dx = target.x - player.x
          const dy = target.y - player.y
          const d = Math.hypot(dx, dy)
          if (d < 6) target = null
          else { ax = dx / d; ay = dy / d }
        }
        const len = Math.hypot(ax, ay) || 1
        const speed = 230
        player.vx += ((ax / len) * speed - player.vx) * Math.min(1, dt * 12)
        player.vy += ((ay / len) * speed - player.vy) * Math.min(1, dt * 12)
        const nx = player.x + player.vx * dt
        const ny = player.y + player.vy * dt
        if (!hit(nx, player.y)) player.x = nx; else { player.vx = 0; target = null }
        if (!hit(player.x, ny)) player.y = ny; else { player.vy = 0; target = null }
        for (const p of level.pickups) {
          if (!p.got && Math.hypot(p.x - player.x, p.y - player.y) < 20) {
            p.got = true
            collected++
            setScore(collected)
            if (collected === PICKUPS) { done = true; setWon(true) }
          }
        }
        setTime(Math.floor(elapsed))
      }

      const t = now / 1000
      // ground: checkerboard, plus road markings in the city and a deck grid on the station
      for (let y = 0; y < H; y += 50) for (let x = 0; x < W; x += 50) {
        ctx.fillStyle = (x + y) % 100 === 0 ? pal.ground : pal.groundAlt
        ctx.fillRect(x, y, 50, 50)
      }
      if (look.id === 'city') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        for (let x = 10; x < W; x += 40) ctx.fillRect(x, H / 2 - 1, 20, 2)
        for (let y = 10; y < H; y += 40) ctx.fillRect(W / 2 - 1, y, 2, 20)
      }
      if (look.id === 'orbital') {
        ctx.strokeStyle = 'rgba(126, 230, 255, 0.08)'; ctx.lineWidth = 1
        for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
        for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      }
      level.obstacles.forEach((o, i) => drawObstacle(ctx, look, o, i, t, night))
      if (night) { drawLighting(ctx, look, t, level.obstacles); drawLightsOnTop(ctx, look, t, level.obstacles) }
      for (const p of level.pickups) {
        if (!p.got) drawPickup(ctx, look, p.x, p.y + Math.sin(t * 3 + p.x) * 3, t, night)
      }

      // companion trails the player and points toward the nearest pickup
      if (companion) {
        const near = level.pickups.filter((p) => !p.got).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0]
        const tx = player.x - 28 + (near ? Math.sign(near.x - player.x) * 6 : 0)
        const ty = player.y + 18
        buddy.x += (tx - buddy.x) * Math.min(1, dt * 4)
        buddy.y += (ty - buddy.y) * Math.min(1, dt * 4)
        const bx = buddy.x, by = buddy.y + Math.sin(now / 160) * 1.5
        if (look.id === 'orbital') drawRobotDog(ctx, bx, by, now, near)
        else if (look.id === 'city') drawDrone(ctx, bx, by, now, near)
        else drawFox(ctx, bx, by)
      }
      drawPlayer(ctx, look, player.x, player.y, player.vx)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      c.removeEventListener('pointerdown', click)
    }
  }, [look, running, resetKey, companion, night])

  const icon = look.id === 'orbital' ? '⚡' : look.id === 'city' ? '📦' : '✦'
  const winText = look.id === 'orbital' ? 'Escape pod powered up!' : look.id === 'city' ? 'All parcels delivered!' : 'All fireflies collected!'
  return (
    <div className="game">
      <canvas ref={canvas} width={W} height={H} className="game__canvas" />
      <div className="game__hud">
        <span>{icon} {score}/{PICKUPS}</span>
        <span>{time}s</span>
      </div>
      {won && (
        <div className="game__overlay">
          <strong>{winText}</strong>
          <span>{time}s — not bad for a first build.</span>
        </div>
      )}
    </div>
  )
}
