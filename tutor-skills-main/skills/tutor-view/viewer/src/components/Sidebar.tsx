import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { vaultTree, getVaultName, type VaultTreeNode } from '@/lib/vault-index'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  onOpenSearch: () => void
}

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

function initialOf(name: string): string {
  const cleaned = name.replace(/^\d+[-_]?\s*/, '').trim()
  return cleaned.slice(0, 1).toUpperCase() || '·'
}

export function Sidebar({ onOpenSearch }: Props) {
  const vaultName = getVaultName()
  const total = countFiles(vaultTree)
  const hue = hueFor(vaultName)

  return (
    <aside
      className="h-screen sticky top-0 w-[252px] flex-shrink-0 flex flex-col text-ui relative"
      style={{
        background: 'var(--bg-sidebar)',
        color: 'var(--text)',
      }}
    >
      {/* Workspace header */}
      <div className="px-2 pt-3 pb-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-[5px] rounded-[4px] transition-colors"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span
            className="inline-flex items-center justify-center w-[22px] h-[22px] text-small rounded"
            style={{
              background: hue.bg,
              color: hue.fg,
              fontWeight: 700,
            }}
          >
            {initialOf(vaultName)}
          </span>
          <span className="text-ui font-semibold truncate flex-1 tracking-tight">
            {vaultName}
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: 'var(--text-light)' }}>
            <path d="M3.5 6L8 10.5 12.5 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Search */}
      <div className="px-2 pb-2">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 px-2 py-[5px] rounded-[4px] transition-colors text-left"
          style={{ color: 'var(--text-gray)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="flex-1 text-ui">Search</span>
          <kbd
            className="text-micro px-[5px] py-[1px] rounded font-sans"
            style={{
              background: 'var(--bg-raised)',
              color: 'var(--text-gray)',
              boxShadow: 'inset 0 -1px 0 rgba(55, 53, 47, 0.08)',
              border: '1px solid var(--divider)',
              fontFamily: 'inherit',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Section: Private */}
      <nav className="flex-1 overflow-y-auto px-1 pb-6">
        <SectionLabel>Private</SectionLabel>
        <TreeNodes nodes={vaultTree.children ?? []} depth={0} />
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-2.5 flex items-center justify-between text-small gap-2"
        style={{ borderTop: '1px solid var(--divider)', color: 'var(--text-gray)' }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ background: 'rgb(46, 170, 112)' }}
          />
          {total} pages
        </span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 pt-4 pb-1.5 text-micro uppercase"
      style={{ color: 'var(--text-light)' }}
    >
      {children}
    </div>
  )
}

function countFiles(node: VaultTreeNode): number {
  if (node.type === 'file') return 1
  return (node.children ?? []).reduce((sum, c) => sum + countFiles(c), 0)
}

function TreeNodes({ nodes, depth }: { nodes: VaultTreeNode[]; depth: number }) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.path || node.name}>
          {node.type === 'folder' ? (
            <FolderItem node={node} depth={depth} />
          ) : (
            <FileItem node={node} depth={depth} />
          )}
        </li>
      ))}
    </ul>
  )
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3zM3 10h19l-2 8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      ) : (
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      )}
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function FolderItem({ node, depth }: { node: VaultTreeNode; depth: number }) {
  const [open, setOpen] = useState(depth === 0)
  const location = useLocation()
  const isActiveInside = location.pathname.includes(encodeURIComponent(node.path))
  const displayName = node.name.replace(/^\d+[-_]?\s*/, '')
  const padLeft = 6 + depth * 16

  return (
    <div>
      <div
        className="group flex items-center rounded-[4px] transition-colors text-ui min-h-[28px]"
        style={{
          color: isActiveInside ? 'var(--text-strong)' : 'var(--text)',
          paddingLeft: `${padLeft}px`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-[20px] h-[20px] rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label={open ? 'Collapse' : 'Expand'}
          style={{ color: 'var(--text-gray)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
          >
            <path d="M4 2l4 4-4 4V2z" />
          </svg>
        </button>
        <span
          className="inline-flex items-center justify-center w-[20px] h-[20px] group-hover:hidden flex-shrink-0"
          style={{ color: 'var(--text-gray)' }}
        >
          <FolderIcon open={open} />
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left truncate py-[3px] pl-[4px] pr-2"
          style={{ color: 'inherit', fontWeight: isActiveInside ? 600 : 500 }}
        >
          {displayName}
        </button>
      </div>
      {open && node.children && (
        <div className="animate-stagger">
          <TreeNodes nodes={node.children} depth={depth + 1} />
        </div>
      )}
    </div>
  )
}

function FileItem({ node, depth }: { node: VaultTreeNode; depth: number }) {
  const location = useLocation()
  const to = '/note/' + encodeURIComponent(node.path)
  const isActive = decodeURIComponent(location.pathname) === decodeURIComponent(to)
  const displayName = node.file?.title ?? node.name
  const padLeft = 6 + depth * 16

  return (
    <Link
      to={to}
      className="group flex items-center rounded-[4px] transition-colors text-ui min-h-[28px]"
      style={{
        background: isActive ? 'var(--bg-hover-strong)' : 'transparent',
        color: isActive ? 'var(--text-strong)' : 'var(--text)',
        paddingLeft: `${padLeft}px`,
        textDecoration: 'none',
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span className="w-[20px] flex-shrink-0" />
      <span
        className="inline-flex items-center justify-center w-[20px] h-[20px] flex-shrink-0"
        style={{ color: 'var(--text-light)' }}
      >
        <FileIcon />
      </span>
      <span className="flex-1 truncate py-[3px] pl-[4px] pr-2">{displayName}</span>
    </Link>
  )
}
