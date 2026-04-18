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
      theme: isDark ? 'github-dark-dimmed' : 'github-light',
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

  return (
    <div className="relative group my-6">
      <button
        onClick={copy}
        className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs font-medium rounded bg-ink-800/80 text-ink-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink-700"
        aria-label="Copy code"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {html ? (
        <div className="shiki-wrapper rounded-lg overflow-hidden text-[0.9em]" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="rounded-lg">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
