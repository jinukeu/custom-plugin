import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

function getMermaidConfig(dark: boolean) {
  return {
    startOnLoad: false,
    theme: 'base' as const,
    themeVariables: dark
      ? {
          fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '13px',
          background: 'rgb(63, 63, 63)',
          primaryColor: 'rgb(63, 63, 63)',
          primaryTextColor: 'rgba(255, 255, 255, 0.81)',
          primaryBorderColor: 'rgba(255, 255, 255, 0.3)',
          lineColor: 'rgba(255, 255, 255, 0.45)',
          secondaryColor: 'rgb(47, 47, 47)',
          tertiaryColor: 'rgb(37, 37, 37)',
        }
      : {
          fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '13px',
          background: '#f7f6f3',
          primaryColor: '#ffffff',
          primaryTextColor: 'rgb(55, 53, 47)',
          primaryBorderColor: 'rgba(55, 53, 47, 0.3)',
          lineColor: 'rgba(55, 53, 47, 0.55)',
          secondaryColor: '#f1f1ef',
          tertiaryColor: '#e3e2e0',
        },
    securityLevel: 'loose' as const,
  }
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
    mermaid.initialize(getMermaidConfig(isDark))
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
      mermaid.initialize(getMermaidConfig(isDark))
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
      <div className="mermaid-render" style={{ color: '#eb5757' }}>
        <pre className="font-mono text-[12px]">{error}</pre>
      </div>
    )
  }
  return <div ref={ref} className="mermaid-render" dangerouslySetInnerHTML={{ __html: svg }} />
}
