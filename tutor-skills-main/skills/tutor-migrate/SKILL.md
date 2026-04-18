---
name: tutor-migrate
description: >
  Migrates an existing Obsidian-style StudyVault (wiki-links, [!tip] callouts,
  inline #tags) to the portable plain-markdown format used by tutor-setup.
  Performs in-place conversion while preserving learning history (error notes,
  concepts/, dashboard). Use when the user says "옵시디언 마이그레이션",
  "마이그레이션", "/tutor-migrate", "convert obsidian vault", "migrate vault".
argument-hint: ""
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Tutor Migrate — Obsidian Vault → Portable Markdown

Converts an existing Obsidian-flavoured StudyVault in CWD to the portable plain-markdown format emitted by `tutor-setup`, **in place**. Learning history is preserved: error notes (오답 메모), concept trackers, and dashboard stats are never deleted — only their syntax is normalized.

## CWD Boundary Rule

> **NEVER access files outside the current working directory (CWD).**
> All scanning, reading, and writing MUST stay within CWD and its subdirectories.
> If the vault is outside CWD, ask the user to move or copy it in first.

---

## Safety Rules (MANDATORY)

```
NEVER DELETE / NEVER REWRITE WHOLESALE:
  - concepts/**                 — 학습 이력 (attempts, correct, 오답 메모)
  - *dashboard*                 — 누적 통계
  - archive/**                  — 과거 이력
  - Any note with frontmatter manual_edits: true

ALLOWED in those files:
  - 문법 변환만 (wiki-link, callout, tag) — 콘텐츠 텍스트 수정 금지
  - 표 내부 숫자/상태/날짜는 절대 건드리지 않음
  - 오답 메모 블록은 내부 wiki-link만 변환, 본문은 그대로

ALWAYS AUTOMATIC:
  - 일반 concept/practice 노트의 wiki-link, callout, tag 변환
  - YAML frontmatter keywords: 병합 (인라인 #tag → keywords)

ALWAYS REQUIRE USER APPROVAL:
  - 미해결 wiki-link (대상 파일을 vault에서 찾지 못함) 처리 방법
  - manual_edits: true 노트의 변환 여부
  - 백업 생성 위치 (.obsidian-backup/ 기본값)
```

---

## Workflow

### Phase M0: Preconditions

1. Detect user's language from their message → `{LANG}`. All user-facing output in `{LANG}`.
2. Glob `**/StudyVault/` in CWD. If not found → "StudyVault가 없습니다. 먼저 `/tutor-setup`을 실행하거나 옵시디언 볼트를 CWD에 옮겨주세요." and stop.
3. Apply CWD Boundary Rule to all subsequent operations.

### Phase M1: Obsidian Syntax Scan

Scan every `.md` file under `StudyVault/` (include `00-Dashboard/`, `NN-*/`, `concepts/`, `archive/`).

Use Grep to count occurrences of each pattern (see [conversion-rules.md](references/conversion-rules.md) for exact regex):

| Pattern | Regex (ripgrep) |
|---------|-----------------|
| Wiki-link | `\[\[[^\]]+\]\]` |
| Foldable callout | `^>\s*\[![a-zA-Z]+\]-` (multiline) |
| Plain callout | `^>\s*\[![a-zA-Z]+\]` (excluding `-` suffix) |
| Inline tag line | `^#[a-z][a-z0-9-]*(\s+#[a-z][a-z0-9-]*)*\s*$` (multiline, excluding `#` headings) |
| Block ref | `\[\[[^\]]*\^[^\]]+\]\]` |
| Embed | `!\[\[[^\]]+\]\]` |

Report counts per pattern and per file. Example:

```
Scan result:
  wiki-links:           182 occurrences in 37 files
  foldable callouts:    23 occurrences in 11 files
  plain callouts:       48 occurrences in 22 files
  inline tag lines:     37 occurrences in 37 files
  block refs:           0
  embeds:               2  ← need manual review
```

### Phase M2: Wiki-Link Resolution Map

Build a mapping `{wiki-target → actual file path}` so each `[[...]]` can be rewritten to a correct relative path.

1. Glob all `.md` files under `StudyVault/`. Index by:
   - **Full relative path** (sans `.md`): e.g. `concepts/확장성 기초`
   - **Basename** (sans `.md`): e.g. `01-단일 서버와 웹-DB 분리`
2. For each `[[target]]` occurrence:
   - Parse into `{path, anchor, alias}` per [conversion-rules.md](references/conversion-rules.md) §1.
   - Resolve `path`:
     a. If `path` matches a full relative path → use it.
     b. Else if basename is unique across vault → use that file.
     c. Else (ambiguous or missing) → add to **unresolved list**.
3. For unresolved entries, use **AskUserQuestion** with options:
   - `Keep as plain text` — strip `[[ ]]`, leave the inner text (e.g. `[[Foo]]` → `Foo`)
   - `Comment out` — wrap as `<!-- TODO: broken link to Foo -->`
   - `Cancel migration` — abort, no changes

### Phase M3: Backup & Plan Approval

1. Propose backup: copy `StudyVault/` → `StudyVault/.obsidian-backup/<YYYYMMDD-HHMMSS>/`.
   - Use `cp -R` via Bash. Exclude nested `.obsidian-backup/` to avoid recursion.
2. Present migration plan table to user:

```markdown
| 변환 | 건수 | 영향 파일 | 학습 이력 영향 |
|------|------|-----------|----------------|
| wiki-link → [text](path.md) | 182 | 37 | concepts/*.md는 링크만 |
| [!tip]/[!warning] → > **Tip:** | 48 | 22 | 영향 없음 |
| [!note]- 접힘 → <details> | 23 | 11 | 영향 없음 |
| 인라인 #tag → frontmatter keywords | 37 | 37 | 없음 |
| 미해결 wiki-link | 3 | - | 사용자 선택 적용 |
```

Use **AskUserQuestion** with options:
- `Apply all (with backup)` — create backup, then apply
- `Apply all (no backup)` — risky, user must confirm twice
- `Dry-run` — write a diff report to `StudyVault/.migration-report.md` and stop
- `Cancel` — abort

### Phase M4: Transformations

Apply per-file transformations using the Edit tool. Exact rules in [conversion-rules.md](references/conversion-rules.md). In addition to syntax conversion, Phase M4 performs **schema backfill** so the migrated vault is compatible with the new progress-rules schema (see [../tutor/references/progress-rules.md §8](../tutor/references/progress-rules.md)).

Summary:

**4a. Wiki-links** (all files including `concepts/`, `*dashboard*`):
- `[[Target]]` → `[Target](relative/path/to/Target.md)`
- `[[Target|Alias]]` → `[Alias](relative/path/to/Target.md)`
- `[[Target#Section]]` → `[Target § Section](relative/path.md#section-slug)`
- `[[path/Target]]` → `[Target](resolved/relative/path.md)` (use last segment as display text)
- Relative path is computed from the **current note's directory** to the target file.

**4b. Callouts** (skip inside `concepts/` error-note bodies — preserve user text verbatim; only convert if the callout line itself is the wrapper):
- `> [!tip]- Title\n> body\n> body` → `<details><summary>Title</summary>\n\nbody\nbody\n\n</details>`
- `> [!tip] Title\n> body` → `> **Tip:** Title\n> body`
- Type mapping: `tip → Tip`, `warning → Warning`, `important → Important`, `note → Note`, `info → Info`, `caution → Caution`, `danger → Danger`, `summary → Summary`, `example → Example`, `question → Question`.
- Unknown types → `> **{Type}:** ...` (Title-case the type, keep body).

**4c. Inline tags** (concept/practice/dashboard files, but NOT `concepts/*.md` error-note tables):
- Detect tag-only lines matching `^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$` (and **NOT** headings — headings require whitespace after `#`, tags do not).
- Extract tag slugs (strip leading `#`).
- **Merge into frontmatter `keywords:`**: union with existing keywords, dedupe, preserve kebab-case.
- **Delete** the original tag line after merging.
- If no frontmatter exists, create one with just `keywords:`.

**4d. Embeds** (`![[File]]`):
- Image embeds (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`) → `![alt](path)` standard image syntax.
- Markdown embeds (other `.md` files) → `<!-- TODO: embed → see [File](path.md) -->` + a normal link. Report count.

**4e. Block refs** (`[[File^id]]`):
- Drop `^id` portion, rewrite as normal link: `[File](path.md)` + append `<!-- TODO: block ref ^id (manual follow-up) -->` comment.

**4f. Schema backfill — `concepts/*.md`** (progress-rules §8):

For each `concepts/{area}.md`:

1. **Insert Streak column** between `Correct` and `Last Tested` in the tracker table.
   - For each existing row: `Streak = Correct if Status == 🟢 else 0`.
   - Header and alignment rows updated accordingly.
2. **Generate `## Concepts (N total)` seed block** at the top (before the tracker table).
   - Scan the corresponding area folder `StudyVault/NN-<area>/*.md`.
   - Exclude practice files (basenames containing `Practice` / `practice` / `문제풀이` / `빈출 문제` / `연습`).
   - List unique concept note basenames (stripped of leading `NN-` numbering) as seeds.
   - Append a one-line HTML comment: `<!-- backfilled from file list; review for accuracy -->`.
   - If an existing `## Concepts` block already exists (unlikely in Obsidian-origin vaults), preserve it and skip this step.

**4g. Schema backfill — `*dashboard*`** (progress-rules §8):

Replace the old proficiency table (columns: 영역 / 정답 / 오답 / 정답률 / 수준 / 상세) with the new 7-column schema (Area / Concepts / Covered / Accuracy / Mastery / Level / Details):

- `Concepts` = seed count per area.
- `Covered` = count(tracker rows) / Concepts.
- `Accuracy` = count(Status=🟢) / count(tracker rows) — display "-" if denominator 0.
- `Mastery` = count(Status=🟢) / Concepts.
- `Level` derived from [progress-rules.md §3](../tutor/references/progress-rules.md).
- `Details` column: convert old `[[concepts/…]]` wiki-link to `[details](../concepts/….md)` style.

Also replace the Stats block with the new field set (Total Concepts / Covered / Mastered / Stale / Unresolved / Weakest / Strongest). All dashboard text labels keep the user's existing language (Korean → Korean, etc.).

The wiki-link conversion from §4a already runs on the dashboard file; §4g only touches column structure and cell values. Numeric aggregates are **recomputed** from the backfilled concept files — this supersedes the pre-migration dashboard numbers, which are stored in the backup for audit.

### Phase M5: Learning-History Integrity Check (MANDATORY)

After transformations, verify `concepts/*.md` and `*dashboard*`. Two categories of checks: **preservation** (must match backup byte-for-byte) and **derived** (must be consistent with the backfill formulas).

**Preservation checks (byte-identical to backup)**:
1. **Row count unchanged** — number of tracker rows per file matches pre-migration count.
2. **Attempts / Correct / Last Tested / Status cells unchanged** — values byte-identical to backup. (These columns never change during migration — only the Streak column is *added*.)
3. **Error-note blocks present** — every `### 오답 메모` / `### Error Notes` section that existed before still exists; every bolded concept label inside is preserved.

**Derived checks (consistent with §8 backfill formulas)**:
4. **Streak column populated correctly** — for every row: `Streak == Correct` when `Status == 🟢`, `Streak == 0` otherwise. No missing or malformed cells.
5. **Concepts seed block present** — every `concepts/*.md` has a `## Concepts (N total)` section with N ≥ 1 (or the HTML comment marker if the area folder is genuinely empty).
6. **Dashboard cross-check** — for each area row in the new dashboard:
   - `Concepts` column = number of bullets in the corresponding seed block.
   - `Covered` numerator = number of tracker rows in the concept file.
   - `Accuracy` / `Mastery` numerators = count of 🟢 rows in the tracker.
   - `Level` badge matches §3 thresholds.

If any check fails:
- STOP. Do not continue.
- Report which file diverged and on which row (preservation) OR which backfill formula failed (derived).
- Offer rollback: `cp -R StudyVault/.obsidian-backup/<ts>/StudyVault/* StudyVault/` (confirm with user before running).

### Phase M6: Self-Review (MANDATORY)

Verify against [migration-checklist.md](references/migration-checklist.md). Most important:

- `rg '\[\[' StudyVault/` returns 0 matches (all wiki-links converted or intentionally commented).
- `rg '^>\s*\[!' StudyVault/` returns 0 matches.
- `rg -n '^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$' StudyVault/` returns 0 matches (all inline tag lines merged).
- All new `[text](path.md)` links point to files that exist (basic link integrity).
- Every note with moved tags has updated `keywords:` in frontmatter.
- Every `concepts/*.md` has the `Streak` column and `## Concepts (N total)` seed block.
- Dashboard column header is `Area | Concepts | Covered | Accuracy | Mastery | Level | Details`.

Fix and re-verify until all checks pass.

### Phase M7: Report

Emit a summary:

```
✅ Migration complete.
- wiki-links converted: 182 (3 unresolved → kept as plain text per user choice)
- callouts converted: 71 (48 plain + 23 foldable)
- inline tag lines merged into keywords: 37
- embeds flagged for manual review: 2
- schema backfill:
    · Streak column added to 7 concepts/ files (N rows total)
    · Concepts seed blocks generated (review recommended for accuracy)
    · Dashboard rebuilt with Coverage/Accuracy/Mastery/Level columns
- learning-history integrity: PASS (preserved columns byte-identical; derived columns match §8 formulas)
- backup: StudyVault/.obsidian-backup/20260418-103012/
```

Remind user:
- Review `## Concepts (N total)` seed blocks in `concepts/*.md` — they were backfilled from area folder file names and may need manual adjustment.
- Run `/tutor` to confirm dashboard/concepts still work (Phase 1.5 should pass silently on a freshly migrated vault).
- Run `/tutor-view` to eyeball the vault.

---

## Portability Rules (target format — inherited from tutor-setup)

All output MUST use standard markdown only:

- **Links**: `[text](relative/path.md)` — never `[[wiki-links]]`
- **Foldable**: `<details><summary>label</summary>body</details>` — never `> [!type]-`
- **Callouts**: `> **Tip:**` / `> **Warning:**` / `> **Important:**` — never `> [!tip]`
- **Keywords**: YAML frontmatter `keywords:` — never inline `#kebab-tag` lines

---

## Language

- User-facing output in user's detected language (`{LANG}`).
- Note content text is never rewritten — only syntax is converted. Language of existing notes is preserved exactly.
- Keyword values remain English kebab-case (existing convention).
