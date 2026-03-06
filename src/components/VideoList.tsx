import type { VideoItem } from '../types/youtube'
import VideoCard from './VideoCard'

interface Props {
  results: VideoItem[]
  loading: boolean
  error: string | null
  searched: boolean
}

export default function VideoList({ results, loading, error, searched }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <p>検索中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    )
  }

  if (!searched) return null

  if (results.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500">該当する動画が見つかりませんでした。</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">{results.length}件の結果</p>
      {results.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
