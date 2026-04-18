---
name: tutor-sync
description: >
  Auto-detects changes in source materials (PDF/MD/TXT/HTML/EPUB/URL) within CWD
  and incrementally updates the StudyVault — only affected notes are regenerated.
  Learning-progress files (*dashboard*, concepts/) are synced safely: Error notes
  are never deleted, and destructive changes (rename/merge/archive) require user
  approval. Use when the user says "자료 업데이트", "동기화", "변경분 반영",
  "/tutor-sync", "study materials changed", "resync vault", "재생성", "sync vault".
argument-hint: ""
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Tutor Sync — Incremental StudyVault Update

Detects changes in source materials since the last build and incrementally updates the StudyVault produced by `tutor-setup`. Preserves learning-progress data owned by `tutor`.

## CWD Boundary Rule

> **NEVER access files outside the current working directory (CWD).**
> All source scanning, reading, and vault output MUST stay within CWD and its subdirectories.
> If the user provides an external path, ask them to copy the files into CWD first.

---

## Safety Rules (MANDATORY)

```
NEVER DELETE (even when out-of-sync with source):
  - Error notes (오답 메모) — 학습 이력 전체 보존
  - concepts/**, *dashboard*, archive/** — 파일 자체 삭제 금지 (archive로 이동만)

ALWAYS REQUIRE USER APPROVAL for:
  - concepts/{area}.md rename / merge / archive 이동
  - *dashboard* 의 area 행 rename / archive 표시
  - 콘텐츠 노트 archive 이동

ALWAYS AUTOMATIC (non-destructive):
  - 새 area 추가 시 *dashboard* Proficiency 표에 ⬜ Undersampled 행 추가 + concepts/{area}.md 생성 (seed block populate, tracker 비움)
  - content-stale concept 행에 ⚠️ 플래그 추가 (삭제 아님) — 🟡 time-stale (progress-rules §6)과 별개
  - Coverage / Accuracy / Mastery / Level 재계산 (progress-rules §2, §3)

ALWAYS SKIP:
  - manual_edits: true frontmatter가 있는 콘텐츠 노트
```

---

## Workflow

### Phase S0: Preconditions

1. Detect user's language from their message → `{LANG}`. All user-facing output in `{LANG}`.
2. Glob `**/StudyVault/` in CWD.
   - If not found → inform user "StudyVault가 없습니다. 먼저 `/tutor-setup`을 실행하세요." and stop.
3. Apply CWD Boundary Rule to all subsequent operations.

### Phase S1: Manifest Load (백필 포함)

1. Try to read `StudyVault/.manifest.json`.
2. **If missing → Backfill Mode** (1회 한정):
   - Read every concept/practice note in `StudyVault/**/*.md` (exclude `concepts/`, `*dashboard*`, `archive/`).
   - Parse each note's YAML frontmatter — collect `source_pdf` values.
   - Build source → note[] mapping from frontmatter.
   - Scan CWD sources, compute hashes per Phase S2 normalization rules.
   - Write initial `.manifest.json` per [manifest-schema.md](references/manifest-schema.md).
   - Inform user: "백필 완료. 이번 실행은 기준선 생성만 수행했으며, 변경 감지는 다음 `/tutor-sync` 실행부터 동작합니다."
   - Stop (do not proceed to diff).

### Phase S2: Source Scan & Hashing

Scan CWD: `**/*.{pdf,md,txt,html,epub}`.

Exclusions:
- `node_modules/`, `.git/`, `dist/`, `build/`
- `StudyVault/**`, `.tutor-view/**`
- Any file inside a directory the user flagged in `.manifest.json`'s `exclude` field (if present)

Per-format normalization (see [manifest-schema.md](references/manifest-schema.md) for full commands):

