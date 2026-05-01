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

function quoteLabel(open: string, inner: string, close: string): string {
  const trimmed = inner.trim()
  if (!trimmed) return open + inner + close
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return open + inner + close
  const needsQuote = /[\s()[\]{}]/.test(trimmed)
  if (!needsQuote) return open + inner + close
  const escaped = trimmed.replace(/"/g, '#quot;')
  return open + '"' + escaped + '"' + close
}

function preprocessMermaid(code: string): string {
  const lines = code.split('\n')
  let inFlowchart = false
  return lines
    .map((line) => {
      const stripped = line.trim()
      if (/^(flowchart|graph)\s+/i.test(stripped)) {
        inFlowchart = true
        return line
      }
      if (/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|sankey|block-beta|gitGraph|c4Context|requirementDiagram)/i.test(stripped)) {
        inFlowchart = false
        return line
      }
      if (!inFlowchart) return line

      let out = line
      // Node labels: [..], (..), ((..)), {..}, [(..)] etc.
      out = out.replace(/(\[\[|\(\(|\[\(|\(\[|\{\{|\[|\(|\{)([^\[\]\(\)\{\}|"]*?)(\]\]|\)\)|\)\]|\]\)|\}\}|\]|\)|\})/g, (m, open, inner, close) => {
        return quoteLabel(open, inner, close)
      })
      // Edge labels: |...|
      out = out.replace(/\|([^|"]+)\|/g, (m, inner) => {
        const trimmed = inner.trim()
        if (!trimmed) return m
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return m
        if (!/[\s()[\]{}]/.test(trimmed)) return m
        return '|"' + trimmed.replace(/"/g, '#quot;') + '"|'
      })
      return out
    })
    .join('\n')
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
      .render(id, preprocessMermaid(code))
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
        .render(id, preprocessMermaid(code))
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
