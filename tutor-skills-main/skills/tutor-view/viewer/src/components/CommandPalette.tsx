import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchVault, type SearchResult } from '@/lib/search'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => {
    setResults(searchVault(query))
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        const r = results[activeIdx]
        if (r) openResult(r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIdx])

  const openResult = (r: SearchResult) => {
    const path = '/note/' + encodeURIComponent(r.file.path) + (r.headingId ? '#' + r.headingId : '')
    navigate(path)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-200 dark:border-ink-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, heading, or keyword…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-400"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-200 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin py-2">
          {results.length === 0 && query && (
            <div className="px-5 py-8 text-center text-sm text-ink-400">No matches</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.file.path + (r.headingId ?? '')}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => openResult(r)}
              className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${
                i === activeIdx ? 'bg-accent/10' : 'hover:bg-ink-100 dark:hover:bg-ink-800/50'
              }`}
            >
              <div className="flex-shrink-0">
                {r.headingId ? (
                  <span className="text-ink-400 font-mono text-xs">#</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-ink-900 dark:text-ink-50">
                  {r.headingText ?? r.file.title}
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 truncate">
                  {r.headingId ? r.file.title + ' · ' : ''}
                  {r.file.path}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
