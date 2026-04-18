import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface Props {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang }: Props) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    const safeLang = lang && /^[a-zA-Z0-9+_-]+$/.test(lang) ? lang : 'text'
    codeToHtml(code, {
      lang: safeLang,
      theme: isDark ? 'github-dark-default' : 'github-light-default',
    })
      .then(setHtml)
      .catch(() => {
        setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
      })
  }, [code, lang])

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const displayLang = lang && lang !== 'text' ? lang : null

  return (
    <div className="relative group my-4">
      {/* Language badge (top-left) */}
      {displayLang && (
        <span
          className="absolute top-2 left-3 text-micro uppercase z-10 pointer-events-none"
          style={{ color: 'var(--text-light)' }}
        >
          {displayLang}
        </span>
      )}
      {/* Copy button (top-right) */}
      <button
        onClick={copy}
        className="absolute top-1.5 right-1.5 z-10 px-2 py-1 text-micro rounded-[4px] transition-all opacity-0 group-hover:opacity-100"
        style={{
          background: 'var(--bg-raised)',
          color: copied ? 'rgb(46, 170, 112)' : 'var(--text-gray)',
          border: '1px solid var(--divider-strong)',
          boxShadow: '0 1px 2px rgba(55, 53, 47, 0.08)',
        }}
        aria-label="Copy code"
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Copied
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </span>
        )}
      </button>
      {html ? (
        <div className="shiki-wrapper" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="shiki-wrapper">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
