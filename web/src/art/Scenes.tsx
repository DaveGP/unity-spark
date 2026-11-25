import { useId } from 'react'
import type { ReactNode } from 'react'

export type SceneId = 'woodland' | 'orbital' | 'city'

type Point = readonly [number, number, number?]
type Palette = readonly [string, string, string]

function project([x, y, z = 0]: Point): [number, number] {
  return [400 + x - y, 105 + (x + y) / 2 - z]
}

function polygon(...points: Point[]) {
  return points.map(point => project(point).join(',')).join(' ')
}

function Box({ x, y, w, d, h, z = 0, colors }: {
  x: number; y: number; w: number; d: number; h: number; z?: number; colors: Palette
}) {
  const top = z + h
  return <g>
    <polygon fill={colors[1]} points={polygon([x, y + d, top], [x + w, y + d, top], [x + w, y + d, z], [x, y + d, z])} />
    <polygon fill={colors[2]} points={polygon([x + w, y, top], [x + w, y + d, top], [x + w, y + d, z], [x + w, y, z])} />
    <polygon fill={colors[0]} points={polygon([x, y, top], [x + w, y, top], [x + w, y + d, top], [x, y + d, top])} />
  </g>
}

function Ground({ x, y, w, d, fill, z = 0 }: {
  x: number; y: number; w: number; d: number; fill: string; z?: number
}) {
  return <polygon fill={fill} points={polygon([x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z])} />
}

function At({ x, y, z, children }: { x: number; y: number; z?: number; children: ReactNode }) {
  const [sx, sy] = project([x, y, z])
  return <g transform={`translate(${sx} ${sy})`}>{children}</g>
}

function Frame({ label, prefix, sky, shadow, children, defs }: {
  label: string; prefix: string; sky: readonly [string, string]; shadow: string
  children: ReactNode; defs?: ReactNode
}) {
  return <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{display:'block'}} role="img" aria-label={label}>
    <defs>
      <linearGradient id={`${prefix}-sky`} x2="0" y2="1">
        <stop stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} />
      </linearGradient>
      <radialGradient id={`${prefix}-shadow`}>
        <stop stopColor={shadow} stopOpacity=".46" /><stop offset="1" stopColor={shadow} stopOpacity="0" />
      </radialGradient>
      {defs}
    </defs>
    <rect width="800" height="500" fill={`url(#${prefix}-sky)`} />
    <ellipse cx="400" cy="425" rx="270" ry="49" fill={`url(#${prefix}-shadow)`} />
    {children}
  </svg>
}

const treePositions = [
  [24, 26], [51, 24], [83, 27], [117, 24], [147, 28], [183, 23],
  [225, 30], [254, 42], [26, 63], [23, 102], [29, 143], [31, 184],
  [35, 231], [62, 254], [96, 252], [241, 105], [257, 139], [253, 174],
  [253, 223], [223, 251], [186, 257],
]

function Tree({ x, y, size, crown }: { x: number; y: number; size: number; crown: string }) {
  return <At x={x} y={y}>
    <g transform={`scale(${size})`}>
      <ellipse rx="21" ry="8" cx="4" fill="#344d3b" opacity=".19" />
      <path d="M-4 1 -3-27 3-30 4 1 0 4Z" fill="#906347" />
      <path d="M0-12 10-24" stroke="#a77954" strokeWidth="3" />
      <circle cx="9" cy="-27" r="16" fill="#4b8e61" />
      <circle cx="-10" cy="-28" r="16" fill={crown} />
      <circle cx="1" cy="-43" r="20" fill={crown} />
      <ellipse cx="-6" cy="-50" rx="9" ry="5" transform="rotate(-20 -6 -50)" fill="#e9ffd1" opacity=".34" />
    </g>
  </At>
}

