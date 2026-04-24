---
name: tutor-migrate
description: >
  Migrates an Obsidian-style StudyVault (wiki-links, [!tip] callouts, inline #tags) to the portable
  plain-markdown format used by tutor-setup. In-place conversion preserving learning history (error notes,
  concepts/, dashboard). Triggers: "옵시디언 마이그레이션", "마이그레이션", "/tutor-migrate",
  "convert obsidian vault", "migrate vault".
argument-hint: ""
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Tutor Migrate — Obsidian Vault → Portable Markdown

Converts Obsidian-flavoured StudyVault in CWD to portable plain-markdown (the format `tutor-setup` emits), **in place**. Learning history preserved: error notes, concept trackers, dashboard stats — only syntax is normalized.

> **CWD Boundary**: see [../_shared/cwd-boundary.md](../_shared/cwd-boundary.md). If vault is outside CWD, ask user to move/copy it in first.
> **Portability Rules (target format)**: see [../_shared/portability-rules.md](../_shared/portability-rules.md).

## Safety Rules (MANDATORY)

```
NEVER DELETE / NEVER REWRITE WHOLESALE:
  - concepts/**                 — 학습 이력 (attempts, correct, 오답 메모)
  - *dashboard*                 — 누적 통계
  - archive/**                  — 과거 이력
  - manual_edits: true 노트

ALLOWED in those files:
  - 문법 변환만 (wiki-link, callout, tag) — 콘텐츠 텍스트 수정 금지
  - 표 내부 숫자/상태/날짜 절대 수정 금지
  - 오답 메모 블록은 내부 wiki-link만 변환, 본문 그대로

AUTOMATIC:
  - 일반 concept/practice 노트의 wiki-link, callout, tag 변환
  - YAML keywords: 병합 (인라인 #tag → keywords)

REQUIRE APPROVAL (AskUserQuestion):
  - 미해결 wiki-link (vault에서 대상 못 찾음)
  - manual_edits: true 노트 변환 여부
  - 백업 위치 (.obsidian-backup/ 기본값)
```

## Workflow

### Phase M0: Preconditions

1. Detect language → `{LANG}`. All user-facing output in `{LANG}`.
2. Glob `**/StudyVault/`. If not found → "StudyVault가 없습니다. 먼저 `/tutor-setup`을 실행하거나 옵시디언 볼트를 CWD에 옮겨주세요." and stop.

### Phase M1: Obsidian Syntax Scan

Scan every `.md` under `StudyVault/` (include `00-Dashboard/`, `NN-*/`, `concepts/`, `archive/`). Use Grep with regex from [conversion-rules.md](references/conversion-rules.md):

| Pattern | Regex (ripgrep) |
|---------|-----------------|
| Wiki-link | `\[\[[^\]]+\]\]` |
| Foldable callout | `^>\s*\[![a-zA-Z]+\]-` |
| Plain callout | `^>\s*\[![a-zA-Z]+\]` (no `-` suffix) |
| Inline tag line | `^#[a-z][a-z0-9-]*(\s+#[a-z][a-z0-9-]*)*\s*$` (excluding headings) |
| Block ref | `\[\[[^\]]*\^[^\]]+\]\]` |
| Embed | `!\[\[[^\]]+\]\]` |

Report counts per pattern + per file.

### Phase M2: Wiki-Link Resolution Map

Build `{wiki-target → actual file path}` so each `[[...]]` is rewritable.

1. Glob all `.md` under `StudyVault/`. Index by full relative path (sans `.md`) AND basename.
2. For each `[[target]]`, parse into `{path, anchor, alias}` per [conversion-rules.md §1](references/conversion-rules.md). Resolve:
   - Full relative path match → use it.
   - Basename unique across vault → use that file.
   - Else → **unresolved list**.
3. Unresolved: **AskUserQuestion** — `Keep as plain text` (strip `[[ ]]`, leave inner) / `Comment out` (`<!-- TODO: broken link to Foo -->`) / `Cancel migration`.

### Phase M3: Backup & Plan Approval

1. Backup: `cp -R StudyVault/ → StudyVault/.obsidian-backup/<YYYYMMDD-HHMMSS>/` (exclude nested `.obsidian-backup/`).
2. Plan table:
   ```markdown
   | 변환 | 건수 | 영향 파일 | 학습 이력 영향 |
   |------|------|-----------|----------------|
   | wiki-link → [text](path.md) | 182 | 37 | concepts/*.md는 링크만 |
   | [!tip]/[!warning] → > **Tip:** | 48 | 22 | 영향 없음 |
   | [!note]- 접힘 → <details> | 23 | 11 | 영향 없음 |
   | 인라인 #tag → frontmatter keywords | 37 | 37 | 없음 |
   | 미해결 wiki-link | 3 | - | 사용자 선택 적용 |
   ```
3. **AskUserQuestion**: `Apply all (with backup)` / `Apply all (no backup)` (이중 확인) / `Dry-run` (`StudyVault/.migration-report.md`만 작성) / `Cancel`.

### Phase M4: Transformations

Apply per-file transformations using Edit. Exact rules in [conversion-rules.md](references/conversion-rules.md). Includes **schema backfill** to make migrated vault compatible with new progress-rules ([../tutor/references/progress-rules.md §8](../tutor/references/progress-rules.md)).

**4a. Wiki-links** (all files including `concepts/`, `*dashboard*`):
- `[[Target]]` → `[Target](relative/path/to/Target.md)`
- `[[Target|Alias]]` → `[Alias](relative/path/to/Target.md)`
- `[[Target#Section]]` → `[Target § Section](relative/path.md#section-slug)`
- `[[path/Target]]` → `[Target](resolved/relative/path.md)` (last segment as display)
- Relative path computed from current note's directory.

**4b. Callouts** (skip inside `concepts/` error-note bodies — preserve user text verbatim):
- `> [!tip]- Title\n> body` → `<details><summary>Title</summary>\n\nbody\n\n</details>`
- `> [!tip] Title\n> body` → `> **Tip:** Title\n> body`
- Type map: `tip → Tip`, `warning → Warning`, `important → Important`, `note → Note`, `info → Info`, `caution → Caution`, `danger → Danger`, `summary → Summary`, `example → Example`, `question → Question`. Unknown → `> **{Type}:** ...` (Title-case).

**4c. Inline tags** (concept/practice/dashboard, but NOT `concepts/*.md` error-note tables):
- Detect tag-only lines `^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$` (NOT headings — headings require space after `#`).
- Strip leading `#`, **merge into frontmatter `keywords:`** (union, dedupe, preserve kebab-case). **Delete** the original line.
- If no frontmatter, create one with just `keywords:`.

**4d. Embeds** (`![[File]]`):
- Image (`.png`/`.jpg`/etc) → `![alt](path)` standard.
- Markdown embeds → `<!-- TODO: embed → see [File](path.md) -->` + normal link. Report count.

**4e. Block refs** (`[[File^id]]`):
- Drop `^id`, rewrite as normal link + append `<!-- TODO: block ref ^id (manual follow-up) -->`.

**4f. Schema backfill — `concepts/*.md`** (progress-rules §8):

For each `concepts/{area}.md`:

1. **Insert `Streak` column** between `Correct` and `Last Tested`. For each row: `Streak = Correct if Status == 🟢 else 0`. Update header + alignment row.
2. **Generate `## Concepts (N total)` seed block** at top (before tracker):
   - Scan corresponding area folder `StudyVault/NN-<area>/*.md`.
   - Exclude practice files (basenames containing `Practice`/`practice`/`문제풀이`/`빈출 문제`/`연습`).
   - List unique concept basenames (stripped of `NN-` numbering) as seeds.
   - Append: `<!-- backfilled from file list; review for accuracy -->`.
   - Skip if existing `## Concepts` block already present.

**4g. Schema backfill — `*dashboard*`** (progress-rules §8):

Replace old proficiency table (영역/정답/오답/정답률/수준/상세) with new 7-column schema (`Area | Concepts | Covered | Accuracy | Mastery | Level | Details`):

- `Concepts` = seed count per area.
- `Covered` = tracker rows / Concepts.
- `Accuracy` = 🟢 count / tracker rows ("-" if denom 0).
- `Mastery` = 🟢 count / Concepts.
- `Level` from [§3](../tutor/references/progress-rules.md).
- `Details` = `[details](../concepts/<area>.md)` (converted from old wiki-link).

Replace Stats block with new fields (Total Concepts / Covered / Mastered / Stale / Unresolved / Weakest / Strongest). Labels keep user's existing language.

§4a wiki-link conversion already runs on dashboard; §4g touches column structure + cell values. Numerics **recomputed** from backfilled concept files (supersedes pre-migration numbers; backup retains audit trail).

### Phase M5: Learning-History Integrity Check (MANDATORY)

Verify `concepts/*.md` and `*dashboard*` after transformations.

**Preservation (byte-identical to backup)**:
1. **Row count** unchanged per file.
2. **Attempts / Correct / Last Tested / Status** cells byte-identical (only Streak is *added*).
3. **Error-note blocks** present — every existing `### 오답 메모` / `### Error Notes` retained, every bolded label preserved.

**Derived (consistent with §8 formulas)**:
4. **Streak populated**: `Streak == Correct` when `Status == 🟢`, else `0`. No malformed cells.
5. **Seed block present**: every `concepts/*.md` has `## Concepts (N total)` with N ≥ 1 (or HTML comment if area is empty).
6. **Dashboard cross-check**: `Concepts` = seed bullets; `Covered` numerator = tracker rows; `Accuracy`/`Mastery` numerators = 🟢 count; `Level` matches §3.

If any check fails: **STOP**. Report which file/row diverged or which formula failed. Offer rollback: `cp -R StudyVault/.obsidian-backup/<ts>/StudyVault/* StudyVault/` (confirm before running).

### Phase M6: Self-Review (MANDATORY)

Verify against [migration-checklist.md](references/migration-checklist.md). Most important:

- `rg '\[\[' StudyVault/` → 0 matches
- `rg '^>\s*\[!' StudyVault/` → 0 matches
- `rg -n '^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$' StudyVault/` → 0 matches
- All new `[text](path.md)` links exist (basic integrity).
- Every note with moved tags has updated `keywords:`.
- Every `concepts/*.md` has `Streak` column + `## Concepts (N total)` seed.
- Dashboard header is `Area | Concepts | Covered | Accuracy | Mastery | Level | Details`.

Fix and re-verify until all pass.

### Phase M7: Report

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
- learning-history integrity: PASS (preserved columns byte-identical; derived columns match §8)
- backup: StudyVault/.obsidian-backup/20260418-103012/
```

Remind user:
- Review `## Concepts (N total)` seed blocks — backfilled from filenames, may need adjustment.
- Run `/tutor` to confirm dashboard/concepts work (Phase 1.5 should pass silently).
- Run `/tutor-view` to eyeball.

## Language

User-facing output in `{LANG}`. Note content text is never rewritten — only syntax. Existing note language preserved exactly. Keyword values remain English kebab-case.
