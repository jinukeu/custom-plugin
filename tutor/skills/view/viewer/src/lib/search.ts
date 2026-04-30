import Fuse from 'fuse.js'
import { vaultFiles, type VaultFile } from './vault-index'

export interface SearchResult {
  file: VaultFile
  headingId?: string
  headingText?: string
  score: number
}

const titleFuse = new Fuse(vaultFiles, {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'path', weight: 0.2 },
    { name: 'frontmatter.keywords', weight: 0.2 },
    { name: 'content', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

const headings: { file: VaultFile; text: string; id: string }[] = []
for (const file of vaultFiles) {
  for (const h of file.headings) {
    headings.push({ file, text: h.text, id: h.id })
  }
}
const headingFuse = new Fuse(headings, {
  keys: ['text'],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

export function searchVault(query: string, limit = 12): SearchResult[] {
  if (!query.trim()) return []
  const results: SearchResult[] = []
  const titleResults = titleFuse.search(query, { limit })
  for (const r of titleResults) {
    results.push({ file: r.item, score: r.score ?? 1 })
  }
  const headingResults = headingFuse.search(query, { limit })
  for (const r of headingResults) {
    results.push({
      file: r.item.file,
      headingId: r.item.id,
      headingText: r.item.text,
      score: (r.score ?? 1) + 0.05,
    })
  }
  const seen = new Set<string>()
  return results
    .sort((a, b) => a.score - b.score)
    .filter((r) => {
      const key = r.file.path + '#' + (r.headingId ?? '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, limit)
}