function Cottage() {
  return <g>
    <Box x={98} y={77} w={61} d={49} h={40} colors={['#ffe2ab', '#dca46b', '#ae744e']} />
    <polygon fill="#f8c181" points={polygon([98, 126, 40], [159, 126, 40], [128.5, 126, 69])} />
    <polygon fill="#ed9258" points={polygon([92, 71, 39], [128.5, 71, 72], [128.5, 132, 72], [92, 132, 39])} />
    <polygon fill="#c75d42" points={polygon([128.5, 71, 72], [165, 71, 39], [165, 132, 39], [128.5, 132, 72])} />
    {[79, 90, 101, 112, 123, 132].map(y => <polyline key={y} points={polygon([92, y, 39], [128.5, y, 72], [165, y, 39])} fill="none" stroke="#8e4737" strokeOpacity=".35" strokeWidth="1.4" />)}
    <Box x={143} y={88} w={10} d={10} h={19} z={51} colors={['#eead89', '#b77058', '#8b5244']} />
    <polygon fill="#724a3b" points={polygon([120, 126, 0], [135, 126, 0], [135, 126, 25], [120, 126, 25])} />
    <At x={131} y={126} z={11}><circle r="1.5" fill="#ffd883" /></At>
    {[103, 141].map(x => <polygon key={x} fill="#ffe69b" stroke="#895641" strokeWidth="2" points={polygon([x, 126, 16], [x + 10, 126, 16], [x + 10, 126, 29], [x, 126, 29])} />)}
  </g>
}

export function WoodlandScene() {
  const prefix = `wd-${useId()}`
  const ref = (name: string) => `url(#${prefix}-${name})`
  const [pondX, pondY] = project([203, 151])
  const path = Array.from({ length: 23 }, (_, i) => {
    const t = i / 22
    return { x: 128 + Math.sin(t * Math.PI * 2) * 18 + t * 15, y: 131 + t * 146 }
  })
  const objects = [
    ...treePositions.map(([x, y], i) => ({
      depth: x + y,
      art: <Tree key={`tree-${i}`} x={x} y={y} size={.77 + (i * 13 % 10) * .045} crown={ref(`leaf-${i % 3}`)} />,
    })),
    { depth: 285, art: <Cottage key="cottage" /> },
  ].sort((a, b) => a.depth - b.depth)
  return <Frame label="Woodland cottage on a floating forest island" prefix={prefix} sky={['#fbd6c5', '#daf2df']} shadow="#57664f" defs={<>
    <linearGradient id={`${prefix}-grass`} x2=".75" y2="1"><stop stopColor="#d6ed9e" /><stop offset="1" stopColor="#83be7e" /></linearGradient>
    <linearGradient id={`${prefix}-water`} x2=".2" y2="1"><stop stopColor="#a5f2dc" /><stop offset="1" stopColor="#53b7b9" /></linearGradient>
    {['#639d58', '#438763', '#75aa63'].map((color, i) => <radialGradient key={color} id={`${prefix}-leaf-${i}`} cx=".32" cy=".23" r=".8">
      <stop stopColor={['#c5e79b', '#a5dba2', '#d2e9a1'][i]} /><stop offset="1" stopColor={color} />
    </radialGradient>)}
  </>}>
    <circle cx="608" cy="115" r="38" fill="#fff1cd" opacity=".72" />
    <path d="M123 153h103m-88-8h52M603 179h83m-53-8h42" stroke="#fff9e9" strokeWidth="3" opacity=".65" strokeLinecap="round" />
    <Box x={0} y={0} w={280} d={280} h={30} z={-36} colors={['#aa8764', '#ac7e60', '#835d55']} />
    <Box x={0} y={0} w={280} d={280} h={7} z={-7} colors={[ref('grass'), '#80a963', '#5e8e62']} />
    {Array.from({ length: 36 }, (_, i) => {
      const [x, y] = project(i % 2 ? [280, (i * 43) % 272 + 4, -13 - i % 16] : [(i * 43) % 272 + 4, 280, -13 - i % 16])
      return <path key={i} d={`M${x} ${y}l${i % 2 ? -4 : 4} 2 4-1z`} fill={i % 3 ? '#f2c39a' : '#593f40'} opacity=".36" />
    })}
    <g transform={`translate(${pondX} ${pondY})`}>
      <path d="M-47 3C-48-13-22-20 1-17S45-19 49-4 23 21 0 21-44 15-47 3Z" fill="#78a86e" />
      <path d="M-42 2C-44-9-22-17 1-14S41-16 44-3 20 17 0 17-38 13-42 2Z" fill={ref('water')} />
      <path d="M-31 3q8 3 16 0m10-8q10 3 22 0m-8 13q8 2 17-1" fill="none" stroke="#ddfff0" strokeLinecap="round" opacity=".75" />
      <ellipse cx="27" cy="-6" rx="6" ry="3" fill="#619e62" /><circle cx="28" cy="-8" r="2.4" fill="#ffd2dc" />
    </g>
    <polyline points={polygon(...path.map(({ x, y }): Point => [x, y]))} fill="none" stroke="#e1d3a6" strokeWidth="12" strokeLinecap="round" />
    {path.map(({ x, y }, i) => <At key={i} x={x} y={y}><ellipse rx={4 + i % 4} ry={2 + i % 2} fill={['#a9a38c', '#eee2bc', '#c4b598'][i % 3]} /></At>)}
    {Array.from({ length: 66 }, (_, i) => {
      const x = 15 + (i * 53 % 249)
      const y = 14 + (i * 71 % 249)
      if ((x > 92 && x < 170 && y < 135) || (x > 166 && y > 113 && y < 191) || (y > 125 && x > 106 && x < 167)) return null
      return <At key={i} x={x} y={y}>
        <path d="M0 1q0-5-3-6m3 6 3-4" fill="none" stroke="#639655" strokeWidth="1" />
        {i % 3 !== 0 && <><circle cy="-5" r="2.6" fill={i % 2 ? '#f7a9c6' : '#ad85ce'} /><circle cy="-5" r=".8" fill="#fff2b0" /></>}
      </At>
    })}
    {objects.map(({ art }) => art)}
  </Frame>
}