| Extension | Normalization | Hash input |
|-----------|---------------|------------|
| `.pdf` | `pdftotext "file.pdf" -` (stdout) | stdout bytes |
| `.md` | Read file as-is | file bytes |
| `.txt` | Read file as-is | file bytes |
| `.html` | `pandoc -f html -t plain` (fallback: strip `<...>`) | plain text |
| `.epub` | `pandoc -f epub -t plain` | plain text |
| URL (manifest only) | WebFetch → body | fetched text |

> **Important:** PDFs MUST be normalized via `pdftotext` — never use Read directly (wastes 10-50x tokens rendering pages as images). If `pdftotext` is missing, install first: `brew install poppler` (macOS) or `apt-get install poppler-utils` (Linux).

Compute `sha256` of each normalized output. For `.md` files, additionally compute per-H2-section hashes (split on `^## `) for MD-only partial update.

### Phase S3: Diff 분류

Compare scanned state against manifest:

| Category | Condition |
|----------|-----------|
| 🆕 신규 (new) | File present in CWD, absent in manifest |
| ✏️ 변경 (modified) | Hash differs from manifest |
| 🗑️ 삭제 (deleted) | File in manifest, absent in CWD |
| ✅ 동일 (unchanged) | Hash matches — skip |

For ✏️ modified `.md` files, compute section-level diff to identify which H2 sections changed.

Additionally, scan `StudyVault/` for structural area changes:

| Signal | Classification |
|--------|----------------|
| `NN-<name>/` folder exists in vault but not in last manifest's folder list | 🆕 area added |
| Folder in manifest but missing from vault | 🗑️ area removed |
| Folder renamed (same number, different name) | ✏️ area renamed |
| Two folders collapsed into one (detected via note `source_pdf` overlap) | ✏️ area merged |

### Phase S4: 변경 계획 출력 & 승인 (MANDATORY)

Present a plan table to the user:

