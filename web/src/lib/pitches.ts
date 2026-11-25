// Ten ready-made game pitches, each built around a different Synty POLYGON asset pack.
// When a new project starts, Spark picks the one that best fits the user's profile
// (favourite games first, then genres, settings, mood and what they enjoy) and keeps
// the rest as "more options".

import type { LookId } from './looks'
import type { Profile, ProfileValue } from './flow'

export interface Pitch {
  id: string
  title: string
  /** The Synty pack the idea is built with. */
  pack: string
  packUrl: string
  /** Local copy of the pack's store image. */
  image: string
  /** Which starter look the first build uses. */
  look: LookId
  blurb: string
  prompt: string
  /** What the pitch keeps from the games that inspired it, for the "why" line. */
  feel: string
  /** Favourite games that point to this pitch: [pattern, display name]. */
  games: [RegExp, string][]
  genres: string[]
  settings: string[]
  moods: string[]
  enjoys: string[]
  /** Play style that suits it best. */
  play?: 'Relaxed' | 'Challenging'
}

const synty = (handle: string) => `https://syntystore.com/products/${handle}`

export const PITCHES: Pitch[] = [
  {
    id: 'palm-city', title: 'Palm City heist', pack: 'POLYGON Palm City', packUrl: synty('polygon-palm-city'), image: 'assets/palm-city.jpg', look: 'city',
    blurb: 'Plan the job, grab the loot and escape in a getaway car.',
    prompt: 'A heist game set in a sunny coastal city, built with Synty’s POLYGON Palm City pack. Plan the job, grab the loot and escape in a getaway car before the police close in.',
    feel: 'sunny city, cars-and-chases feel',
    games: [[/gta|grand theft/i, 'GTA'], [/saints row/i, 'Saints Row'], [/watch ?dogs/i, 'Watch Dogs'], [/mafia/i, 'Mafia'], [/sleeping dogs/i, 'Sleeping Dogs']],
    genres: ['Open world', 'Action'], settings: ['Modern city'], moods: ['Tense', 'Epic'], enjoys: ['Exploring', 'Competing'],
  },
  {
    id: 'fantasy-kingdom', title: 'Kingdom quest', pack: 'POLYGON Fantasy Kingdom', packUrl: synty('polygon-fantasy-kingdom'), image: 'assets/synty/polygon-fantasy-kingdom.jpg', look: 'woodland',
    blurb: 'Help the villagers and win back a stolen crown.',
    prompt: 'A fantasy adventure in a small medieval kingdom, built with Synty’s POLYGON Fantasy Kingdom pack. Explore the town and countryside, help the villagers and recover the stolen crown from a goblin camp.',
    feel: 'sense of a quest through a living fantasy world',
    games: [[/zelda/i, 'Zelda'], [/skyrim|elder scrolls/i, 'Skyrim'], [/elden ring/i, 'Elden Ring'], [/fable/i, 'Fable'], [/witcher/i, 'The Witcher'], [/baldur/i, 'Baldur’s Gate'], [/dragon (quest|age)/i, 'Dragon Quest']],
    genres: ['Open world', 'Action'], settings: ['Fantasy'], moods: ['Epic'], enjoys: ['Story', 'Exploring'],
  },
  {
    id: 'farm', title: 'Sunny Acres farm', pack: 'POLYGON Farm', packUrl: synty('polygon-farm'), image: 'assets/synty/polygon-farm.jpg', look: 'woodland',
    blurb: 'Grow crops, look after animals and sell at the market.',
    prompt: 'A cozy farming game built with Synty’s POLYGON Farm pack. Plant and harvest crops, look after your animals and sell your produce at the weekend market to grow the farm.',
    feel: 'cozy routine of tending a farm',
    games: [[/stardew/i, 'Stardew Valley'], [/animal crossing/i, 'Animal Crossing'], [/harvest moon|story of seasons/i, 'Harvest Moon'], [/farming sim/i, 'Farming Simulator'], [/hay day/i, 'Hay Day']],
    genres: ['Cozy / life sim'], settings: ['Nature'], moods: ['Calm'], enjoys: ['Building and creating', 'Collecting'], play: 'Relaxed',
  },
  {
    id: 'sci-fi-space', title: 'Derelict station salvage', pack: 'POLYGON Sci-Fi Space', packUrl: synty('polygon-sci-fi-space'), image: 'assets/synty/polygon-sci-fi-space.jpg', look: 'orbital',
    blurb: 'Salvage a drifting station and restore power before the air runs out.',
    prompt: 'A sci-fi exploration game built with Synty’s POLYGON Sci-Fi Space pack. Board a drifting space station, salvage parts, solve power puzzles and get the engines running before your oxygen runs out.',
    feel: 'sci-fi feel of exploring somewhere vast and unknown',
    games: [[/halo/i, 'Halo'], [/no man/i, 'No Man’s Sky'], [/starfield/i, 'Starfield'], [/mass effect/i, 'Mass Effect'], [/dead space/i, 'Dead Space'], [/subnautica/i, 'Subnautica'], [/outer wilds/i, 'Outer Wilds'], [/destiny/i, 'Destiny'], [/elite/i, 'Elite Dangerous']],
    genres: ['Action', 'Puzzle'], settings: ['Sci-fi'], moods: ['Tense', 'Epic'], enjoys: ['Exploring', 'Solving puzzles'],
  },
  {
    id: 'apocalypse', title: 'Last light survival', pack: 'POLYGON Apocalypse', packUrl: synty('polygon-apocalypse'), image: 'assets/synty/polygon-apocalypse.jpg', look: 'city',
    blurb: 'Scavenge by day and hold your safehouse through the night.',
    prompt: 'A survival game in a ruined town, built with Synty’s POLYGON Apocalypse pack. Scavenge supplies by day, then barricade your safehouse and hold out against the zombies through the night.',
    feel: 'tense scavenge-and-survive loop',
    games: [[/last of us/i, 'The Last of Us'], [/dayz/i, 'DayZ'], [/state of decay/i, 'State of Decay'], [/7 days/i, '7 Days to Die'], [/fallout/i, 'Fallout'], [/resident evil/i, 'Resident Evil'], [/left 4 dead/i, 'Left 4 Dead'], [/days gone/i, 'Days Gone']],
    genres: ['Action', 'Strategy'], settings: ['Horror', 'Modern city'], moods: ['Tense', 'Spooky'], enjoys: ['Building and creating', 'Playing with friends'], play: 'Challenging',
  },
  {
    id: 'pirate', title: 'Treasure island crew', pack: 'POLYGON Pirate Pack', packUrl: synty('polygon-pirate-pack'), image: 'assets/synty/polygon-pirate-pack.jpg', look: 'woodland',
    blurb: 'Sail between islands, follow maps and dig up treasure.',
    prompt: 'A pirate adventure built with Synty’s POLYGON Pirate Pack. Sail your ship between small islands, follow treasure maps, dig up loot and outrun rival pirates.',
    feel: 'sense of sailing off to find treasure',
    games: [[/sea of thieves/i, 'Sea of Thieves'], [/black flag/i, 'Assassin’s Creed Black Flag'], [/monkey island/i, 'Monkey Island'], [/skull and bones/i, 'Skull and Bones']],
    genres: ['Open world', 'Action'], settings: ['Historical', 'Fantasy'], moods: ['Funny', 'Epic'], enjoys: ['Exploring', 'Collecting', 'Playing with friends'], play: 'Relaxed',
  },
  {
    id: 'western', title: 'Frontier outlaw', pack: 'POLYGON Western', packUrl: synty('polygon-western'), image: 'assets/synty/polygon-western.jpg', look: 'city',
    blurb: 'Take bounty jobs and face off in high-noon duels.',
    prompt: 'A Wild West adventure built with Synty’s POLYGON Western pack. Ride into a frontier town, take on bounty jobs and face rival outlaws in high-noon duels.',
    feel: 'frontier story with showdowns',
    games: [[/red dead|rdr/i, 'Red Dead Redemption'], [/desperados/i, 'Desperados'], [/westworld|wild west/i, 'Wild West games']],
    genres: ['Open world', 'Action'], settings: ['Historical'], moods: ['Tense', 'Epic'], enjoys: ['Story', 'Competing'],
  },
  {
    id: 'street-racer', title: 'Midnight street racer', pack: 'POLYGON Street Racer', packUrl: synty('polygon-street-racer'), image: 'assets/synty/polygon-street-racer.jpg', look: 'city',
    blurb: 'Drift through city streets and upgrade your car.',
    prompt: 'A street racing game built with Synty’s POLYGON Street Racer pack. Race through the city at night, drift the corners and win parts to upgrade your car.',
    feel: 'speed and drifting',
    games: [[/forza/i, 'Forza'], [/need for speed|nfs/i, 'Need for Speed'], [/mario kart/i, 'Mario Kart'], [/gran turismo/i, 'Gran Turismo'], [/burnout/i, 'Burnout'], [/the crew/i, 'The Crew'], [/rocket league/i, 'Rocket League'], [/crazy taxi/i, 'Crazy Taxi']],
    genres: ['Racing'], settings: ['Modern city'], moods: ['Epic'], enjoys: ['Competing'], play: 'Challenging',
  },
  {
    id: 'dungeon-realms', title: 'Dungeon delve', pack: 'POLYGON Dungeon Realms', packUrl: synty('polygon-dungeon-realms'), image: 'assets/synty/polygon-dungeon-realms.jpg', look: 'woodland',
    blurb: 'Fight room by room, grab loot and see how deep you get.',
    prompt: 'A dungeon crawler built with Synty’s POLYGON Dungeon Realms pack. Fight through room after room, grab loot and power-ups, and see how deep you can get on each run.',
    feel: 'one-more-run loot loop',
    games: [[/hades/i, 'Hades'], [/diablo/i, 'Diablo'], [/minecraft dungeons/i, 'Minecraft Dungeons'], [/dark souls/i, 'Dark Souls'], [/binding of isaac/i, 'The Binding of Isaac'], [/gungeon/i, 'Enter the Gungeon'], [/dead cells/i, 'Dead Cells'], [/torchlight/i, 'Torchlight']],
    genres: ['Action', 'Strategy'], settings: ['Fantasy', 'Horror'], moods: ['Tense', 'Spooky'], enjoys: ['Competing', 'Collecting'], play: 'Challenging',
  },
  {
    id: 'vikings', title: 'Viking winter village', pack: 'POLYGON Vikings', packUrl: synty('polygon-vikings'), image: 'assets/synty/polygon-vikings.jpg', look: 'woodland',
    blurb: 'Build a fjord village and defend it through the long winter.',
    prompt: 'A Viking survival game built with Synty’s POLYGON Vikings pack. Build a village on a fjord, gather wood and food, and defend it from raiders through the long winter.',
    feel: 'build-and-survive feel',
    games: [[/valheim/i, 'Valheim'], [/god of war/i, 'God of War'], [/valhalla/i, 'Assassin’s Creed Valhalla'], [/northgard/i, 'Northgard'], [/minecraft/i, 'Minecraft'], [/rust\b/i, 'Rust'], [/\bark\b/i, 'ARK']],
    genres: ['Strategy', 'Open world'], settings: ['Historical', 'Fantasy', 'Nature'], moods: ['Epic'], enjoys: ['Building and creating', 'Exploring'],
  },
]

