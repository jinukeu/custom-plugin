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

> Distinct from MOC. Spec of record: [../../quiz/references/progress-rules.md §2, §3](../../quiz/references/progress-rules.md).

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

All areas start at ⬜ Undersampled / 0 Mastery. `quiz` fills as quizzes happen.

## Concept Tracker Template (`concepts/{area}.md`)

One per area. Built with seed populated from Phase D2 (NOT just file count). Tracker starts empty.

```markdown
# {Area Name} — Concept Tracker

## Concepts (N total)

- file-a · section 1
- file-a · section 2
- file-b · section 1
- ...

| Concept | Attempts | Correct | Streak | Last Tested | Status |
|---------|----------|---------|--------|-------------|--------|

### Error Notes

(added as concepts are missed)
```

- **Seed block**: MANDATORY. **Section-level granularity** — for each concept note in the area, emit one seed per `##` heading inside that file (excluding `Overview Table`, `Exam/Test Patterns` / `시험 빈출 패턴`, `Related Notes` / `Related Concepts` / `관련 노트`). One `.md` file → multiple seed entries. Practice files excluded. Label format: `<file-basename> · <section-title>` (or `<section-title>` alone if globally unique within the area). Authoritative total for Coverage.
- **Tracker**: starts empty; `quiz` adds rows on first test, `lesson` adds rows on first explanation (Status = `📘`). Column order fixed. Status enum: `📘` learned (lesson-only) / `🔴` unresolved / `🟡` tentative or stale / `🟢` confirmed. See [../../quiz/references/progress-rules.md §1, §4](../../quiz/references/progress-rules.md).
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

## Concept Note Template — Textbook-Level Depth

Goal: **the note alone is sufficient to learn the topic without the source PDF**. Section headings inside generated notes should be localized to the source language (e.g. Korean source → `### 정의`, `### 원리`); the English headings below are the canonical labels.

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

## <Concept 1> [definition|mechanism|process|tradeoff|formula|structure|classification]

### Definition (정의)
One-sentence definition + 1-2 lines on why it matters (2-4 lines total).

### Intuition / Analogy (직관·비유)  ← MANDATORY
2-5 lines that answer "왜 이게 이렇게 생겼는가?" before any formalism. Use a real-world analogy, a degenerate case ("if N=1 …"), or a "before/after this concept existed" framing. The reader should feel the *shape* of the idea here, not memorize a definition.

### Principle / Derivation / Mechanism (원리)
No length limit. Explain the "why" thoroughly so the learner truly understands.
- Causal relationships, mechanisms, formula derivations
- Tables compress facts, prose explains causality/principle (split roles)
- **bold** for critical terms

### Visualization (recommended — for mechanism / process / tradeoff / structure types)
Prefer mermaid; fall back to ASCII when mermaid struggles; omit if neither helps.

​```mermaid
flowchart LR
  A[Input] --> B{Decision}
  B -->|yes| C[Path 1]
  B -->|no| D[Path 2]
​```

Or ASCII:

​```
┌─────────┐   transition   ┌─────────┐
│ State A │ ─────────────▶ │ State B │
└─────────┘                └─────────┘
​```

