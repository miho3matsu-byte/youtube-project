import type { VideoItem } from '../types/youtube'

export type SortOption = 'default' | 'views' | 'likes' | 'comments' | 'date_desc' | 'date_asc'
export type DurationFilter = 'all' | 'short' | 'long'
export type DateFilter = 'all' | '1m' | '2m' | '6m' | '1y'
export type EngagementFilter = 'all' | '1' | '2' | '3' | '4' | '5'

function escapeCsv(value: string): string {
  const str = value.replace(/"/g, '""')
  return `"${str}"`
}

function exportCsv(videos: VideoItem[]) {
  const headers = ['タイトル', 'チャンネル', '投稿日', '動画時間', '再生数', 'いいね数', 'コメント数', 'いいね率(%)', 'タグ', 'URL']
  const rows = videos.map((v) => {
    const likeRate = parseInt(v.viewCount) > 0
      ? ((parseInt(v.likeCount) / parseInt(v.viewCount)) * 100).toFixed(2)
      : '0'
    return [
      escapeCsv(v.title),
      escapeCsv(v.channelTitle),
      escapeCsv(new Date(v.publishedAt).toLocaleDateString('ja-JP')),
      escapeCsv(v.duration),
      v.viewCount,
      v.likeCount,
      v.commentCount,
      likeRate,
      escapeCsv(v.tags.join(' ')),
      escapeCsv(`https://www.youtube.com/watch?v=${v.id}`),
    ].join(',')
  })
  const bom = '\uFEFF'
  const csv = bom + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `youtube_search_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  sort: SortOption
  setSort: (v: SortOption) => void
  durationFilter: DurationFilter
  setDurationFilter: (v: DurationFilter) => void
  dateFilter: DateFilter
  setDateFilter: (v: DateFilter) => void
  engagementFilter: EngagementFilter
  setEngagementFilter: (v: EngagementFilter) => void
  resultCount: number
  videos: VideoItem[]
}

export default function SortFilterBar({
  sort, setSort,
  durationFilter, setDurationFilter,
  dateFilter, setDateFilter,
  engagementFilter, setEngagementFilter,
  resultCount,
  videos,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">{resultCount}件</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(videos)}
            disabled={videos.length === 0}
            className="rounded-md border border-green-600 bg-white px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            CSVダウンロード
          </button>
          <label className="text-xs text-gray-500 whitespace-nowrap">並び替え</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          >
            <option value="default">デフォルト</option>
            <option value="views">再生数（多い順）</option>
            <option value="likes">いいね数（多い順）</option>
            <option value="comments">コメント数（多い順）</option>
            <option value="date_desc">投稿日（新しい順）</option>
            <option value="date_asc">投稿日（古い順）</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">動画の長さ</label>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          >
            <option value="all">すべて</option>
            <option value="short">ショート（1分未満）</option>
            <option value="long">ロングフォーム（7分以上）</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">投稿期間</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          >
            <option value="all">全期間</option>
            <option value="1m">1ヶ月以内</option>
            <option value="2m">2ヶ月以内</option>
            <option value="6m">6ヶ月以内</option>
            <option value="1y">1年以内</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">エンゲージメント率</label>
          <select
            value={engagementFilter}
            onChange={(e) => setEngagementFilter(e.target.value as EngagementFilter)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          >
            <option value="all">すべて</option>
            <option value="1">段階1（再生:登録 = 0.1〜0.3）</option>
            <option value="2">段階2（再生:登録 = 0.4〜0.7）</option>
            <option value="3">段階3（再生:登録 = 0.8〜1.5）</option>
            <option value="4">段階4（再生:登録 = 1.5〜3.0）</option>
            <option value="5">段階5（再生:登録 = 3.0以上）</option>
          </select>
        </div>
      </div>
    </div>
  )
}
