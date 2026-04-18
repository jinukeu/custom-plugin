import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findFile, getVaultName } from '@/lib/vault-index'
import { MarkdownView } from '@/components/MarkdownView'

const HUES = [
  { bg: 'rgba(35, 131, 226, 0.14)', fg: 'rgb(35, 122, 216)' },
  { bg: 'rgba(46, 170, 112, 0.16)', fg: 'rgb(36, 140, 92)' },
  { bg: 'rgba(217, 145, 30, 0.18)', fg: 'rgb(171, 110, 20)' },
  { bg: 'rgba(204, 80, 138, 0.16)', fg: 'rgb(173, 64, 114)' },
  { bg: 'rgba(128, 90, 213, 0.16)', fg: 'rgb(109, 70, 198)' },
  { bg: 'rgba(217, 88, 73, 0.16)', fg: 'rgb(186, 67, 55)' },
]

function hueFor(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return HUES[sum % HUES.length]
}

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
      <div className="pt-12">
        <div
          className="text-micro uppercase mb-3"
          style={{ color: 'var(--text-light)' }}
        >
          404
        </div>
        <h1
          className="text-h1 text-pretty"
          style={{ color: 'var(--text-strong)' }}
        >
          Page not found
        </h1>
        <p className="mt-2 text-ui" style={{ color: 'var(--text-gray)' }}>
          The page at <code className="text-small">{decoded}</code> doesn&rsquo;t exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 mt-4 text-ui"
          style={{ color: 'var(--accent)' }}
        >
          <span>←</span> Back to home
        </Link>
      </div>
    )
  }

  const keywords = Array.isArray(file.frontmatter.keywords)
    ? (file.frontmatter.keywords as string[])
    : typeof file.frontmatter.keywords === 'string'
    ? (file.frontmatter.keywords as string).split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const folderParts = file.folder ? file.folder.split('/').filter(Boolean) : []
  const wordCount = file.content.split(/\s+/).filter(Boolean).length
  const readMin = Math.max(1, Math.round(wordCount / 350))
  const hue = hueFor(file.folder || file.title)
  const sectionLabel = folderParts[0] ?? 'Note'

  return (
    <article>
      {/* Breadcrumb */}
      <nav
        className="mb-6 text-small flex items-center gap-1 flex-wrap -mt-1"
        style={{ color: 'var(--text-light)' }}
      >
        <Link
          to="/"
          className="px-1.5 py-[2px] rounded hover:bg-[var(--bg-hover)] transition-colors"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {getVaultName()}
        </Link>
        {folderParts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <span style={{ color: 'var(--text-light)' }}>/</span>
            <span className="px-1.5 py-[2px]">{p}</span>
          </span>
        ))}
      </nav>

      {/* Cover zone */}
      <div className="cover-zone" />

      {/* Section eyebrow */}
      <div
        className="inline-flex items-center gap-2 px-2.5 py-[3px] mb-3 rounded-full text-micro uppercase"
        style={{ background: hue.bg, color: hue.fg }}
      >
        <span
          className="inline-block w-[5px] h-[5px] rounded-full"
          style={{ background: 'currentColor' }}
        />
        {sectionLabel}
      </div>

      {/* Title */}
      <h1
        className="text-display text-pretty px-[2px]"
        style={{
          marginTop: '2px',
          marginBottom: '14px',
          color: 'var(--text-strong)',
        }}
      >
        {file.title}
      </h1>

      {/* Property rows */}
      <div className="mb-10 space-y-1 px-[2px]">
        {keywords.length > 0 && (
          <PropertyRow
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none" />
              </svg>
            }
            label="Tags"
          >
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span
                  key={k}
                  className="px-[7px] py-[1px] rounded text-small"
                  style={{
                    background: 'var(--bg-callout)',
                    color: 'var(--text)',
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          </PropertyRow>
        )}
        <PropertyRow
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Reading"
        >
          <span className="text-small" style={{ color: 'var(--text)' }}>
            {wordCount.toLocaleString()} words · ~{readMin} min read
          </span>
        </PropertyRow>
        {file.folder && (
          <PropertyRow
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
            label="In"
          >
            <span className="text-small" style={{ color: 'var(--text)' }}>{file.folder}</span>
          </PropertyRow>
        )}
      </div>

      {/* Divider */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--divider)',
          margin: '0 0 18px',
        }}
      />

      <MarkdownView file={file} />
    </article>
  )
}

function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 py-[3px] min-h-[28px]">
      <div
        className="flex items-center gap-1.5 w-[110px] flex-shrink-0 text-small"
        style={{ color: 'var(--text-light)' }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0" style={{ color: 'var(--text-gray)' }}>
        {children}
      </div>
    </div>
  )
}
