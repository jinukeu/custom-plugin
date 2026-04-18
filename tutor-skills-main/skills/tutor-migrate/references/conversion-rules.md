# Conversion Rules — Obsidian → Portable Markdown

Exact regex patterns and transformation recipes. Every rule here is side-effect aware: callers must not touch content inside `concepts/*.md` error-note bodies beyond syntax conversion.

---

## 1. Wiki-Links

### 1a. Parsing

A wiki-link has the form `[[target]]` where `target` can contain:

- **Path prefix** (optional): `path/to/file`
- **Anchor** (optional): `#heading` — refers to a `## heading` inside the target
- **Block ref** (optional): `^block-id` — rare, flag for manual follow-up
- **Alias** (optional): `|display text`

Examples and parsed form:

| Raw | path | anchor | block | alias |
|-----|------|--------|-------|-------|
| `[[Foo]]` | Foo | — | — | — |
| `[[Foo\|Bar]]` | Foo | — | — | Bar |
| `[[concepts/Foo]]` | concepts/Foo | — | — | — |
| `[[Foo#Section]]` | Foo | Section | — | — |
| `[[Foo#Section\|Bar]]` | Foo | Section | — | Bar |
| `[[Foo^abc123]]` | Foo | — | abc123 | — |

### 1b. Resolution

Index built in Phase M2: `basename_index: {basename → [full_path, ...]}` and `path_index: {rel_path_no_ext → full_path}`.

For a parsed `path`:

1. If `path` contains `/` → look up in `path_index[path]`. If found → resolved.
2. Else → look up `basename_index[path]`.
   - Exactly one hit → resolved.
   - Zero hits → **unresolved** (ask user in Phase M2).
   - Multiple hits → **unresolved** (ambiguous — ask user to pick in Phase M2, one-time, and cache the choice for the rest of this migration run).

### 1c. Rewriting

Once resolved to `target_abs_path` (relative to vault root) and current note path `current_dir`:

```
relpath = relative(target_abs_path, current_dir)
```

| Input | Output |
|-------|--------|
| `[[Foo]]` | `[Foo](relpath/Foo.md)` |
| `[[Foo\|Bar]]` | `[Bar](relpath/Foo.md)` |
| `[[path/Foo]]` | `[Foo](relpath/Foo.md)` (use basename `Foo` as display text) |
| `[[Foo#Section]]` | `[Foo § Section](relpath/Foo.md#section-slug)` |
| `[[Foo#Section\|Bar]]` | `[Bar](relpath/Foo.md#section-slug)` |
| `[[Foo^id]]` | `[Foo](relpath/Foo.md) <!-- TODO: block ref ^id (manual follow-up) -->` |

**Anchor slug rule**: Obsidian section `## 핵심 패턴!` → slug `핵심-패턴` (lowercase if ASCII, strip punctuation, spaces→hyphens). For non-ASCII characters, preserve the character and lowercase ASCII neighbours only. This matches the de-facto GitHub slug behaviour most renderers accept.

### 1d. Unresolved handling

Per Phase M2 user choice:

- `Keep as plain text`: `[[Foo]]` → `Foo`, `[[Foo|Bar]]` → `Bar`.
- `Comment out`: `[[Foo]]` → `<!-- TODO: broken wiki-link to Foo -->`.

---

## 2. Callouts

Obsidian callout syntax:

```
> [!type] Optional Title
> body line 1
> body line 2
```

With a trailing `-` on the type (`[!type]-`), Obsidian renders it foldable and initially collapsed. With `+`, foldable and initially expanded. In both cases, output should be `<details>`.

### 2a. Foldable (`-` or `+`) → `<details>`

```
> [!tip]- 한 줄 요약
> 내용 첫째 줄
> 내용 둘째 줄
```

→

```
<details><summary>Tip — 한 줄 요약</summary>

내용 첫째 줄
내용 둘째 줄

</details>
```

Rules:
- Preserve title; if absent, use just the type label (`<summary>Tip</summary>`).
- Strip the leading `> ` from each body line.
- Insert blank line before and after the body inside `<details>` to keep markdown rendering intact.

### 2b. Non-foldable → bold-label blockquote

```
> [!warning] 주의
> 분리만으로는 SPOF 해결 안 됨.
```

→

```
> **Warning:** 주의
> 분리만으로는 SPOF 해결 안 됨.
```

Rules:
- Replace only the `[!type]` marker on the first line. Leave the rest of the blockquote body untouched.
- Type-to-label mapping:

| Obsidian type | Output label |
|---------------|--------------|
| `tip` | `Tip` |
| `hint` | `Tip` |
| `warning` | `Warning` |
| `caution` | `Warning` |
| `danger` | `Warning` |
| `important` | `Important` |
| `note` | `Note` |
| `info` | `Note` |
| `summary` | `Summary` |
| `abstract` | `Summary` |
| `tldr` | `Summary` |
| `example` | `Example` |
| `question` | `Question` |
| `faq` | `Question` |
| `help` | `Question` |
| *(unknown)* | Title-case the raw type as-is |

