import type { SceneId } from '../art/Scenes'

export type LookId = SceneId

export interface Look {
  id: LookId
  index: string
  category: string
  name: string
  blurb: string
  style: string
  pack: string
  tags: string[]
  aboutTitle: string
  about: string
  adjustments: string[]
  /** Colours the starter game uses so it feels like the chosen look. */
  palette: {
    ground: string
    groundAlt: string
    obstacle: string
    obstacleTop: string
    player: string
    pickup: string
    glow: string
  }
}

export const LOOKS: Record<LookId, Look> = {
  woodland: {
    id: 'woodland',
    index: '01',
    category: 'Nature',
    name: 'Enchanted woodland',
    blurb: 'A softer, storybook look with expressive foliage, cozy props and organic shapes.',
    style: 'Stylized 3D',
    pack: 'Environments + props',
    tags: ['Stylized 3D', 'Nature'],
    aboutTitle: 'Storybook shapes. A softer world.',
    about:
      'Expressive foliage, cozy props and organic shapes give the same game a more inviting visual direction.',
    adjustments: ['Warmer lighting', 'Denser foliage', 'Try another pack'],
    palette: {
      ground: '#a9cf8e',
      groundAlt: '#98c27c',
      obstacle: '#4f8a4a',
      obstacleTop: '#6fae5f',
      player: '#f0a45d',
      pickup: '#f7d774',
      glow: 'rgba(255, 236, 170, 0.55)',
    },
  },
  orbital: {
    id: 'orbital',
    index: '02',
    category: 'Sci-fi',
    name: 'Orbital outpost',
    blurb: 'A futuristic palette with modular spaces, clean silhouettes and luminous details.',
    style: 'Modular 3D',
    pack: 'Environments + props',
    tags: ['Modular 3D', 'Sci-fi'],
    aboutTitle: 'Clean lines. Luminous details.',
    about:
      'Modular structures, cool metals and glowing trims turn the same layout into a quiet outpost at the edge of space.',
    adjustments: ['Brighter neon', 'More modules', 'Try another pack'],
    palette: {
      ground: '#2a2f45',
      groundAlt: '#262a3e',
      obstacle: '#8d93a8',
      obstacleTop: '#c9cdd8',
      player: '#7ee6ff',
      pickup: '#b69cff',
      glow: 'rgba(126, 230, 255, 0.5)',
    },
  },
  city: {
    id: 'city',
    index: '03',
    category: 'Urban',
    name: 'Pocket city',
    blurb: 'A playful everyday world built from colorful streets, buildings and vehicles.',
    style: 'Low-poly 3D',
    pack: 'Environments + props',
    tags: ['Low-poly 3D', 'Urban'],
    aboutTitle: 'Bright blocks. Busy streets.',
    about:
      'Chunky low-poly buildings and candy-coloured streets make the same game feel lively, readable and friendly.',
    adjustments: ['Sunset palette', 'Busier streets', 'Try another pack'],
    palette: {
      ground: '#d9d4cc',
      groundAlt: '#cfc9c0',
      obstacle: '#e8806b',
      obstacleTop: '#f4a48f',
      player: '#4cb8a8',
      pickup: '#ffd166',
      glow: 'rgba(255, 209, 102, 0.55)',
    },
  },
}

export const LOOK_ORDER: LookId[] = ['woodland', 'orbital', 'city']

/** Picks the look that best matches the user's idea, so Spark can flag a recommendation. */
export function recommendLook(prompt: string): LookId {
  const p = prompt.toLowerCase()
  if (/(space|sci|robot|galax|planet|station|alien|future|cyber|mech)/.test(p)) return 'orbital'
  if (/(city|town|street|car|traffic|urban|shop|delivery|build)/.test(p)) return 'city'
  return 'woodland'
}
