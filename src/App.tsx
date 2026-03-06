import { useState, useMemo } from 'react'
import type { VideoItem } from './types/youtube'
import { searchVideos } from './services/youtube'
import SearchBar from './components/SearchBar'
import VideoList from './components/VideoList'
import SortFilterBar, { type SortOption, type DurationFilter, type DateFilter, type EngagementFilter } from './components/SortFilterBar'

const IS_DEMO = !import.meta.env.VITE_YOUTUBE_API_KEY

function parseDurationToMinutes(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60
  if (parts.length === 2) return parts[0] + parts[1] / 60
  return 0
}

function getEngagementStage(viewCount: string, subscriberCount: string): number {
  const views = parseInt(viewCount) || 0
  const subs = parseInt(subscriberCount) || 0
  if (subs === 0) return 0
  const ratio = views / subs
  if (ratio < 0.1) return 0
  if (ratio <= 0.3) return 1
  if (ratio <= 0.7) return 2
  if (ratio <= 1.5) return 3
  if (ratio <= 3.0) return 4
  return 5
}

function getDateThreshold(filter: DateFilter): Date | null {
  const now = new Date()
  if (filter === '1m') return new Date(now.setMonth(now.getMonth() - 1))
  if (filter === '2m') return new Date(now.setMonth(now.getMonth() - 2))
  if (filter === '6m') return new Date(now.setMonth(now.getMonth() - 6))
  if (filter === '1y') return new Date(now.setFullYear(now.getFullYear() - 1))
  return null
}

export default function App() {
  const [results, setResults] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [sort, setSort] = useState<SortOption>('default')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [engagementFilter, setEngagementFilter] = useState<EngagementFilter>('all')

  const handleSearch = async (query: string) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    setSort('default')
    setDurationFilter('all')
    setDateFilter('all')
    setEngagementFilter('all')
    try {
      const data = await searchVideos(query)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '予期しないエラーが発生しました。')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = useMemo(() => {
    let list = [...results]

    if (durationFilter !== 'all') {
      list = list.filter((v) => {
        const mins = parseDurationToMinutes(v.duration)
        if (durationFilter === 'short') return mins < 1
        if (durationFilter === 'long') return mins >= 7
        return true
      })
    }

    if (dateFilter !== 'all') {
      const threshold = getDateThreshold(dateFilter)
      if (threshold) {
        list = list.filter((v) => new Date(v.publishedAt) >= threshold)
      }
    }

    if (engagementFilter !== 'all') {
      const stage = parseInt(engagementFilter)
      list = list.filter((v) => getEngagementStage(v.viewCount, v.subscriberCount) === stage)
    }

    if (sort !== 'default') {
      list.sort((a, b) => {
        if (sort === 'views') return parseInt(b.viewCount) - parseInt(a.viewCount)
        if (sort === 'likes') return parseInt(b.likeCount) - parseInt(a.likeCount)
        if (sort === 'comments') return parseInt(b.commentCount) - parseInt(a.commentCount)
        if (sort === 'date_desc') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        if (sort === 'date_asc') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        return 0
      })
    }

    return list
  }, [results, sort, durationFilter, dateFilter, engagementFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      {IS_DEMO && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          デモモード — APIキー未設定のため、サンプルデータを表示しています。
        </div>
      )}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="mb-3 text-xl font-bold text-gray-900">YouTube動画検索</h1>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 flex flex-col gap-4">
        {searched && !loading && !error && results.length > 0 && (
          <SortFilterBar
            sort={sort}
            setSort={setSort}
            durationFilter={durationFilter}
            setDurationFilter={setDurationFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            engagementFilter={engagementFilter}
            setEngagementFilter={setEngagementFilter}
            resultCount={filteredResults.length}
            videos={filteredResults}
          />
        )}
        <VideoList
          results={filteredResults}
          loading={loading}
          error={error}
          searched={searched}
        />
      </main>
    </div>
  )
}