### 2c. Detection regex

- **Start of foldable**: `^>\s*\[!([a-zA-Z]+)\][+-](\s+(.*))?$`
- **Start of plain**: `^>\s*\[!([a-zA-Z]+)\](?![+-])(\s+(.*))?$`
- **Continuation**: lines matching `^>\s?(.*)$` directly following the start line, stopping at the first line that does not start with `>`.

---

## 3. Inline Tags

Obsidian treats any line like `#kebab-tag #another-tag` as tag declarations. These must move into YAML frontmatter `keywords:`.

### 3a. Detection

A **tag-only line** is a line matching `^#[a-z][a-z0-9-]*(\s+#[a-z][a-z0-9-]*)*\s*$`.

**Critical**: Distinguish from headings. Markdown headings are `# Heading` (whitespace after `#`). Tags are `#foo` (no whitespace between `#` and word character). The regex above encodes this — whitespace after `#` disqualifies the token.

Ignore tag-only lines that are:
- Inside fenced code blocks (``` ... ```)
- Inside inline code (`` `...` ``)
- Inside HTML comments (`<!-- ... -->`)

### 3b. Merging

1. Collect all tag slugs from all tag-only lines in the file (union, dedupe, preserve order of first appearance).
2. Read existing frontmatter `keywords:`. Support both CSV and YAML-list forms:
   ```yaml
   keywords: single server, web tier
   ```
   ```yaml
   keywords:
     - single-server
     - web-tier
   ```
3. Merge: existing ∪ collected, dedupe case-insensitively. Normalize output to CSV form:
   ```yaml
   keywords: single-server, web-tier, concept, system-design, scalability
   ```
4. Convert any slug that used `camelCase` or `snake_case` to kebab-case (`systemDesign` → `system-design`, `system_design` → `system-design`).
5. Delete the original tag-only lines.
6. If the file has no frontmatter, create one at the top:
   ```yaml
   ---
   keywords: <merged list>
   ---
   ```

### 3c. Exception: error-note tables

`concepts/*.md` files may contain `#` characters in table cells (rare, e.g. `"issue #123"`). These are not tag-only lines because they contain non-tag characters — the regex already excludes them. Still, double-check before deleting: only delete a line if it matches the detection regex exactly.

---

## 4. Embeds (`![[...]]`)

### 4a. Images

Extensions `.png .jpg .jpeg .gif .svg .webp .bmp`:

```
![[diagram.png]]
```

→

```
![diagram.png](path/to/diagram.png)
```

Resolve path via the same basename index (images typically live in an `assets/` or `attachments/` folder). If unresolved, keep the filename as the src and add a TODO comment on the next line.

### 4b. Markdown embeds

```
![[OtherNote]]
```

→

```
<!-- TODO: markdown embed converted to link -->
[OtherNote](path/to/OtherNote.md)
```

### 4c. PDF/other

Flag for manual review:

```
<!-- TODO: embed `![[filename.pdf]]` needs manual handling -->
```

---

## 5. Block References (`[[File^id]]`)

Already covered in §1c — dropped to normal link with a TODO comment. Rare in practice; do not invest in rendering the block content.

---

## 6. Files to process vs preserve

**Process fully (syntax conversion)**:
- `00-Dashboard/*.md` — convert wiki-links (dashboard rows), callouts, tags.
- `NN-*/*.md` — concept notes and practice files — convert everything.

**Process with care (syntax only, never touch content/numbers/dates)**:
- `concepts/*.md` — convert wiki-links in linked references, convert callouts if any exist in the note body, merge any tag-only lines. **Do NOT modify** table rows, numeric values, dates, or the textual body of error-note entries beyond replacing Obsidian syntax that appears within them.
- `*dashboard*` — convert wiki-links in the `상세` / `Details` column. Do NOT modify numeric columns, badge emoji, or stats.

**Skip entirely**:
- Any file with frontmatter `manual_edits: true` — ask user before processing.
- `archive/**` — optional; ask user whether to include (default: include, same rules as above).
- `.obsidian/` — Obsidian config folder, leave alone.
- `.obsidian-backup/` — our own backup.
- `.manifest.json`, `.migration-report.md` — internal state.

---

## 7. Edit ordering (to avoid overlap bugs)

When editing a single file, apply transformations in this order:

1. **Frontmatter keywords merge** (reads existing frontmatter, determines merged list)
2. **Inline tag line deletion** (remove after merging — step 1 depends on their content)
3. **Foldable callouts** → `<details>` (multi-line replacement, must precede plain callouts)
4. **Plain callouts** → `> **Type:**` (single-line first-line replacement)
5. **Image embeds** → standard image syntax
6. **Markdown embeds** → link + TODO
7. **Block-ref wiki-links** → link + TODO
8. **Anchor wiki-links** (`[[X#Y]]`) — separate pass because of slug computation
9. **Aliased wiki-links** (`[[X|Y]]`)
10. **Plain wiki-links** (`[[X]]`)

