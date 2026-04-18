export type ProficiencyLevel = 'weak' | 'fair' | 'good' | 'mastered' | 'unmeasured'

const LEVEL_COLORS: Record<ProficiencyLevel, { bg: string; text: string; border: string; gradient: string }> = {
  weak: {
    bg: 'bg-red-100 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-800',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  fair: {
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  good: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  mastered: {
    bg: 'bg-blue-100 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  unmeasured: {
    bg: 'bg-ink-100 dark:bg-ink-900',
    text: 'text-ink-500 dark:text-ink-400',
    border: 'border-ink-300 dark:border-ink-700',
    gradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
  },
}

const LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  mastered: 'Mastered',
  unmeasured: 'Unmeasured',
}

export function levelFromRate(rate: number | null): ProficiencyLevel {
  if (rate === null) return 'unmeasured'
  if (rate < 40) return 'weak'
  if (rate < 70) return 'fair'
  if (rate < 90) return 'good'
  return 'mastered'
}

interface Props {
  level: ProficiencyLevel
  rate?: number | null
  size?: 'sm' | 'md' | 'lg'
}

export function ProficiencyBadge({ level, rate, size = 'md' }: Props) {
  const c = LEVEL_COLORS[level]
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sizeClass}`}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: c.gradient }}
      />
      <span>{LEVEL_LABELS[level]}</span>
      {typeof rate === 'number' && <span className="font-mono tabular-nums">{rate}%</span>}
    </span>
  )
}