### Examples (예시 — ≥2 required)
Provide **at least two** concrete examples with different *shape* (don't just change numbers in the same template).
- Example 1 — Input: ... / Output: ... / Why this output: ...
- Example 2 — A degenerate, edge, or contrasting scenario with concrete numbers/context.

### Common Misconceptions (자주 오해하는 점)  ← MANDATORY
2-4 bullets, each in the form **"X라고 생각하기 쉽지만 실제로는 Y — 이유는 Z"**. Cover at least one mix-up with a sibling concept and one wrong intuition that the formal definition does NOT rule out.

### Exceptions / Edge Cases (선택)
> **Warning:** conditions under which the generalization breaks, and what happens then.

### Application / When to use (선택 — comparison/tradeoff/decision concepts에 권장)
실제로 이 개념을 꺼내 쓰는 상황 + 비슷한 개념 대신 이걸 골라야 하는 신호.

---

## Exam/Test Patterns (시험 빈출 패턴)
| Scenario/Keyword | Answer |
|-------------------|--------|
| "keyword X" | **Solution Y** |

## Related Notes  ← role-labeled (MANDATORY)
- **선수 개념 (prerequisite)**: [Concept A](../01-Topic/a.md) — why it must come first
- **관련 개념 (sibling)**: [Concept B](b.md) — how they differ
- **이 개념을 쓰는 곳 (downstream)**: [Concept C](../03-Topic/c.md) — what builds on this
```

### Concept Note Rules

- **Links**: relative-path markdown `[text](path.md)`.
- **Callouts**: `> **Tip:**` (helpful) / `> **Important:**` (must-know) / `> **Warning:**` (pitfall).
- **Density floor (MANDATORY)**: every concept MUST contain Definition, Intuition/Analogy, Principle/Mechanism, ≥2 Examples, and Common Misconceptions sections. Skip ONLY if genuinely inapplicable; state the reason inline.
- **Dynamic sectioning**: extra sections (Visualization, Exceptions, Application, Comparison) are chosen by concept type — do NOT add empty headings to satisfy a template, and do NOT omit the 5 mandatory sections to keep things short.
- **Depth-by-type**: body length is determined by content type. Definitions stay short; mechanism / process / derivation types get as much room as needed. **No line-count limit.** As a calibration: if your note for a non-trivial mechanism concept is under ~40 lines of body (excluding frontmatter, headings, links), it is almost certainly under-spec.
- **Format**: facts in tables, causality/principle in prose, visual patterns in diagrams — split by role.
- **Visualization (recommended)**: for mechanism / process / tradeoff / structure types, prefer visualization. mermaid first, ASCII fallback. Not required, but include whenever it helps. See §Visualization Guide.
- **Examples ≥2**: each example must have a *different shape* (not just different numbers in the same template). Concrete input/output, numbers, or scenario.
- **Misconceptions ≥2**: each in "X로 보이지만 실은 Y — 이유 Z" form; at least one mix-up with a sibling concept.
- **Related Notes role-labeled**: prerequisite / sibling / downstream — labeled, not a flat list.
- **Simplification-with-exceptions**: general statements must note edge cases (`> **Warning:**` or link to exception).
- **Self-test**: ask "can I solve an analysis-type quiz item from this note alone, AND could I explain this to someone who only knows the prerequisites?" — if not, expand.

## Visualization Guide

For mechanism / process / tradeoff / structure concepts, visualization is recommended. **Not strictly required**, but if tables and prose do not convey meaning clearly, try a diagram first.

### Mermaid first, ASCII fallback

- **Default to mermaid** — renders in GitHub / VS Code / mdBook / `tutor view`.
- **Use ASCII** when mermaid is awkward (memory layouts, bit fields, coordinate plots) or when inline emphasis is needed.
- **If neither fits**, fall back to tables and prose — do not force a diagram.

### Tool matrix

| Content type | 1st choice (mermaid) | 2nd choice (ASCII) |
|---|---|---|
| State transitions / decision branches | `stateDiagram-v2` / `flowchart` | boxes + arrows |
| Time order / steps | `sequenceDiagram` | timeline |
| Hierarchy / taxonomy | `graph TD` | tree (`├─ └─`) |
| Data flow (DAG) | `flowchart LR` | box chain |
| Memory / packet / bit layout | — | ASCII box (required) |
| Comparison / tradeoffs | (prefer table) | (prefer table) |
| Algorithm pseudocode | — | fenced code block |
| Graph / coordinates | `xychart-beta` | ASCII plot |

### ASCII diagram rules

- Box characters: `┌ ┐ └ ┘ │ ─ ├ ┤ ┬ ┴ ┼` (Unicode box-drawing).
- Arrows: `→ ← ↑ ↓ ↔` or `-->` `<--`.
- Uniform box widths; align horizontal arrow lines.
- **Width ≤ 80 characters.**

### Mermaid authoring rules

- Fence: ` ```mermaid ` … ` ``` ` (do not confuse with other code fences).
- Node IDs in ASCII alphanumerics; labels may contain non-ASCII (e.g. `A[입력 데이터]`).
- Keep ≤ 12 nodes per diagram — split if larger.
- No color dependence — distinguish meaning by label/shape so it survives monochrome rendering.

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
