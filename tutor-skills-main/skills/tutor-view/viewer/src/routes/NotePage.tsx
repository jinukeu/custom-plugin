import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { findFile } from '@/lib/vault-index'
import { MarkdownView } from '@/components/MarkdownView'

export function NotePage() {
  const { '*': path } = useParams()
  const decoded = decodeURIComponent(path ?? '')
  const file = findFile(decoded)

  useEffect(() => {
    if (!file) return
    const hash = window.location.hash.slice(1)
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else {
      window.scrollTo(0, 0)
    }
  }, [file])

  if (!file) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="font-serif text-3xl text-ink-400 mb-2">Note not found</div>
        <div className="text-sm text-ink-500">No note exists at path <code className="font-mono text-xs">{decoded}</code></div>
      </div>
    )
  }

  const keywords = Array.isArray(file.frontmatter.keywords)
    ? (file.frontmatter.keywords as string[])
    : typeof file.frontmatter.keywords === 'string'
    ? (file.frontmatter.keywords as string).split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <article className="animate-fade-in">
      <header className="mb-10 pb-6 border-b border-ink-200 dark:border-ink-800">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400 dark:text-ink-500 mb-3 font-mono">
          {file.folder || 'ROOT'}
        </div>
        <h1 className="font-serif text-[2.5rem] leading-[1.15] font-semibold tracking-tight text-ink-900 dark:text-ink-50 mb-4">
          {file.title}
        </h1>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <span
                key={k}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-400"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </header>
      <MarkdownView file={file} />
      {file.headings.length > 3 && <OnThisPage headings={file.headings.filter((h) => h.depth <= 3)} />}
    </article>
  )
}

function OnThisPage({ headings }: { headings: { depth: number; text: string; id: string }[] }) {
  return (
    <aside className="hidden xl:block fixed right-8 top-24 w-56 max-h-[70vh] overflow-y-auto scrollbar-thin text-xs">
      <div className="font-semibold uppercase tracking-[0.15em] text-[10px] text-ink-400 dark:text-ink-500 mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-ink-200 dark:border-ink-800">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.depth - 1) * 0.75 + 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              className="block py-0.5 text-ink-500 dark:text-ink-400 hover:text-accent transition-colors truncate"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                history.replaceState(null, '', `#${h.id}`)
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