```markdown
| 파일 / 영역 | 유형 | 영향 노트 | 작업 |
|-------------|------|-----------|------|
| `docs/chapter3.pdf` | ✏️ 변경 | `02-cpu/pipeline.md` | 재생성 |
| `notes/new-topic.md` | 🆕 신규 | (신규 폴더 `04-new-topic/`) | 생성 |
| `old.pdf` | 🗑️ 삭제 | `03-old/*` → archive | archive 이동 |
| area `02-old` → `02-new` | ✏️ 리네이밍 | `concepts/old.md` → `concepts/new.md` | rename (승인 필요) |
```

Use **AskUserQuestion** with options:
- `Apply all` — proceed with full plan
- `Apply with exclusions` — ask user to specify which items to skip
- `Cancel` — abort (no changes)

### Phase S5: 신규 파일 처리

For each 🆕 new source:

1. Apply `tutor-setup`'s Phase D1 (Source Mapping) and D2 (Content Analysis) **to this source only**.
2. Determine target folder:
   - If content belongs to an existing `NN-<topic>/` (keyword or topic overlap ≥ 70%) → add notes there.
   - Else → create `NN-<new-topic>/` using the next available number.
3. Generate concept notes + practice file per `../tutor-setup/references/templates.md`.
4. New keywords: check against existing Keyword Index. Conflicts → ask user. Otherwise register under the correct hierarchy (see `../tutor-setup/SKILL.md` Phase D3).
5. Apply Interlinking (Phase D8): Related Notes, MOC link, Quick Reference entry, Exam Traps entry.
6. Frontmatter MUST include:
   ```yaml
   source_pdf: <source filename>
   part: <section number or descriptor>
   keywords: <3-5 english kebab-case>
   ```

### Phase S6: 변경 파일 처리

For each ✏️ modified source:

1. Load manifest's `notes` list for this source → list of affected notes.
2. For each affected note, read frontmatter first:
   - `manual_edits: true` → **SKIP**. Add to "skipped due to manual_edits" report.
   - Otherwise → continue.
3. **MD section-level optimization**: If source is `.md` and manifest has `sections` mapping, regenerate **only notes mapped to changed H2 sections**. Unchanged sections' notes remain untouched.
4. **PDF/other formats**: Regenerate all notes in `notes[]` for that source.
5. Regeneration uses templates from `../tutor-setup/references/templates.md`. Preserve existing frontmatter fields (`keywords`, `part`) unless source content clearly invalidates them.
6. Do NOT touch `*dashboard*`, `concepts/`, `archive/` in this phase.

### Phase S7: 삭제 파일 처리

For each 🗑️ deleted source:

1. Collect affected content notes from manifest.
2. **User approval required**: AskUserQuestion — "Move these notes to archive?" with options `Archive all`, `Keep but mark stale`, `Cancel this item`.
3. On approval:
   - Create `StudyVault/archive/<NN-topic>/` if needed.
   - `mv` affected notes into archive (preserve relative structure).
   - Remove links from `00-Dashboard/moc.md`, `quick-reference.md`, `exam-traps.md`.
4. If entire area is emptied → triggers Phase S9 "area removed" case.

### Phase S8: 콘텐츠 Dashboard 갱신

Update content-side dashboards only (not the learning-progress `*dashboard*` file — that's Phase S9):

- `00-Dashboard/moc.md`: Topic Map table add/remove rows for new/archived areas. Keyword Index: add new entries.
- `00-Dashboard/quick-reference.md`: Add sections for new notes with `→ [Concept Note](path.md)` links.
- `00-Dashboard/exam-traps.md`: Append new trap points for newly detected patterns. Remove entries linking to archived notes.

All links are relative-path markdown. No wiki-links.

### Phase S9: 학습 진행 데이터 동기화 (안전 모드)

Sync `*dashboard*` and `concepts/` per the case table below. Error notes are NEVER deleted.

| Change | Action on learning progress | Approval |
|--------|------------------------------|----------|
| 🆕 신규 area (`NN-<new>/`) | `*dashboard*` Proficiency 표에 새 행 추가 (`Concepts=<seed 개수>`, Covered/Accuracy/Mastery = 0, Level = ⬜). 동시에 `concepts/<new>.md`를 생성하여 `## Concepts (N total)` seed block을 populate (area 폴더의 concept note basenames에서 추출). Tracker 테이블은 비워둠. | Automatic |
| 🗑️ area 삭제 (폴더 archive됨) | `concepts/<area>.md` → `archive/concepts/<area>.md` 이동. `*dashboard*` 해당 행에 `(archived)` 추가 + Details 링크를 archive 경로로 수정. | **AskUserQuestion** |
| ✏️ area 리네이밍 (`<old>` → `<new>`) | `concepts/<old>.md` → `concepts/<new>.md` rename. 내부 H1 및 `*dashboard*`의 행 이름/링크 갱신. Tracker 행(Streak 포함)·Error notes·seed block 전부 원본 보존. | **AskUserQuestion** (diff 제시) |
| ✏️ area 병합 (A+B → C) | `concepts/a.md` + `concepts/b.md` → `concepts/c.md`. Attempts/Correct 합산. **Streak은 합산하지 않고 min(A, B)로 보수적 계산** (둘 중 약한 쪽에 맞춤). Seed block은 양쪽 병합 후 중복 제거. Error notes는 원본 area 이름을 `**source area**` 부제로 표시해 모두 보존. | **AskUserQuestion** (프리뷰 제시) |
| ✏️ source 내용 변경만 (구조 동일) | `concepts/{area}.md` 건드리지 않음. 단, concept가 source에서 완전히 제거되었으면 해당 행 Status 옆에 `⚠️ stale` 표시 (content-stale — `progress-rules.md §6`의 🟡 time-stale과는 별개 마커). | Automatic (표시만) |
| ✏️ 새 concept note 추가 (기존 area 내) | `concepts/{area}.md`의 seed block에 새 concept 추가. Tracker는 건드리지 않음. `*dashboard*`의 `Concepts` 값 +1, `Covered`·`Mastery` 재계산. | Automatic |
| ✏️ concept note 삭제 (기존 area 내) | `concepts/{area}.md`의 seed block에서 해당 항목 제거. Tracker에 이미 있는 행은 유지하되 Status 옆에 `⚠️ stale` 추가. `Concepts` −1. | Automatic (표시만) |
| `manual_edits: true` 콘텐츠 노트 | 이 Phase와 무관 (S6에서 skip 처리됨). | — |

**AskUserQuestion payload** for destructive cases:
- Header: `"Sync {area}"` (max 12 chars)
- Show before/after diff of the affected concept file path + dashboard row
- Options: `Apply`, `Skip this area`, `Cancel entire sync`

**Content-stale concept 감지**: 기존 `concepts/{area}.md`의 각 Concept가 변경 후 source에 여전히 등장하는지 확인. 미등장 concept 행에:
```markdown
| pipeline-hazard | 3 | 2 | 2 | 2026-03-14 | 🟢 ⚠️ stale |
```

> **Note**: 여기의 `⚠️ stale`은 **content-stale** (source에서 사라진 개념) 플래그이며, `progress-rules.md §6`의 🟡 **time-stale** (14일 미검증)과는 별개의 마커다. 둘은 공존 가능: `🟡 ⚠️ stale`.

**통계 재계산** (area 추가/이동/리네이밍 후 MANDATORY). 공식의 spec-of-record는 [../tutor/references/progress-rules.md §2, §3](../tutor/references/progress-rules.md):
- `Concepts` = seed block bullet count
- `Covered` = tracker row count / Concepts
- `Accuracy` = 🟢 count / tracker row count (denominator 0 이면 `-`)
- `Mastery` = 🟢 count / Concepts
- `Level` = progress-rules §3 임계값 (Coverage gate + Mastery tier)
- Stats 블록: Total Concepts, Covered, Mastered (🟢), Stale (🟡), Unresolved (🔴), Weakest/Strongest Area (Mastery 기준, ⬜ 제외)

**Archive 구조**:
```
StudyVault/
├── archive/
│   ├── <NN-old-topic>/         # 콘텐츠 노트
│   └── concepts/
│       └── <area>.md           # 학습 진행 (Error notes 전부 보존)
```

### Phase S10: Self-Review (MANDATORY)

Verify against [sync-checklist.md](references/sync-checklist.md). Error notes integrity check is the highest priority. Fix and re-verify until all checks pass.

### Phase S11: Manifest Save

1. Construct new manifest with:
   - `version: 1`
   - `last_build: <now ISO8601>`
   - `sources`: updated hash/mtime/notes/sections per [manifest-schema.md](references/manifest-schema.md)
   - Include deleted sources under `archived_sources` (optional, for history)
2. Atomic write: `StudyVault/.manifest.json.tmp` → `mv` to `StudyVault/.manifest.json`.
3. Report summary to user:
   ```
   ✅ Sync complete.
   - New: N files (M notes)
   - Modified: N files (M notes, K skipped for manual_edits)
   - Deleted: N files (M notes archived)
   - Area changes: X renamed, Y merged, Z archived (with approval)
   - Error notes: fully preserved (no deletions)
   ```

---

## Portability Rules (inherited from tutor-setup)

All generated/modified notes MUST use standard markdown only:

- **Links**: `[text](relative/path.md)` — never `[[wiki-links]]`
- **Foldable**: `<details><summary>label</summary>body</details>` — never `> [!type]-`
- **Callouts**: `> **Tip:**` / `> **Warning:**` / `> **Important:**` — never `> [!tip]`
- **Keywords**: YAML frontmatter `keywords:` — never inline `#kebab-tag` lines

---

## Language

- Match source material language (Korean source → Korean notes)
- **Keywords**: ALWAYS English (kebab-case)
- All `{LANG}`-dependent UI text (AskUserQuestion prompts, report messages) uses user's detected language
