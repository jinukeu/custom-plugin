---
name: tutor-setup
description: >
  Transforms knowledge sources (PDF/text/web) into a portable markdown StudyVault with structured notes,
  dashboards, and practice questions for active recall.
argument-hint: "[source-path-or-url]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Tutor Setup — Knowledge to Markdown StudyVault

Generates a plain-markdown study vault that renders in any markdown viewer (GitHub, VS Code, mdBook). No Obsidian or proprietary tools required.

> **CWD Boundary**: see [../_shared/cwd-boundary.md](../_shared/cwd-boundary.md).
> **Portability Rules**: see [../_shared/portability-rules.md](../_shared/portability-rules.md). All generated notes MUST follow these.

## Workflow

> Templates: [templates.md](references/templates.md)

### Phase D1: Source Discovery & Extraction

1. **Auto-scan CWD** for `**/*.{pdf,txt,md,html,epub}` (exclude `node_modules/`, `.git/`, `dist/`, `build/`, `StudyVault/`). Present for user confirmation.
2. **Extract text (MANDATORY tools)**:
   - **PDF → `pdftotext` CLI ONLY** via Bash — NEVER use Read directly on PDFs (renders pages as images, wastes 10-50× tokens). Convert to `.txt` first, then Read the `.txt`.
     ```bash
     pdftotext "source.pdf" "/tmp/source.txt"
     ```
     Install if missing: `brew install poppler` (macOS) / `apt-get install poppler-utils` (Linux).
   - URL → WebFetch. Other formats (`.md`, `.txt`, `.html`) → Read directly.
3. **Read extracted `.txt` files** — work exclusively from converted text, never raw PDF.
4. **Source Content Mapping (MANDATORY for multi-file sources)**:
   - Read **cover + TOC + 3+ sample pages from middle/end** for EVERY source file.
   - **NEVER assume content from filename** — file numbering often ≠ chapter numbering.
   - Build verified mapping: `{ source_file → actual_topics → page_ranges }`. Flag non-academic files and missing sources. Present for user verification before proceeding.

### Phase D2: Content Analysis

1. Identify topic hierarchy — sections, chapters, domain divisions.
2. Separate concept content vs practice questions.
3. Map dependencies between topics.
4. Identify key patterns — comparisons, decision trees, formulas.
5. **Full topic checklist (MANDATORY)** — every topic/subtopic listed. Drives all subsequent phases.

> **Equal Depth Rule**: Even a briefly mentioned subtopic MUST get a full dedicated note supplemented with textbook-level knowledge.

6. **Classification completeness**: When source enumerates categories ("3 types of X", "N가지", "categories"), every member gets a dedicated note.
7. **Source-to-note cross-verification (MANDATORY)**: Record source file(s) + page range(s) per topic. Flag untraceable topics as "source not available".

### Phase D3: Keyword Standard

Define keyword vocabulary before notes (stored in `keywords:` frontmatter):
- **Format**: English, lowercase, kebab-case (e.g., `data-hazard`).
- **Hierarchy**: top-level → domain → detail → technique → note-type.
- **Registry**: only registered keywords allowed. Detail keywords co-attach parent domain keywords.

### Phase D4: Vault Structure

Create `StudyVault/` with numbered folders per [templates.md](references/templates.md). Group 3-5 related concepts per file.

### Phase D5: Dashboard Creation

Create `00-Dashboard/`: MOC, Quick Reference, Exam Traps. See [templates.md](references/templates.md).

- **MOC**: Topic Map + Practice Notes + Study Tools + Keyword Index (with rules) + Weak Areas (with links) + Non-core Topic Policy
- **Quick Reference**: every heading includes `→ [Concept Note](relative/path.md)`; all key formulas
- **Exam Traps**: per-topic trap points inside `<details>` blocks, linked to concept notes

Also create the **learning progress dashboard** (`*dashboard*` at `StudyVault/` root, filename localized e.g. `학습 대시보드.md`) per the "Learning Dashboard Template" in [templates.md](references/templates.md). All areas start at ⬜ Undersampled / 0 Mastery. Columns MUST be exactly `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` — matches the schema `tutor` reads. See [../tutor/references/progress-rules.md §2](../tutor/references/progress-rules.md) for the contract.

### Phase D6: Concept Notes

Per [templates.md](references/templates.md). Key rules:
- YAML frontmatter: `source_pdf`, `part`, `keywords` (MANDATORY).
- `source_pdf` MUST match verified Phase D1 mapping — never guess from filename. If unavailable: `source_pdf: 원문 미보유`.
- Comparison tables > prose. ASCII diagrams for processes/flows/sequences.
- **Simplification-with-exceptions**: general statements must note edge cases.

Also create **per-area concept trackers** at `StudyVault/concepts/{area}.md` per "Concept Tracker Template" in [templates.md](references/templates.md):
- **Concepts seed block** (`## Concepts (N total)`): populate from Phase D2 inventory — every distinct concept the area teaches (per Equal Depth Rule). Authoritative total for Coverage downstream.
- **Tracker table**: starts empty (Concept / Attempts / Correct / Streak / Last Tested / Status).
- **Error Notes** section header: present from creation, body empty.

### Phase D7: Practice Questions

Per [templates.md](references/templates.md). Key rules:
- Every topic folder MUST have a practice file (8+ questions).
- **Active recall**: answers wrapped in `<details><summary>정답 보기</summary>…</details>`.
- Patterns wrapped in `<details><summary>핵심 패턴 (클릭하여 보기)</summary>…</details>`.
- **Question type diversity**: ≥60% recall, ≥20% application, ≥2 analysis per file.
- `## Related Concepts` with relative-path links.

### Phase D8: Interlinking

1. `## Related Notes` on every concept note.
2. MOC links to every concept + practice note.
3. Cross-link concept ↔ practice; siblings reference each other.
4. Quick Reference sections → `[Concept Note](relative/path.md)` links.
5. Weak Areas → relevant note + Exam Traps; Exam Traps → concept notes.

### Phase D9: Self-Review (MANDATORY)

Verify against [quality-checklist.md](references/quality-checklist.md). Fix and re-verify until all checks pass.

## Language

- Match source language (Korean → Korean notes). Keywords: ALWAYS English (kebab-case).