/** How each answer reads inside a sentence: "you like open worlds and relaxed play". */
const PHRASE: Record<string, string> = {
  'Open world': 'open worlds', 'Cozy / life sim': 'cozy games', Action: 'action games', Puzzle: 'puzzles', Racing: 'racing',
  Strategy: 'strategy games', Platformer: 'platformers', 'Modern city': 'modern cities', Fantasy: 'fantasy', 'Sci-fi': 'sci-fi',
  Historical: 'historical settings', Horror: 'horror', Nature: 'nature', Calm: 'calm games', Tense: 'tense moments', Spooky: 'spooky games',
  Epic: 'epic adventures', Funny: 'funny games', Exploring: 'exploring', Collecting: 'collecting', Story: 'a good story',
  'Building and creating': 'building things', Competing: 'competing', 'Solving puzzles': 'solving puzzles', 'Playing with friends': 'playing with friends',
  Relaxed: 'relaxed play', Challenging: 'a challenge',
}

const list = (v: ProfileValue | undefined) => (Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [])

export interface RankedPitch {
  pitch: Pitch
  score: number
  /** "Inspired by Stardew Valley" or "Because you like sci-fi". */
  tag: string
  /** Answers that led here, for the "Based on" pill. */
  basis: string[]
  why: string
}

/** Rank all ten pitches for this profile, best first. */
export function rankPitches(p: Profile): RankedPitch[] {
  const games = typeof p.games === 'string' ? p.games : ''
  const genres = list(p.genres)
  const settings = list(p.setting)
  const moods = list(p.mood)
  const enjoys = list(p.enjoy)
  const firstProject = p.experience === 'Just starting out'

  return PITCHES.map((pitch, i) => {
    let score = -i * 0.01 // stable order when nothing matches
    const basis: string[] = []
    // A favourite game is the strongest signal; the first game they listed counts a little more.
    const listed = games.split(/,|\band\b|\//).map((g) => g.trim()).filter(Boolean)
    const hit = pitch.games.map(([re, n]) => ({ n, at: listed.findIndex((g) => re.test(g)) })).filter((g) => g.at >= 0).sort((a, b) => a.at - b.at)[0]
    // Use the game as they wrote it ("GTA 6"), not our short name.
    const game = hit ? listed[hit.at] : undefined
    if (hit && game) { score += Math.max(6, 10 - hit.at * 2); basis.push(game) }
    for (const g of pitch.genres) if (genres.some((x) => x.startsWith(g))) { score += 2; basis.push(g) }
    for (const s of pitch.settings) if (settings.includes(s)) { score += 2; basis.push(s) }
    for (const m of pitch.moods) if (moods.includes(m)) { score += 1; basis.push(m) }
    for (const e of pitch.enjoys) if (enjoys.includes(e)) { score += 1; basis.push(e) }
    if (pitch.play && p.play === pitch.play) { score += 1; basis.push(pitch.play) }

    const likes = basis.filter((b) => b !== game).map((b) => PHRASE[b] ?? b.toLowerCase())
    const tag = game ? `Inspired by ${game}` : likes[0] ? `Because you like ${likes[0]}` : 'An idea to try'
    const size = firstProject ? 'sized for a first project' : 'with room to grow'
    const why = game
      ? `You said ${game} is a favourite${likes[0] ? ` and you like ${likes[0]}` : ''}, so this keeps that ${pitch.feel}, ${size}.`
      : likes.length
        ? `You like ${likes.slice(0, 2).join(' and ')}, so this keeps that ${pitch.feel}, ${size}.`
        : `A different direction to try: the ${pitch.feel}, ${size}.`
    return { pitch, score, tag, basis: [...new Set(basis)].slice(0, 3), why }
  }).sort((a, b) => b.score - a.score)
}
