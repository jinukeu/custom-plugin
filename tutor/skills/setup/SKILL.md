---
name: setup
description: >
  Transforms knowledge sources (PDF/text/web) into a portable markdown StudyVault with structured notes,
  dashboards, and practice questions for active recall.
argument-hint: "[source-path-or-url] | --enrich"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Tutor Setup — Knowledge to Markdown StudyVault

Generates a **textbook-grade** plain-markdown study vault that renders in any markdown viewer (GitHub, VS Code, mdBook). The goal: notes alone are sufficient for full learning — no need to consult the source PDF. No Obsidian or proprietary tools required.

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

> **Equal Depth Rule**: Regardless of source length, **expand to the depth required for true conceptual understanding**. Even briefly mentioned subtopics must become full notes containing definition / mechanism / visualization (recommended) / example / exceptions. **No upper bound on body length** — but compress with tables and diagrams wherever possible.

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

Also create the **learning progress dashboard** (`*dashboard*` at `StudyVault/` root, filename localized e.g. `학습 대시보드.md`) per the "Learning Dashboard Template" in [templates.md](references/templates.md). All areas start at ⬜ Undersampled / 0 Mastery. Columns MUST be exactly `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` — matches the schema `quiz` reads. See [../quiz/references/progress-rules.md §2](../quiz/references/progress-rules.md) for the contract.

### Phase D6: Concept Notes — Textbook-Level Depth

Goal: **the note alone must be sufficient to learn the topic without the source PDF**. A reader who has never seen the source should finish the note feeling they understood not just *what* but *why* and *when* the concept applies.

Per [templates.md](references/templates.md). Key rules:
- YAML frontmatter: `source_pdf`, `part`, `keywords` (MANDATORY).
- `source_pdf` MUST match verified Phase D1 mapping — never guess from filename. If unavailable: `source_pdf: 원문 미보유`.
- **Depth-by-type**: body length is determined by content type — definitions stay short, mechanisms / processes / derivations get as much space as needed. **No line-count limit.**
- **Density floor (MANDATORY)**: concept body MUST cover, at minimum, *all five* of: ① one-sentence definition, ② intuition/analogy (왜 이렇게 생겼는지 직관), ③ principle/mechanism/derivation, ④ ≥2 concrete examples with numbers or scenarios, ⑤ common misconceptions (자주 오해하는 점) — each its own subsection. Sections beyond these (visualization, exceptions, application, comparison, history) are added *as the topic demands*, not as a fixed template. Skip a required section ONLY if it is genuinely inapplicable (e.g. pure definition with no mechanism); record the reason in the `Principle` body.
- **Dynamic sectioning**: choose extra sections based on concept type — mechanism → visualization + edge cases; comparison → tradeoff table + sibling links; formula → derivation + dimensional analysis; classification → enumeration with exemplars per class. Do NOT pad with empty headings.
- **Connection (MANDATORY)**: every concept note MUST end with `## Related Notes` containing **prerequisite (선수)**, **sibling (관련)**, and **downstream (이 개념을 쓰는 곳)** links — labeled by role, not just a flat list. At least one link per role if any exist in the Vault.
- **Visualization (recommended)**: for mechanism / process / tradeoff / structure types, prefer visualization. **mermaid first, ASCII as fallback** — if neither conveys meaning well, fall back to tables or prose. Not strictly required, but include whenever it helps. See [templates.md §Visualization Guide].
- **Tables compress facts; prose explains the "why"** — split roles accordingly.
- **Simplification-with-exceptions**: general statements must note edge cases.
- **Self-test**: after writing, ask "can I solve an analysis-type quiz item from this note alone, AND could I explain it to someone with only the prerequisite concepts?". If not, expand the body, intuition, or examples.

### Phase D6.5: Enrichment Mode (`--enrich`)

Triggered when `/setup` is invoked with `--enrich` (no source argument required). Skip Phases D1–D5 and D7+ — operate ONLY on the existing `StudyVault/`.

1. **Scan**: walk `StudyVault/**/*.md` excluding `00-Dashboard/`, `concepts/`, practice files, and the learning dashboard.
2. **Score each concept note** against the Phase D6 *density floor*:
   - Missing any of the 5 required subsections (definition / intuition / principle / ≥2 examples / misconceptions) → **under-spec**.
   - Missing role-labeled `## Related Notes` (prerequisite/sibling/downstream) → **under-spec**.
   - Body length below 2× the average of compliant notes in the same area, AND missing ≥1 required subsection → **under-spec**.
3. **Report**: print the under-spec list with reasons, ask the user to confirm before rewriting.
4. **Regenerate** each confirmed note: re-read its `source_pdf` page range (re-extract with `pdftotext` if needed), preserve YAML frontmatter and `source_pdf`/`part` exactly, rewrite body to satisfy the density floor, and add role-labeled `## Related Notes` resolved from sibling note titles.
5. **Do NOT** touch keywords registry, MOC, dashboards, or practice files — enrichment is body-only. After completion, instruct the user to run `/setup` (no flag) for a full self-review pass if structural changes are desired.

Also create **per-area concept trackers** at `StudyVault/concepts/{area}.md` per "Concept Tracker Template" in [templates.md](references/templates.md):
- **Concepts seed block** (`## Concepts (N total)`): populate at **section granularity, not file granularity**. For each concept note (`NN-<area>/*.md`) in the area, emit **one seed entry per `##` section heading inside the file** — a single `.md` file MUST yield multiple seed entries when it contains multiple `##` sections. Exclude boilerplate sections (`Overview Table`, `Exam/Test Patterns`, `Related Notes`, `Related Concepts`, `시험 빈출 패턴`, `관련 노트`). Label format: `<file-basename> · <section-title>` (or just `<section-title>` if globally unique within the area). Practice files are excluded entirely. This is the authoritative total for Coverage downstream.
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
