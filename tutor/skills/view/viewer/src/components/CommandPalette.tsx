import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchVault, type SearchResult } from '@/lib/search'

interface Props {
  open: boolean
  onClose: () => void
}

function FileMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
      style={{
        background: 'rgba(15, 15, 15, 0.35)',
        backdropFilter: 'blur(6px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(6px) saturate(1.1)',
        animation: 'fade-up 180ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-[10px] overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-raised)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--divider)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-gray)' }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, headings, or keywords..."
            className="flex-1 bg-transparent outline-none text-h4"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Clear"
              style={{ color: 'var(--text-gray)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-1.5">
          {results.length === 0 && query && (
            <div className="px-4 py-12 text-center">
              <div className="flex items-center justify-center mb-3 opacity-55" style={{ color: 'var(--text-light)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
              <div className="text-small" style={{ color: 'var(--text-gray)' }}>
                No matches for <span style={{ color: 'var(--text)' }}>&ldquo;{query}&rdquo;</span>
              </div>
            </div>
          )}
          {results.length === 0 && !query && (
            <div className="px-4 py-6">
              <div className="text-micro uppercase mb-2 px-2" style={{ color: 'var(--text-light)' }}>
                Shortcuts
              </div>
              <ShortcutRow label="Search the vault" keys={['⌘', 'K']} />
              <ShortcutRow label="Navigate results" keys={['↑', '↓']} />
              <ShortcutRow label="Open result" keys={['↵']} />
              <ShortcutRow label="Close" keys={['Esc']} />
            </div>
          )}
          {results.map((r, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={r.file.path + (r.headingId ?? '')}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => openResult(r)}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 transition-colors group"
                style={{
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text)',
                }}
              >
                <span
                  className="flex items-center justify-center w-[22px] h-[22px] flex-shrink-0"
                  style={{ color: 'var(--text-light)' }}
                >
                  {r.headingId ? (
                    <span style={{ fontWeight: 600 }}>#</span>
                  ) : (
                    <FileMark />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-ui truncate"
                    style={{
                      color: isActive ? 'var(--text-strong)' : 'var(--text)',
                      fontWeight: isActive ? 550 : 450,
                    }}
                  >
                    {r.headingText ?? r.file.title}
                  </div>
                  {r.headingId && (
                    <div className="text-small truncate mt-[1px]" style={{ color: 'var(--text-light)' }}>
                      {r.file.title}
                    </div>
                  )}
                </div>
                {isActive && (
                  <kbd
                    className="px-1.5 py-[2px] rounded text-micro font-sans flex-shrink-0"
                    style={{
                      background: 'var(--bg-callout)',
                      color: 'var(--text-gray)',
                      border: '1px solid var(--divider)',
                      fontFamily: 'inherit',
                    }}
                  >
                    ↵
                  </kbd>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 flex items-center justify-between gap-4 text-micro"
          style={{
            borderTop: '1px solid var(--divider)',
            color: 'var(--text-light)',
            background: 'var(--bg)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span>Open</span>
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="font-sans px-[4px] py-[1px] rounded text-micro"
      style={{
        background: 'var(--bg-raised)',
        color: 'var(--text-gray)',
        border: '1px solid var(--divider-strong)',
        boxShadow: '0 1px 0 rgba(55, 53, 47, 0.06)',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </kbd>
  )
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 text-small" style={{ color: 'var(--text-gray)' }}>
      <span>{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <Kbd key={i}>{k}</Kbd>
        ))}
      </span>
    </div>
  )
}
