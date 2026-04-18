import { Link } from 'react-router-dom'
import { vaultFiles, findDashboard, getVaultName } from '@/lib/vault-index'

export function HomePage() {
  const vaultName = getVaultName()
  const dashboard = findDashboard()
  const recentFiles = vaultFiles.slice(0, 8)
  const totalFiles = vaultFiles.length
  const folders = new Set(vaultFiles.map((f) => f.folder.split('/')[0]).filter(Boolean))

  return (
    <div className="animate-fade-in">
      <div className="mb-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400 dark:text-ink-500 mb-4 font-mono">
          {totalFiles} notes · {folders.size} sections
        </div>
        <h1 className="font-serif text-[3rem] leading-[1.1] font-semibold tracking-tight text-ink-900 dark:text-ink-50 mb-5">
          {vaultName}
        </h1>
        <p className="text-lg text-ink-600 dark:text-ink-300 max-w-2xl leading-relaxed">
          Your personal study vault. Pick a section from the sidebar or jump straight into the dashboard to see where you stand.
        </p>
      </div>

      {dashboard && (
        <Link
          to={`/note/${encodeURIComponent(dashboard.path)}`}
          className="group block mb-14 p-7 rounded-2xl border border-ink-200 dark:border-ink-800 hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-ink-50 via-ink-50 to-accent/5 dark:from-ink-900 dark:via-ink-900 dark:to-accent/10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-1">
                Learning Dashboard
              </div>
              <div className="font-serif text-2xl font-semibold tracking-tight mb-2 text-ink-900 dark:text-ink-50">
                {dashboard.title}
              </div>
              <div className="text-sm text-ink-500 dark:text-ink-400">
                Proficiency by area · concepts resolved · weakest sections
              </div>
            </div>
            <div className="text-ink-400 group-hover:text-accent transition-colors pt-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400 dark:text-ink-500 mb-4">
          Browse notes
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {recentFiles.map((file) => (
            <Link
              key={file.path}
              to={`/note/${encodeURIComponent(file.path)}`}
              className="group p-4 rounded-xl border border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors"
            >
              <div className="text-[10px] font-mono text-ink-400 mb-1.5 truncate">
                {file.folder || 'root'}
              </div>
              <div className="font-medium text-ink-900 dark:text-ink-50 group-hover:text-accent transition-colors">
                {file.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
