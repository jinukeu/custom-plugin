---
name: tutor-setup
description: >
  Transforms knowledge sources (PDF/text/web) into a portable markdown StudyVault
  with structured notes, dashboards, and practice questions for active recall.
argument-hint: "[source-path-or-url]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Tutor Setup — Knowledge to Markdown StudyVault

Generates a plain-markdown study vault that renders in any markdown viewer (GitHub, VS Code, mdBook, etc.) — no Obsidian or other proprietary tools required.

## CWD Boundary Rule

> **NEVER access files outside the current working directory (CWD).**
> All source scanning, reading, and vault output MUST stay within CWD and its subdirectories.
> If the user provides an external path, ask them to copy the files into CWD first.

---

## Workflow

> Transforms knowledge sources (PDF, text, web, epub) into study notes.
> Templates: [templates.md](references/templates.md)

### Phase D1: Source Discovery & Extraction

1. **Auto-scan CWD** for `**/*.pdf`, `**/*.txt`, `**/*.md`, `**/*.html`, `**/*.epub` (exclude `node_modules/`, `.git/`, `dist/`, `build/`, `StudyVault/`). Present for user confirmation.
2. **Extract text (MANDATORY tools)**:
   - **PDF → `pdftotext` CLI ONLY** (run via Bash tool). NEVER use the Read tool directly on PDF files — it renders pages as images and wastes 10-50x more tokens. Convert to `.txt` first, then Read the `.txt` file.
     ```bash
     pdftotext "source.pdf" "/tmp/source.txt"
     ```
   - If `pdftotext` is not installed, install it first: `brew install poppler` (macOS) or `apt-get install poppler-utils` (Linux).
   - URL → WebFetch
   - Other formats (`.md`, `.txt`, `.html`) → Read directly.
3. **Read extracted `.txt` files** — understand scope, structure, depth. Work exclusively from the converted text, never from the raw PDF.
4. **Source Content Mapping (MANDATORY for multi-file sources)**:
   - Read **cover page + TOC + 3+ sample pages from middle/end** for EVERY source file
   - **NEVER assume content from filename** — file numbering often ≠ chapter numbering
   - Build verified mapping: `{ source_file → actual_topics → page_ranges }`
   - Flag non-academic files and missing sources
   - Present mapping to user for verification before proceeding

### Phase D2: Content Analysis

1. Identify topic hierarchy — sections, chapters, domain divisions.
2. Separate concept content vs practice questions.
3. Map dependencies between topics.
4. Identify key patterns — comparisons, decision trees, formulas.
5. **Full topic checklist (MANDATORY)** — every topic/subtopic listed. Drives all subsequent phases.

> **Important:** Equal Depth Rule — Even a briefly mentioned subtopic MUST get a full dedicated note supplemented with textbook-level knowledge.

6. **Classification completeness**: When source enumerates categories ("3 types of X"), every member gets a dedicated note. Scan for: "types of", "N가지", "categories", "there are N".
7. **Source-to-note cross-verification (MANDATORY)**: Record which source file(s) and page range(s) cover each topic. Flag untraceable topics as "source not available".

### Phase D3: Keyword Standard

Define keyword vocabulary before creating notes (stored in each note's `keywords:` frontmatter field):
- **Format**: English, lowercase, kebab-case (e.g., `data-hazard`)
- **Hierarchy**: top-level → domain → detail → technique → note-type
- **Registry**: Only registered keywords allowed. Detail keywords co-attach parent domain keywords.

### Phase D4: Vault Structure

Create `StudyVault/` with numbered folders per [templates.md](references/templates.md). Group 3-5 related concepts per file.

### Phase D5: Dashboard Creation

Create `00-Dashboard/`: MOC, Quick Reference, Exam Traps. See [templates.md](references/templates.md).

- **MOC**: Topic Map + Practice Notes + Study Tools + Keyword Index (with rules) + Weak Areas (with links) + Non-core Topic Policy
- **Quick Reference**: every heading includes `→ [Concept Note](relative/path.md)` link; all key formulas
- **Exam Traps**: per-topic trap points inside `<details>` blocks, linked to concept notes

Also create the **learning progress dashboard** (`*dashboard*` at `StudyVault/` root, filename localized, e.g. `학습 대시보드.md`) per the "Learning Dashboard Template" in [templates.md](references/templates.md). All areas start at ⬜ Undersampled / 0 Mastery. The columns must be exactly `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` — this matches the schema `tutor` reads. See [../../tutor/references/progress-rules.md §2](../tutor/references/progress-rules.md) for the contract.

### Phase D6: Concept Notes

Per [templates.md](references/templates.md). Key rules:
- YAML frontmatter: `source_pdf`, `part`, `keywords` (MANDATORY)
- **source_pdf MUST match verified Phase D1 mapping** — never guess from filename
- If unavailable: `source_pdf: 원문 미보유`
- Relative-path markdown links `[text](path.md)`, bold-label blockquote callouts (`> **Tip:**`, `> **Important:**`, `> **Warning:**`), comparison tables > prose
- ASCII diagrams for processes/flows/sequences
- **Simplification-with-exceptions**: general statements must note edge cases

Also in this phase, create **per-area concept trackers** at `StudyVault/concepts/{area}.md` per the "Concept Tracker Template" in [templates.md](references/templates.md):
- **Concepts seed block** (`## Concepts (N total)`): populate from the Phase D2 concept inventory for this area — every distinct concept the area teaches, even if only briefly mentioned (per Equal Depth Rule). This is the authoritative total for Coverage calculation downstream.
- **Tracker table**: starts empty (Concept / Attempts / Correct / Streak / Last Tested / Status columns).
- **Error Notes** section header: present from creation, body empty.

### Phase D7: Practice Questions

Per [templates.md](references/templates.md). Key rules:
- Every topic folder MUST have a practice file (8+ questions)
- **Active recall**: answers wrapped in `<details><summary>정답 보기</summary>…</details>`
- Patterns wrapped in `<details><summary>핵심 패턴 (클릭하여 보기)</summary>…</details>` / `<details><summary>패턴 요약 (클릭하여 보기)</summary>…</details>`
- **Question type diversity**: ≥60% recall, ≥20% application, ≥2 analysis per file
- `## Related Concepts` with relative-path links

### Phase D8: Interlinking

1. `## Related Notes` on every concept note
2. MOC links to every concept + practice note
3. Cross-link concept ↔ practice; siblings reference each other
4. Quick Reference sections → `[Concept Note](relative/path.md)` links
5. Weak Areas → relevant note + Exam Traps; Exam Traps → concept notes

### Phase D9: Self-Review (MANDATORY)

Verify against [quality-checklist.md](references/quality-checklist.md). Fix and re-verify until all checks pass.

---

## Portability Rules (MANDATORY for all generated notes)

The generated StudyVault must render correctly in any standard markdown viewer. Do NOT use Obsidian-specific syntax:

- **Links**: Use `[text](relative/path.md)` — never `[[wiki-links]]`
- **Foldable content** (answers, hints, trap descriptions): Use `<details><summary>label</summary>body</details>` — never `> [!type]-` callouts
- **Non-foldable callouts**: Use `> **Tip:** ...` / `> **Warning:** ...` / `> **Important:** ...` — never `> [!tip]` / `> [!warning]` / `> [!important]`
- **Keywords/tags**: Put in YAML frontmatter `keywords:` field — do not use inline `#kebab-tag` lines that rely on Obsidian's tag graph

---

## Language

- Match source material language (Korean → Korean notes, etc.)
- **Keywords**: ALWAYS English
