import { useState } from 'react'
import type { VideoItem } from '../types/youtube'

const DESCRIPTION_KEYWORDS = [
  'SHEIN', 'Amazon', 'Qoo10', 'eBay', 'Temu', 'AliExpress', 'Rakuten', 'Yahoo',
  'PR', '案件', '広告', 'スポンサー', 'affiliate', 'アフィリエイト',
]

interface Props {
  video: VideoItem
}

function formatNumber(n: string): string {
  const num = parseInt(n, 10)
  if (isNaN(num)) return '0'
  if (num >= 100_000_000) return `${(num / 100_000_000).toFixed(1)}億`
  if (num >= 10_000) return `${(num / 10_000).toFixed(1)}万`
  return num.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function VideoCard({ video }: Props) {
  const [expanded, setExpanded] = useState(false)

  const detectedKeywords = DESCRIPTION_KEYWORDS.filter((kw) =>
    video.description.toLowerCase().includes(kw.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-4">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-40 rounded-lg object-cover"
          />
        </a>

        <div className="flex flex-col gap-1 min-w-0">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-red-600 line-clamp-2 text-base leading-snug"
          >
            {video.title}
          </a>

          <a
            href={`https://www.youtube.com/channel/${video.channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {video.channelTitle}
          </a>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
            <span>{formatDate(video.publishedAt)}</span>
            <span>{video.duration}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm mt-1">
            <span className="flex items-center gap-1 text-gray-700">
              <span className="text-gray-400">再生</span>
              <span className="font-medium">{formatNumber(video.viewCount)}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="text-gray-400">いいね</span>
              <span className="font-medium">{formatNumber(video.likeCount)}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="text-gray-400">コメント</span>
              <span className="font-medium">{formatNumber(video.commentCount)}</span>
            </span>
            {parseInt(video.viewCount) > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                いいね率 {((parseInt(video.likeCount) / parseInt(video.viewCount)) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {video.description && (
        <div className="text-sm text-gray-600">
          <p className={expanded ? '' : 'line-clamp-2'}>{video.description}</p>
          {video.description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs text-blue-500 hover:underline"
            >
              {expanded ? '折りたたむ' : 'もっと見る'}
            </button>
          )}
        </div>
      )}

      {detectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {detectedKeywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 border border-orange-200"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {video.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {video.tags.slice(0, 10).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              #{tag}
            </span>
          ))}
          {video.tags.length > 10 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              +{video.tags.length - 10}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
