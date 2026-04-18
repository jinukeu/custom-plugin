# Quality Checklist — Self-Review

Before reporting completion, verify every item below. Fix and re-verify if any check fails.

---

## Source Traceability
- [ ] Every source file's content verified (not filename-based assumption)
- [ ] Source content mapping table built and verified in Phase D1
- [ ] Every `source_pdf` frontmatter matches verified mapping
- [ ] Non-academic files excluded and documented
- [ ] Missing sources marked as `원문 미보유`
- [ ] Non-core topic policy documented in MOC

## Coverage
- [ ] Every topic from Phase D2 checklist has a concept note
- [ ] Every enumerated category member has its own note
- [ ] No source topic missing or underrepresented

## Keywords
- [ ] All keywords: English kebab-case, from registry only
- [ ] Keyword Index includes hierarchy rules
- [ ] Detail keywords co-attached with parent domain keywords in frontmatter

## Structure & Formatting
- [ ] Every note has YAML frontmatter: `source_pdf`, `part`, `keywords`
- [ ] Every concept note has comparison table + exam/test patterns section
- [ ] Process/flow topics have ASCII diagrams
- [ ] Notes are concise (tables > prose)
- [ ] Simplified statements include exception caveats

## Dashboard
- [ ] MOC: Topic Map + Practice Notes + Study Tools + Keyword Index + Weak Areas + Non-core Policy
- [ ] MOC links to every concept note AND practice note
- [ ] Weak Areas link to `→ [note](...)` AND `→ [Exam Traps](...)`
- [ ] Exam Traps exists with per-topic `<details>` blocks and bidirectional links

## Quick Reference
- [ ] All key formulas and condition expressions included
- [ ] Every section links to concept note via `→ [Note](...)`

## Practice — Active Recall
- [ ] Every topic folder has practice file (8+ questions)
- [ ] All answers wrapped in `<details><summary>정답 보기</summary>…</details>` — never immediately visible
- [ ] Key Patterns: `<details><summary>핵심 패턴</summary>…</details>`; Pattern Summary: `<details><summary>패턴 요약</summary>…</details>`
- [ ] `## Related Concepts` with backlinks in every practice file
- [ ] Question type diversity: ≥60% recall, ≥20% application, ≥2 analysis per file

## Interlinking
- [ ] Every concept note has `## Related Notes`
- [ ] Relative-path markdown links `[text](path.md)` for all cross-references
- [ ] Siblings reference each other; concept ↔ practice cross-linked
- [ ] Exam Traps ↔ Concept notes bidirectionally linked

## CWD Boundary
- [ ] No source files accessed outside CWD
- [ ] No absolute file paths in notes or frontmatter
- [ ] External URLs accessed only via WebFetch, not file paths