Steps 8–10 MUST happen in that order (most specific match first) to avoid mis-parsing.

Finally, after all syntax steps on a file:

11. **Schema backfill** (only for `concepts/*.md` and `*dashboard*`) per §8 below.

---

## 8. Schema Backfill

Applied during Phase M4 (steps 4f and 4g in SKILL.md). Reference: [../../tutor/references/progress-rules.md §8](../../tutor/references/progress-rules.md).

### 8a. `concepts/{area}.md` — add Streak column + Concepts seed block

Detect by inspecting the tracker table header. Old vault (Obsidian-era) header:

```
| Concept | Attempts | Correct | Last Tested | Status |
```

New schema header (target):

```
| Concept | Attempts | Correct | Streak | Last Tested | Status |
```

Transformation:

1. Parse the header, alignment, and data rows.
2. For each data row, compute `Streak` cell:
   - If `Status` cell contains `🟢` → `Streak = Correct` (cast to int).
   - Else → `Streak = 0`.
   - Edge case: if the `Status` cell contains `🟢 ⚠️ stale` (tutor-sync content-stale marker) → still counts as 🟢 for backfill purposes.
3. Write the new header, alignment, and rows with the Streak column inserted between Correct and Last Tested.
4. Preserve all other cell values byte-identical. Do not touch Attempts / Correct / Last Tested / Status.

### 8b. `concepts/{area}.md` — generate Concepts seed block

If a `## Concepts (` heading already exists in the file, skip (preserve user data). Otherwise insert, after the top-level H1 (`# {Area Name} — Concept Tracker`):

```markdown
## Concepts (N total)

<!-- backfilled from file list; review for accuracy -->
- <basename 1>
- <basename 2>
- ...
```

Source for the seed list:

1. Derive area folder name from the concept file name: `concepts/확장성 기초.md` → area folder matching `**/StudyVault/*확장성 기초*/`.
2. If the area folder is found, list its direct-child `.md` files. Exclude names matching any of:
   - `Practice`, `practice`, `문제풀이`, `빈출 문제`, `연습`
   - Files beginning with `_` (hidden/meta)
3. Strip leading `NN-` numeric prefix from basenames (e.g. `01-단일 서버와 웹-DB 분리.md` → `단일 서버와 웹-DB 분리`).
4. Deduplicate, sort by original file order (preserve pedagogical sequence).
5. If the area folder cannot be located (common after rename/archive), emit a warning in the Phase M7 report and seed with `<!-- TODO: area folder not found; seed manually -->`. N = 0 is acceptable only in this case.

### 8c. `*dashboard*` — column rewrite

Identify the proficiency table. Obsidian-origin headers vary:

- Korean (dss-1week style): `| 영역 | 정답 | 오답 | 정답률 | 수준 | 상세 |`
- English: `| Area | Correct | Wrong | Rate | Level | Details |`
- Any 6-column variant beginning with area name column

Detection: the first markdown table in the dashboard file whose header row has a cell matching `영역|Area|area` in the first column. (Use the first table heuristic conservatively; if no match in the first two tables, ask the user.)

Transformation:

1. Parse the old table (header + alignment + data rows).
2. For each data row, derive the area name from column 1 and load the corresponding migrated `concepts/{area}.md`.
3. Compute new-column values from the concept file:
   - `Concepts` = bullet count in `## Concepts (N total)` seed.
   - `Covered` = `{tracker_rows}/{Concepts}` formatted as `x/N (p%)`.
   - `Accuracy` = `{🟢_rows}/{tracker_rows}` or `-` if denominator 0.
   - `Mastery` = `{🟢_rows}/{Concepts}` as `x/N (p%)`.
   - `Level` per progress-rules §3 thresholds.
   - `Details` = relative link to the concept file (post-wiki-link-conversion style).
4. Write the new 7-column header + alignment + rows.
5. Replace the Totals row with the new aggregate Totals per progress-rules §2.

Also replace the Stats block if present. Old fields (`총 문제 수`, `누적 정답률`, etc.) are swapped for the new set (`Total Concepts`, `Covered`, `Mastered (🟢)`, `Stale (🟡)`, `Unresolved (🔴)`, `Weakest Area`, `Strongest Area`). Keep text labels in the user's existing language (Korean labels stay Korean, English stay English).

### 8d. Tracker-row write-through

The backfilled `Streak` column persists immediately on disk so Phase M5 can verify both preservation (Attempts/Correct/Status unchanged) and derivation (Streak = formula) against the backup. Do not defer writes until M7.
