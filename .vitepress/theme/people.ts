// Who wrote what, by the name a post's frontmatter credits them with.
//
// A post names its authors in plain words (`authors: [Dongyun Zou, Zijian Zhang]`), because a
// byline is read by people and a feed's `dc:creator` is a name, not a handle. This is the one
// place that turns those names into faces: the GitHub account each person publishes their
// work under, so a byline can show the avatar and link to the profile where the commits are.
//
// Addressed by numeric account id rather than by login, the same way the team roster does it:
// the id is the one thing that survives somebody renaming their account, and the avatar CDN
// answers to it directly. The login is kept for the profile link.
//
// Only people whose account is certain are in here -- matched by their own commits or pull
// requests on the work the post reports, or by the profile naming them. A name that is not in
// the map still renders, as initials: a missing face is better than somebody else's.

export interface Person {
  /** GitHub login: what the profile link goes to. */
  handle: string
  /** The numeric account id, which is what the avatar is addressed by. */
  id: number
}

export const PEOPLE: Record<string, Person> = {
  // The organisation, for the posts the whole group signs.
  Humanfia: { handle: 'humanfia', id: 288694950 },

  // The team roster's people, copied rather than imported: the roster is a component with
  // opinions about grouping, and a byline only needs the account.
  'Sihao Liu': { handle: 'SihaoLiu', id: 40861817 },
  'Ligeng Zhu': { handle: 'Lyken17', id: 7783214 },
  'Zijian Zhang': { handle: 'futrime', id: 35801754 },
  'Dongyun Zou': { handle: 'DongyunZou', id: 122959524 },
  'Yixin Dong': { handle: 'ubospica', id: 32952380 },
  'Changye Li': { handle: 'antoinegg1', id: 78747324 },
  'Zhengyang Zhang': { handle: 'ZhengyangZhang06', id: 165369232 },
  'Xiaoyu Zhang': { handle: 'BBuf', id: 35585791 },
  'Yahui Cui': { handle: 'smoothsmooth', id: 18200776 },
  'Hongzhou Lin': { handle: 'hongzhoulin89', id: 29802555 },
  'Jui-Hui Chung': { handle: 'unixtomato', id: 72721270 },
  'Jing Xiong': { handle: 'menik1126', id: 49935767 },
  'Dong Zhou': { handle: 'dongz9', id: 627593 },
  'Zheng Du': { handle: 'crmsndu', id: 74142908 },
  'Junxian Guo': { handle: 'JerryGJX', id: 92502485 },
  'Song Bian': { handle: 'Waterpine', id: 29000790 },
  'Shinan Liu': { handle: 'shinan6', id: 24783784 },
  'Menghan Li': { handle: 'zgdllt', id: 118046841 },
  'Yitong Liu': { handle: 'apostle715', id: 232143882 },

  // Everyone else a post credits.
  //
  // Jin Pan: the two FlyDSL pull requests the ROCm post cites (#685, #711) are his.
  'Jin Pan': { handle: 'jhinpan', id: 47354855 },
  // Lesheng Jin: every commit in humanfia/sol-execbench-kda, the SOL Bench run, is his.
  'Lesheng Jin': { handle: 'LeshengJin', id: 34279105 },
  // Zhekai Zhang and Shang Yang: HAN Lab Kernel Mafia, the MLSys 2026 contest team the
  // organisers' results page lists; both commit to mit-han-lab/nunchaku under these accounts.
  'Zhekai Zhang': { handle: 'sxtyzhangzk', id: 7344200 },
  'Shang Yang': { handle: 'ys-2020', id: 61508922 },
  // Jiaming Tang: MIT EECS, and the account the humanfia organisation collaborates with.
  'Jiaming Tang': { handle: 'Sakits', id: 31038513 },
  // KDA² (NVlabs/kda), whose remaining authors are TVM, MLC and FlashInfer maintainers with
  // the profile names to match -- Hongyi Jin also committed to humanfia/kda-for-kda-release.
  'Hongyi Jin': { handle: 'jinhongyii', id: 44201588 },
  'Zihao Ye': { handle: 'yzh119', id: 11773619 },
  'Junru Shao': { handle: 'junrushao', id: 22515877 },
  'Avery Huang': { handle: 'averyhNV', id: 219764253 },
  // Yuchen Jin is credited on the two SOL Bench posts but is deliberately not here: no account
  // could be tied to that work, and a guessed face is worse than initials.
}

/** The person behind a byline, if we know their account. */
export const personOf = (name: string): Person | undefined => PEOPLE[name]

/** The avatar at `size` CSS pixels, asked for at twice that so it is sharp on a dense screen. */
export const avatarOf = (person: Person, size: number) =>
  `https://avatars.githubusercontent.com/u/${person.id}?s=${size * 2}&v=4`

export const profileOf = (person: Person) => `https://github.com/${person.handle}`

/** First letter of the first and last word, which is right for both "Jin Pan" and "Humanfia". */
export function initialsOf(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** A frontmatter's authors: `authors` is the list, `author` is what the earliest posts used. */
export function authorsOf(front: Record<string, unknown>): string[] {
  if (Array.isArray(front.authors)) return front.authors as string[]
  if (typeof front.author === 'string') return [front.author]
  return ['Humanfia']
}
