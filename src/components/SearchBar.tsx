import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSearch: (query: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  const handleSearch = () => {
    const q = value.trim()
    if (q) onSearch(q)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="検索キーワードを入力..."
        disabled={loading}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 disabled:bg-gray-100"
      />
      <button
        onClick={handleSearch}
        disabled={loading || !value.trim()}
        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        検索
      </button>
    </div>
  )
}
