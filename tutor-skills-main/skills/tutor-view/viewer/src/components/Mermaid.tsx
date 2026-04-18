import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let mermaidInitialized = false
function initMermaid(dark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'default',
    themeVariables: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
    },
    securityLevel: 'strict',
  })
  mermaidInitialized = true
}

interface Props {
  code: string
}

export function Mermaid({ code }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    if (!mermaidInitialized) initMermaid(isDark)
    const id = 'mermaid-' + Math.random().toString(36).slice(2, 10)
    mermaid
      .render(id, code)
      .then(({ svg }) => {
        setSvg(svg)
        setError(null)
      })
      .catch((e: Error) => {
        setError(e.message)
      })
  }, [code])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        themeVariables: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
        },
        securityLevel: 'strict',
      })
      const id = 'mermaid-' + Math.random().toString(36).slice(2, 10)
      mermaid
        .render(id, code)
        .then(({ svg }) => setSvg(svg))
        .catch(() => {})
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [code])

  if (error) {
    return (
      <div className="mermaid-render text-sm text-red-500">
        <pre>{error}</pre>
      </div>
    )
  }
  return <div ref={ref} className="mermaid-render" dangerouslySetInnerHTML={{ __html: svg }} />
}
