import type { VideoItem } from '../types/youtube'

const DEMO_VIDEOS: VideoItem[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    description: 'The official video for "Never Gonna Give You Up" by Rick Astley. Taken from the album "Whenever You Need Somebody".',
    tags: ['Rick Astley', 'Never Gonna Give You Up', 'pop', '80s', 'music'],
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    channelTitle: 'Rick Astley',
    publishedAt: '2009-10-25T06:57:33Z',
    duration: '3:33',
    viewCount: '1400000000',
    likeCount: '16000000',
    commentCount: '2300000',
    subscriberCount: '4000000',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    description: 'Despacito official music video by Luis Fonsi featuring Daddy Yankee.',
    tags: ['Despacito', 'Luis Fonsi', 'Daddy Yankee', 'reggaeton', 'latin'],
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    channelId: 'UCxoq-3pTFpEfV4YBuNT-AAAA',
    channelTitle: 'Luis Fonsi',
    publishedAt: '2024-02-12T17:00:00Z',
    duration: '4:41',
    viewCount: '8200000000',
    likeCount: '50000000',
    commentCount: '15000000',
    subscriberCount: '2000000000',
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    description: 'The official music video for Ed Sheeran - Shape Of You from the album "÷" (Divide).',
    tags: ['Ed Sheeran', 'Shape of You', 'pop', 'acoustic'],
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
    channelId: 'UC0C-w0YjGpqDXGB8IHb662A',
    channelTitle: 'Ed Sheeran',
    publishedAt: '2025-01-30T17:00:04Z',
    duration: '0:45',
    viewCount: '6000000000',
    likeCount: '31000000',
    commentCount: '5500000',
    subscriberCount: '55000000',
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    description: 'PSY - GANGNAM STYLE(강남스타일) on iTunes: http://smarturl.it/iGangnam',
    tags: ['PSY', 'Gangnam Style', 'K-pop', 'korea', 'dance'],
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
    channelId: 'UCrDkAvwZum-UTjHmzDI2iIw',
    channelTitle: 'officialpsy',
    publishedAt: '2025-10-15T07:46:32Z',
    duration: '4:13',
    viewCount: '5000000000',
    likeCount: '24000000',
    commentCount: '6000000',
    subscriberCount: '18000000',
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars',
    description: '"Uptown Funk" by Mark Ronson ft. Bruno Mars. From the album Uptown Special.',
    tags: ['Mark Ronson', 'Bruno Mars', 'Uptown Funk', 'funk', 'pop'],
    thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/mqdefault.jpg',
    channelId: 'UCfM3zsQsOnfWNUppiycmBuw',
    channelTitle: 'Mark Ronson',
    publishedAt: '2026-02-10T17:00:01Z',
    duration: '25:00',
    viewCount: '5100000000',
    likeCount: '25000000',
    commentCount: '3200000',
    subscriberCount: '10000000',
  },
]

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  const h = parseInt(match[1] ?? '0')
  const m = parseInt(match[2] ?? '0')
  const s = parseInt(match[3] ?? '0')
  const ss = s.toString().padStart(2, '0')
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${ss}`
  }
  return `${m}:${ss}`
}

export async function searchVideos(query: string): Promise<VideoItem[]> {
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 800))
    const q = query.toLowerCase()
    const filtered = DEMO_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    )
    return filtered.length > 0 ? filtered : DEMO_VIDEOS
  }

  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '50',
    key: API_KEY,
  })

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`)
  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}))
    const msg = err?.error?.message ?? searchRes.statusText
    throw new Error(`検索エラー: ${msg}`)
  }

  const searchData = await searchRes.json()
  const items = searchData.items ?? []
  if (items.length === 0) return []

  const ids: string[] = items.map((item: { id: { videoId: string } }) => item.id.videoId).filter(Boolean)

  const videoParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: ids.join(','),
    key: API_KEY,
  })

  const videoRes = await fetch(`${BASE_URL}/videos?${videoParams}`)
  if (!videoRes.ok) {
    const err = await videoRes.json().catch(() => ({}))
    const msg = err?.error?.message ?? videoRes.statusText
    throw new Error(`動画詳細取得エラー: ${msg}`)
  }

  const videoData = await videoRes.json()

  const videoItems: Omit<VideoItem, 'subscriberCount'>[] = (videoData.items ?? []).map((v: {
    id: string
    snippet: {
      title: string
      description: string
      tags?: string[]
      thumbnails: { medium?: { url: string }; default?: { url: string } }
      channelId: string
      channelTitle: string
      publishedAt: string
    }
    contentDetails: { duration: string }
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string }
  }) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    tags: v.snippet.tags ?? [],
    thumbnail: v.snippet.thumbnails?.medium?.url ?? v.snippet.thumbnails?.default?.url ?? '',
    channelId: v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    publishedAt: v.snippet.publishedAt,
    duration: parseDuration(v.contentDetails.duration),
    viewCount: v.statistics.viewCount ?? '0',
    likeCount: v.statistics.likeCount ?? '0',
    commentCount: v.statistics.commentCount ?? '0',
  }))

  const channelIds = [...new Set(videoItems.map((v) => v.channelId))]
  const channelParams = new URLSearchParams({
    part: 'statistics',
    id: channelIds.join(','),
    key: API_KEY,
  })

  const channelRes = await fetch(`${BASE_URL}/channels?${channelParams}`)
  const subscriberMap: Record<string, string> = {}
  if (channelRes.ok) {
    const channelData = await channelRes.json()
    for (const ch of (channelData.items ?? [])) {
      subscriberMap[ch.id] = ch.statistics?.subscriberCount ?? '0'
    }
  }

  return videoItems.map((v) => ({
    ...v,
    subscriberCount: subscriberMap[v.channelId] ?? '0',
  }))
}
