import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { Link } from 'react-router-dom'
import { Mermaid } from './Mermaid'
import { CodeBlock } from './CodeBlock'
import { findFile, resolveImageUrl, type VaultFile } from '@/lib/vault-index'

interface Props {
  file: VaultFile
}

function resolveLink(href: string, currentFolder: string): string | null {
  if (!href || href.startsWith('#')) return null
  if (/^[a-z]+:\/\//i.test(href) || href.startsWith('mailto:')) return null
  const clean = href.replace(/\.md(#.*)?$/, '$1')
  const [pathPart, hash] = clean.split('#')
  const base = currentFolder ? currentFolder.split('/') : []
  const segs = pathPart.split('/')
  const stack = [...base]
  for (const s of segs) {
    if (s === '..') stack.pop()
    else if (s !== '.' && s !== '') stack.push(s)
  }
  const normalized = stack.join('/')
  const exists = findFile(normalized)
  if (exists) return '/note/' + encodeURIComponent(normalized) + (hash ? '#' + hash : '')
  return null
}

export function MarkdownView({ file }: Props) {
  return (
    <div className="prose-vault">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              properties: { className: 'heading-anchor', ariaLabel: 'Link to heading' },
              content: { type: 'text', value: '#' },
            },
          ],
        ]}
        components={{
          a({ href, children, ...rest }) {
            const resolved = href ? resolveLink(href, file.folder) : null
            if (resolved) {
              return (
                <Link to={resolved} {...(rest as any)}>
                  {children}
                </Link>
              )
            }
            if (href?.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById(href.slice(1))
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    history.replaceState(null, '', href)
                  }}
                  {...(rest as any)}
                >
                  {children}
                </a>
              )
            }
            return (
              <a href={href} target="_blank" rel="noreferrer noopener" {...(rest as any)}>
                {children}
              </a>
            )
          },
          img({ src, alt }) {
            if (!src) return null
            const resolved = resolveImageUrl(src, file.folder) ?? src
            return <img src={resolved} alt={alt ?? ''} loading="lazy" />
          },
          code(props) {
            const { className, children, ...rest } = props as any
            const match = /language-(\w+)/.exec(className ?? '')
            const inline = !className
            const code = String(children).replace(/\n$/, '')
            if (inline) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              )
            }
            if (match?.[1] === 'mermaid') {
              return <Mermaid code={code} />
            }
            return <CodeBlock code={code} lang={match?.[1]} />
          },
          pre({ children }) {
            return <>{children}</>
          },
        }}
      >
        {file.content}
      </ReactMarkdown>
    </div>
  )
}

