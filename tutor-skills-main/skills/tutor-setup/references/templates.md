# Templates Reference

## Vault Folder Structure

```
StudyVault/
  00-Dashboard/          # MOC + Quick Reference + Exam Traps
  01-<Topic1>/           # Concept notes per domain
  02-<Topic2>/
  ...
  NN-문제풀이/ (or Practice/)
```

## Learning Dashboard Template (`*dashboard*`)

> Distinct from MOC. Spec of record: [../../tutor/references/progress-rules.md §2, §3](../../tutor/references/progress-rules.md).

```markdown
# Learning Dashboard

> Concept-based metacognition tracking. See linked files for details.

---

## Proficiency by Area

| Area | Concepts | Covered | Accuracy | Mastery | Level | Details |
|------|----------|---------|----------|---------|-------|---------|
| <area-1> | N | 0/N | - | 0/N | ⬜ Undersampled | [details](../concepts/<area-1>.md) |
| **Total** | **sum** | **0/sum** | **-** | **0/sum** | ⬜ Undersampled | |

> ⬜ Undersampled (cov<50%) · 🟥 Weak (mas<40%) · 🟨 Fair (40-69%) · 🟩 Good (70-89%) · 🟦 Mastered (90-100%)

---

## Stats

- **Total Concepts**: <sum>
- **Covered**: 0 / <sum> (-)
- **Mastered (🟢)**: 0 / <sum> (-)
- **Stale (🟡)**: 0
- **Unresolved (🔴)**: 0
- **Weakest Area**: -
- **Strongest Area**: -
```

All areas start at ⬜ Undersampled / 0 Mastery. `tutor` fills as quizzes happen.

## Concept Tracker Template (`concepts/{area}.md`)

One per area. Built with seed populated from Phase D2 (NOT just file count). Tracker starts empty.

```markdown
# {Area Name} — Concept Tracker

## Concepts (N total)

- concept 1
- concept 2
- ...

| Concept | Attempts | Correct | Streak | Last Tested | Status |
|---------|----------|---------|--------|-------------|--------|

### Error Notes

(added as concepts are missed)
```

- **Seed block**: MANDATORY. Every concept the area covers (Equal Depth Rule). Authoritative total for Coverage. Short, human-readable labels.
- **Tracker**: starts empty; `tutor` adds rows on first test. Column order fixed.
- **Error Notes**: header from creation; entries never deleted.

## Dashboard MOC Template

```markdown
---
source_pdf: <list all source files>
part: <part numbers or "all">
keywords: MOC, study map, dashboard, <subject>
---

# <Subject> Study Map

## Overview
- Exam/certification info (if applicable)
- Domain weights or topic importance

## Topic Map
| Section | Source | Notes | Status |
|---------|--------|-------|--------|
| Topic 1 | Part 1 | [Note 1](../01-Topic1/note-1.md), [Note 2](../01-Topic1/note-2.md) | [ ] |

## Practice Notes
| 문제셋 | 문항 수 | 링크 |
|--------|---------|------|
| Topic 1 | N문제 | [Topic 1 Practice](../01-Topic1/practice.md) |

## Study Tools
| 도구 | 설명 | 링크 |
|------|------|------|
| Exam Traps | 시험 함정/오답 포인트 모음 | [Exam Traps](exam-traps.md) |
| Quick Reference | 전체 치트시트 | [빠른 참조](quick-reference.md) |

## Keyword Index
| Keyword | 관련 주제 | 규칙 |
|---------|-----------|------|
| `tag-name` | Brief description | 상위/도메인/세부/기법/유형 |

> **Note:** <1-line summary of keyword hierarchy rule>

## Weak Areas
- [ ] Area needing review → [Relevant Note](../01-Topic1/relevant.md) → [Exam Traps](exam-traps.md)

## Non-core Topic Policy
| Source | Content | Handling |
|--------|---------|----------|
| <file> | <description> | **Excluded** — reason |
```

## Quick Reference Template

- Every section heading MUST include `→ [Concept Note](relative/path.md)` link.
- One-line summary table per concept/term, grouped by category.
- All key formulas + condition expressions.
- "Must-know formulas/patterns" section at bottom with `→ [Note](relative/path.md)` links.

## Exam Traps Template

```markdown
---
keywords: exam traps, weak areas, common mistakes, dashboard
---

# Exam Traps (시험 함정 포인트)

> **Warning:** 시험에서 자주 틀리거나 헷갈리는 포인트만 모은 **오답/함정 노트**입니다.

## <Topic 1>

<details>
<summary>Trap: &lt;Short description&gt;</summary>

- <What the trap is>
- <Why it's confusing>
- <The correct answer/approach>
- [Related Concept Note](../01-Topic1/concept.md)

</details>

---

## Related
- [MOC](moc.md) → Weak Areas
- [빠른 참조](quick-reference.md)
```

## Concept Note Template

```markdown
---
source_pdf: <filename.pdf — MUST match verified Phase 1 mapping>
part: <part number>
keywords: <3-5 English keywords>, <tag-from-registry>
---

# <Title> (<Importance: ★~★★★>)

## Overview Table (한눈에 비교)
| Item | Key Point |
|------|-----------|
| A    | ...       |

## <Concept 1>
Concise explanation (3-5 lines max).
- Bullet points for key facts
- Use **bold** for critical terms

---

## Exam/Test Patterns (시험 빈출 패턴)
| Scenario/Keyword | Answer |
|-------------------|--------|
| "keyword X" | **Solution Y** |

## Related Notes
- [Other Note 1](other-note.md)
```

### Concept Note Rules

- **Links**: relative-path markdown `[text](path.md)`.
- **Callouts**: `> **Tip:**` (helpful) / `> **Important:**` (must-know) / `> **Warning:**` (pitfall).
- **Format**: comparison tables > prose; **bold** for key vocabulary.
- **Visualization**: ASCII diagrams when applicable — process/stages → timeline; data flow → DAG; strategy comparison → table; state behavior → state transitions.
- **Simplification-with-exceptions**: general statements must note edge cases (`> **Warning:**` or link to exception).

## Practice Question Template

```markdown
---
source_pdf: <filename.pdf — MUST match verified Phase 1 mapping>
part: <part number>
keywords: practice, <topic keywords>, <topic-tag>
---

# <Topic> Practice (N questions)

## Related Concepts
- [Concept Note 1](concept-note-1.md)

<details>
<summary>핵심 패턴 (클릭하여 보기)</summary>

| Keyword | Answer |
|---------|--------|
| pattern 1 | **Solution** |

</details>

---

## Question 1 - <Short Label> [recall]
> Scenario summary in one line

<details>
<summary>정답 보기</summary>

Answer text here with explanation.

</details>

---

(Repeat with `[application]` and `[analysis]` tagged questions for diversity.)

---

<details>
<summary>패턴 요약 (클릭하여 보기)</summary>

| Keyword | Answer |
|---------|--------|
| ... | ... |

</details>
```

### Practice Question Rules

- Every topic folder MUST have a practice file (8+ questions).
- **Answer hiding**: ALL answers wrapped in `<details><summary>정답 보기</summary>…</details>`.
- **Patterns**: `<details><summary>핵심 패턴 (클릭하여 보기)</summary>` (top) and `<details><summary>패턴 요약 (클릭하여 보기)</summary>` (bottom).
- **Type diversity** (tag in heading: `[recall]` / `[application]` / `[analysis]`): ≥60% recall, ≥20% application, ≥2 analysis per file.
- Scenario in one `>` blockquote; answer 1-3 lines inside `<details>`.
- `## Related Concepts` with relative-path links (MANDATORY).
