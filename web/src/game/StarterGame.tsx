import { useEffect, useRef, useState } from 'react'
import type { Look } from '../lib/looks'

/*
 * The "first playable" Spark hands back: a tiny top-down collect-the-sparks
 * game themed with the chosen look's palette. Arrow keys / WASD, or click to
 * steer toward a point.
 */

const W = 800
const H = 500
const PICKUPS = 10

interface Rect { x: number; y: number; w: number; h: number }

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

export function StarterGame({ look, running, resetKey, fox = false, night = false }: { look: Look; running: boolean; resetKey: number; fox?: boolean; night?: boolean }) {
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

      // ground checker
      for (let y = 0; y < H; y += 50) for (let x = 0; x < W; x += 50) {
        ctx.fillStyle = (x + y) % 100 === 0 ? pal.ground : pal.groundAlt
        ctx.fillRect(x, y, 50, 50)
      }
      if (night) {
        ctx.fillStyle = 'rgba(20, 18, 60, 0.45)'
        ctx.fillRect(0, 0, W, H)
      }
      // obstacles with a faux top face
      for (const o of level.obstacles) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.beginPath(); ctx.roundRect(o.x + 6, o.y + 10, o.w, o.h, 10); ctx.fill()
        ctx.fillStyle = pal.obstacle
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 10); ctx.fill()
        ctx.fillStyle = pal.obstacleTop
        ctx.beginPath(); ctx.roundRect(o.x, o.y - 8, o.w, o.h - 4, 10); ctx.fill()
      }
      // pickups
      const t = now / 1000
      for (const p of level.pickups) {
        if (p.got) continue
        const bob = Math.sin(t * 3 + p.x) * 3
        const g = ctx.createRadialGradient(p.x, p.y + bob, 0, p.x, p.y + bob, 22)
        g.addColorStop(0, pal.glow); g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y + bob, 22, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = pal.pickup
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t
          const r = i % 2 ? 4 : 9
          ctx.lineTo(p.x + Math.cos(a) * r, p.y + bob + Math.sin(a) * r)
        }
        ctx.fill()
      }
      // fox companion trails the player and leans toward the nearest firefly
      if (fox) {
        const near = level.pickups.filter((p) => !p.got).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0]
        const tx = player.x - 28 + (near ? Math.sign(near.x - player.x) * 6 : 0)
        const ty = player.y + 18
        buddy.x += (tx - buddy.x) * Math.min(1, dt * 4)
        buddy.y += (ty - buddy.y) * Math.min(1, dt * 4)
        const bx = buddy.x, by = buddy.y + Math.sin(now / 160) * 1.5
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.beginPath(); ctx.ellipse(bx + 2, by + 9, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#e0703a'
        ctx.beginPath(); ctx.ellipse(bx - 9, by + 2, 8, 4, -0.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#e8834a'
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.moveTo(bx - 6, by - 4); ctx.lineTo(bx - 4, by - 13); ctx.lineTo(bx - 1, by - 5); ctx.fill()
        ctx.beginPath(); ctx.moveTo(bx + 1, by - 5); ctx.lineTo(bx + 4, by - 13); ctx.lineTo(bx + 6, by - 4); ctx.fill()
        ctx.fillStyle = '#fff4e6'
        ctx.beginPath(); ctx.arc(bx + 2, by + 3, 3.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#1b1533'
        ctx.beginPath(); ctx.arc(bx + 3, by - 1, 1.3, 0, Math.PI * 2); ctx.fill()
      }
      // player
      ctx.fillStyle = 'rgba(0,0,0,0.22)'
      ctx.beginPath(); ctx.ellipse(player.x + 3, player.y + 10, 12, 6, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = pal.player
      ctx.beginPath(); ctx.arc(player.x, player.y, 12, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.beginPath(); ctx.arc(player.x - 4, player.y - 4, 4, 0, Math.PI * 2); ctx.fill()

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      c.removeEventListener('pointerdown', click)
    }
  }, [look, running, resetKey, fox, night])

  return (
    <div className="game">
      <canvas ref={canvas} width={W} height={H} className="game__canvas" />
      <div className="game__hud">
        <span>✦ {score}/{PICKUPS}</span>
        <span>{time}s</span>
      </div>
      {won && (
        <div className="game__overlay">
          <strong>All collected!</strong>
          <span>{time}s — not bad for a first build.</span>
        </div>
      )}
    </div>
  )
}