function Windows({ x, y, w, d, h, rows, columns, colors }: {
  x: number; y: number; w: number; d: number; h: number; rows: number; columns: number; colors: readonly [string, string]
}) {
  return <g>
    {[w, d].map((length, side) => {
      const cell = (length - 10) / columns
      const floor = (h - 9) / rows
      return Array.from({ length: rows * columns }, (_, i) => {
        const a = 5 + (i % columns) * cell
        const b = a + cell * .72
        const low = 5 + Math.floor(i / columns) * floor
        const high = low + floor * .53
        const face = (along: number, z: number): Point => side === 0 ? [x + along, y + d, z] : [x + w, y + along, z]
        return <polygon key={`${side}-${i}`} points={polygon(face(a, low), face(b, low), face(b, high), face(a, high))} fill={colors[side]} opacity={i % 7 === 3 ? .43 : .94} />
      })
    })}
  </g>
}

const modules = [
  [24, 27, 48, 37, 37], [89, 28, 43, 36, 64], [149, 29, 38, 37, 32],
  [210, 30, 45, 48, 49], [23, 94, 40, 45, 49], [82, 98, 53, 44, 34],
  [25, 161, 44, 39, 30], [103, 202, 50, 49, 42],
]

export function OrbitalScene() {
  const prefix = `ob-${useId()}`
  const ref = (name: string) => `url(#${prefix}-${name})`
  return <Frame label="Orbital outpost on a floating landing platform" prefix={prefix} sky={['#10152e', '#32234e']} shadow="#09091d" defs={<>
    <radialGradient id={`${prefix}-nebula`}><stop stopColor="#9867d3" stopOpacity=".38" /><stop offset="1" stopColor="#724fc6" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${prefix}-glass`} cx=".3" cy=".2" r=".84"><stop stopColor="#d5ffff" /><stop offset=".44" stopColor="#68bbdb" /><stop offset="1" stopColor="#48477c" /></radialGradient>
    <linearGradient id={`${prefix}-deck`} x2=".8" y2="1"><stop stopColor="#a0b0c9" /><stop offset="1" stopColor="#596884" /></linearGradient>
  </>}>
    <ellipse cx="521" cy="150" rx="290" ry="112" transform="rotate(-17 521 150)" fill={ref('nebula')} />
    {Array.from({ length: 125 }, (_, i) => <circle key={i} cx={(i * 173 + 23) % 800} cy={(i * i * 47 + 11 * i + 13) % 483} r={i % 13 === 0 ? 1.7 : .45 + i % 4 * .22} fill={i % 5 ? '#d8ebff' : '#d2a6ff'} opacity={.28 + i % 7 * .099} />)}
    <Box x={0} y={0} w={280} d={280} h={28} z={-29} colors={['#899bb2', '#485676', '#303954']} />
    <Box x={0} y={0} w={280} d={280} h={8} z={-8} colors={[ref('deck'), '#8596b1', '#647291']} />
    {Array.from({ length: 13 }, (_, i) => <g key={i}>
      <polygon fill="#26334b" points={polygon([i * 21 + 9, 280, -11], [i * 21 + 23, 280, -11], [i * 21 + 23, 280, -23], [i * 21 + 9, 280, -23])} />
      <polygon fill={i % 3 ? '#73ddee' : '#bdabff'} points={polygon([280, i * 21 + 9, -12], [280, i * 21 + 19, -12], [280, i * 21 + 19, -15], [280, i * 21 + 9, -15])} />
    </g>)}
    <polygon points={polygon([8, 8], [272, 8], [272, 272], [8, 272])} fill="none" stroke="#d9eeff" strokeOpacity=".57" strokeWidth="1.5" />
    <Ground x={8} y={77} w={264} d={12} fill="#485973" />
    <Ground x={184} y={89} w={12} d={183} fill="#485973" />
    <polyline points={polygon([15, 83], [190, 83], [190, 266])} fill="none" stroke="#adf4f9" strokeWidth="1.5" strokeDasharray="6 6" />
    <At x={231} y={207}>
      <ellipse rx="56" ry="28" fill="#35435f" stroke="#adbbd4" strokeWidth="2" />
      <ellipse rx="43" ry="21.5" fill="none" stroke="#76edff" strokeWidth="9" opacity=".22" />
      <ellipse rx="43" ry="21.5" fill="none" stroke="#a7f9ff" strokeWidth="2.5" />
      <path d="M-10 7 0-13M0 13 10-7M-5-3 5 3" stroke="#f0f6ff" strokeWidth="3" />
      <circle cx="-50" r="2.2" fill="#ffcc8a" /><circle cx="50" r="2.2" fill="#ffcc8a" />
    </At>
    {modules.map(([x, y, w, d, h], i) => ({ x, y, w, d, h, i })).sort((a, b) => a.x + a.y - b.x - b.y).map(({ x, y, w, d, h, i }) => <g key={i}>
      <Box x={x} y={y} w={w} d={d} h={h} colors={['#f1f6ff', '#b7c5d9', '#7888a5']} />
      <Windows x={x} y={y} w={w} d={d} h={h} rows={2} columns={1} colors={i % 2 ? ['#7256c3', '#e4bbff'] : ['#1685a9', '#a0f9ff']} />
      <Box x={x + 5} y={y + 5} w={w - 10} d={d - 10} h={4} z={h} colors={['#cddcef', '#96a8c2', '#7385aa']} />
      <Ground x={x + 9} y={y + 9} w={w - 18} d={6} z={h + 4} fill={i % 2 ? '#aa98d9' : '#7fbacb'} />
      {i === 1 && <At x={x + 19} y={y + 16} z={h + 4}>
        <path d="M0 0v-39m-12 15 24 8m-19-17 14 4" fill="none" stroke="#d5dbf4" strokeWidth="2" />
        <circle cy="-39" r="3.2" fill="#f0aaf7" />
      </At>}
    </g>)}
    <At x={144} y={155}>
      <ellipse rx="37" ry="18" cy="-1" fill="#414d69" />
      <ellipse rx="34" ry="17" cy="-6" fill="#d5dfed" />
      <path d="M-30-8C-30-46 30-46 30-8 30 9-30 9-30-8Z" fill={ref('glass')} stroke="#d3faff" strokeWidth="1.3" />
      <path d="M-30-8Q0 9 30-8M0-36C-18-31-24-11-18 2M0-36C18-31 24-11 18 2" fill="none" stroke="#e4faff" opacity=".55" />
    </At>
  </Frame>
}

const cityColors: Palette[] = [
  ['#ffc3aa', '#ee8c80', '#bb625e'],
  ['#a9e5d6', '#66bfb1', '#448d90'],
  ['#fff0ae', '#ebc771', '#bb9355'],
  ['#e5d4fc', '#ba9fdf', '#8974b1'],
]

const buildings = [
  [20, 24, 42, 46, 48], [75, 26, 49, 39, 72], [25, 82, 42, 42, 63],
  [78, 82, 42, 42, 38], [179, 22, 32, 40, 57], [222, 22, 37, 40, 82],
  [178, 79, 39, 47, 37], [226, 78, 33, 47, 53], [24, 191, 39, 43, 44],
  [74, 190, 46, 44, 64], [216, 192, 43, 49, 43],
]

export function CityScene() {
  const prefix = `ct-${useId()}`
  const ref = (name: string) => `url(#${prefix}-${name})`
  return <Frame label="Pastel city block on a floating island" prefix={prefix} sky={['#fff4d5', '#f6cad5']} shadow="#785b77" defs={
    <linearGradient id={`${prefix}-asphalt`} x2=".8" y2="1"><stop stopColor="#858794" /><stop offset="1" stopColor="#6d6f81" /></linearGradient>
  }>
    <circle cx="605" cy="114" r="43" fill="#ffe2a9" opacity=".7" />
    <path d="M99 147q16-15 35-5 13-22 37-7 28-3 43 12ZM595 179q18-16 41-7 21-24 47-6 19-3 34 13Z" fill="#fff9ee" opacity=".8" />
    <Box x={0} y={0} w={280} d={280} h={27} z={-27} colors={[ref('asphalt'), '#777380', '#514f64']} />
    <polygon points={polygon([0, 280, -8], [280, 280, -8], [280, 0, -8])} fill="none" stroke="#b4a9b1" strokeWidth="1.4" />
    {[[10, 10, 122, 125], [169, 10, 101, 125], [10, 181, 122, 89], [169, 181, 101, 89]].map(([x, y, w, d]) => <Box key={`${x}-${y}`} x={x} y={y} w={w} d={d} h={3} colors={['#e9dcd2', '#b3a6a7', '#968a95']} />)}
    <polyline points={polygon([150, 4], [150, 278])} fill="none" stroke="#ffe0a4" strokeDasharray="8 8" strokeWidth="1.6" />
    <polyline points={polygon([4, 158], [276, 158])} fill="none" stroke="#ffe0a4" strokeDasharray="8 8" strokeWidth="1.6" />
    {Array.from({ length: 5 }, (_, i) => <g key={i}>
      <Ground x={134 + i * 7} y={136} w={3.4} d={10} fill="#fff4df" />
      <Ground x={134 + i * 7} y={170} w={3.4} d={10} fill="#fff4df" />
      <Ground x={132} y={138 + i * 9} w={10} d={4} fill="#fff4df" />
      <Ground x={159} y={138 + i * 9} w={10} d={4} fill="#fff4df" />
    </g>)}
    <Box x={76} y={162} w={21} d={10} h={5} colors={['#ffad94', '#e46b70', '#a94f62']} />
    <Box x={80} y={163} w={12} d={8} h={4} z={5} colors={['#ffe5d9', '#8da9b7', '#626d86']} />
    {[80, 93].map(x => <At key={x} x={x} y={172}><ellipse rx="2.3" ry="2.9" fill="#3c3d51" /></At>)}
    <Ground x={175} y={188} w={32} d={66} z={3} fill="#a8c593" />
    {[
      ...buildings.map(([x, y, w, d, h], i) => ({
        depth: x + y + w + d,
        art: <g key={`building-${i}`}>
          <Box x={x} y={y} w={w} d={d} h={h} colors={cityColors[i % 4]} />
          <Windows x={x} y={y} w={w} d={d} h={h} rows={Math.max(2, Math.floor(h / 13))} columns={3} colors={['#fff2d9', '#455878']} />
          <Box x={x - 2} y={y - 2} w={w + 4} d={d + 4} h={4} z={h} colors={cityColors[i % 4]} />
          <Box x={x + 7} y={y + 8} w={w / 3} d={d / 3} h={6} z={h + 4} colors={['#f8eee5', '#b9aeb9', '#8c859b']} />
        </g>,
      })),
      ...[[17, 125], [65, 128], [108, 127], [181, 198], [198, 216], [183, 239], [202, 249], [250, 262], [36, 258], [87, 252], [121, 243]].map(([x, y], i) => ({
        depth: x + y,
        art: <Tree key={`tree-${i}`} x={x} y={y} size={.37 + i % 3 * .05} crown={['#8bb872', '#95c88a', '#78ae83'][i % 3]} />,
      })),
    ].sort((a, b) => a.depth - b.depth).map(({ art }) => art)}
  </Frame>
}

export function Scene({ id }: { id: SceneId }) {
  switch (id) {
    case 'woodland': return <WoodlandScene />
    case 'orbital': return <OrbitalScene />
    case 'city': return <CityScene />
  }
}
