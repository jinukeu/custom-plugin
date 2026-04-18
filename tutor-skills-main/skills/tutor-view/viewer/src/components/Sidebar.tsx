import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { vaultTree, getVaultName, type VaultTreeNode } from '@/lib/vault-index'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  onOpenSearch: () => void
}

export function Sidebar({ onOpenSearch }: Props) {
  const vaultName = getVaultName()
  return (
    <aside className="h-screen sticky top-0 w-72 flex-shrink-0 border-r border-ink-200 dark:border-ink-800 flex flex-col">
      <div className="px-5 py-6 border-b border-ink-200 dark:border-ink-800">
        <Link to="/" className="block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400 dark:text-ink-500 mb-1">
            StudyVault
          </div>
          <div className="font-serif text-xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-ink-50">
            {vaultName}
          </div>
        </Link>
      </div>
      <button
        onClick={onOpenSearch}
        className="mx-4 my-3 flex items-center gap-2 px-3 py-2 text-sm text-ink-500 dark:text-ink-400 bg-ink-100/70 dark:bg-ink-900 rounded-md hover:bg-ink-200 dark:hover:bg-ink-800 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="flex-1 text-left">Search notes</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-200 dark:bg-ink-800 text-ink-600 dark:text-ink-300">⌘K</kbd>
      </button>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-6">
        <TreeNodes nodes={vaultTree.children ?? []} depth={0} />
      </nav>
      <div className="border-t border-ink-200 dark:border-ink-800 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-ink-500 dark:text-ink-400 font-mono">
          {countFiles(vaultTree)} notes
        </span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

function countFiles(node: VaultTreeNode): number {
  if (node.type === 'file') return 1
  return (node.children ?? []).reduce((sum, c) => sum + countFiles(c), 0)
}

function TreeNodes({ nodes, depth }: { nodes: VaultTreeNode[]; depth: number }) {
  return (
    <ul className={depth === 0 ? 'space-y-0.5' : 'mt-0.5 space-y-0.5'}>
      {nodes.map((node) => (
        <li key={node.path || node.name}>
          {node.type === 'folder' ? <FolderItem node={node} depth={depth} /> : <FileItem node={node} depth={depth} />}
        </li>
      ))}
    </ul>
  )
}

function FolderItem({ node, depth }: { node: VaultTreeNode; depth: number }) {
  const [open, setOpen] = useState(true)
  const location = useLocation()
  const isActiveInside = location.pathname.includes(encodeURIComponent(node.path))
  const displayName = node.name.replace(/^\d+[-_]?\s*/, '')
  const isTopLevel = depth === 0

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
          isTopLevel
            ? 'mt-3 first:mt-1 font-serif text-[13px] uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100'
            : 'text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-900'
        } ${isActiveInside && !isTopLevel ? 'bg-ink-100/50 dark:bg-ink-900/50' : ''}`}
        style={{ paddingLeft: `${0.5 + depth * 0.8}rem` }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="truncate">{displayName}</span>
      </button>
      {open && node.children && (
        <div className="animate-fade-in">
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

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 py-1.5 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-900'
      }`}
      style={{ paddingLeft: `${0.5 + depth * 0.8}rem`, paddingRight: '0.5rem' }}
    >
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isActive ? 'bg-accent' : 'bg-ink-300 dark:bg-ink-700'}`} />
      <span className="truncate">{displayName}</span>
    </Link>
  )
}
