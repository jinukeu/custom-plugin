# Quality Checklist — Self-Review

Verify every item before declaring completion. Fix and re-verify on any failure.

## Source Traceability
- [ ] Every source file's content verified (NOT filename-based)
- [ ] Source mapping table built and verified in Phase D1
- [ ] Every `source_pdf` matches verified mapping (or `원문 미보유`)
- [ ] Non-academic files excluded; missing sources documented in MOC

## Coverage
- [ ] Every Phase D2 checklist topic has a concept note
- [ ] Every enumerated category member has its own note (Equal Depth Rule)

## Keywords
- [ ] All keywords: English kebab-case, from registry only
- [ ] Detail keywords co-attached with parent domain keywords

## Structure & Formatting
- [ ] YAML frontmatter present: `source_pdf`, `part`, `keywords`
- [ ] Concept notes: comparison table + exam/test patterns section
- [ ] Process/flow topics have ASCII diagrams
- [ ] Simplified statements include exception caveats

## Dashboard
- [ ] MOC: Topic Map + Practice Notes + Study Tools + Keyword Index + Weak Areas + Non-core Policy
- [ ] MOC links to every concept AND practice note
- [ ] Weak Areas link to note + Exam Traps; bidirectional
- [ ] Quick Reference: every section links to concept note; key formulas included

## Practice — Active Recall
- [ ] Every topic folder has practice file (8+ questions)
- [ ] Answers wrapped in `<details><summary>정답 보기</summary>…</details>` (never visible by default)
- [ ] Patterns wrapped in `<details><summary>핵심 패턴/패턴 요약</summary>…</details>`
- [ ] Question type diversity per file: ≥60% recall, ≥20% application, ≥2 analysis
- [ ] `## Related Concepts` with backlinks

## Interlinking
- [ ] Every concept note has `## Related Notes`
- [ ] All cross-references use relative-path markdown `[text](path.md)`
- [ ] Siblings reference each other; concept ↔ practice cross-linked

## CWD Boundary
- [ ] No source files accessed outside CWD
- [ ] No absolute file paths in notes/frontmatter
- [ ] External URLs accessed only via WebFetch
