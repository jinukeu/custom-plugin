# Migration Self-Review Checklist

Run after Phase M4. Every item must PASS before declaring migration complete. Fix and re-verify on failure.

## 1. Obsidian syntax fully removed

- [ ] `rg -n '\[\[' StudyVault/` → 0 matches (or only user-chosen `<!-- TODO ... -->` comments).
- [ ] `rg -n '!\[\[' StudyVault/` → 0 matches (embeds handled).
- [ ] `rg -n '^>\s*\[!' StudyVault/` → 0 matches (callouts converted).
- [ ] `rg -n '^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$' StudyVault/` → 0 matches (no tag-only lines).

## 2. Link integrity

- [ ] Every new `[text](path.md)` link resolves to an existing file. Spot-check; report any broken links.
- [ ] `[text](path.md#slug)` — slug exists as a heading in target (best-effort; non-ASCII slugs may be approximate).

## 3. Learning-history preservation (HIGHEST PRIORITY)

### 3a. Preservation (byte-identical to backup)

- [ ] **Row count** per `concepts/*.md` matches backup.
- [ ] **Attempts / Correct / Last Tested / Status** byte-identical (only `Streak` is *inserted* between Correct and Last Tested).
- [ ] **Error-note headings** preserved (every `### 오답 메모` / `### Error Notes` retained).
- [ ] **Error-note bodies** — every bolded concept label appears exactly once; bullet items unchanged except wiki-link → link conversion.

### 3b. Derived (§8 backfill formulas)

- [ ] **Streak populated**: `Streak == Correct` when `Status == 🟢`, else `0`. No malformed cells.
- [ ] **Seed block present**: every `concepts/*.md` has `## Concepts (N total)` with N ≥ 1 (or explicit TODO marker).
- [ ] **Dashboard schema**: `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` (labels localized, structure identical).
- [ ] **Dashboard cross-check** per area row: `Concepts` = seed bullets; `Covered` numerator = tracker rows; `Accuracy`/`Mastery` numerators = 🟢 count; `Level` matches [progress-rules §3](../../tutor/references/progress-rules.md).

On failure: STOP. Report diverging file/row (preservation) or failing formula (derived). Offer rollback from backup.

## 4. Frontmatter keywords merge

- [ ] Every file with prior tag lines has `keywords:` populated with the union.
- [ ] `keywords:` are kebab-case, no duplicates (case-insensitive).
- [ ] Frontmatter created ONLY for files that needed it (no empty frontmatter).

## 5. Callout conversion

- [ ] No `> [!type]` / `> [!type]-` / `> [!type]+` markers remain.
- [ ] Foldable callouts: `<details><summary>...</summary>...</details>` with blank lines around body.
- [ ] Plain callouts: `> **Type:** ...` first line, body lines unchanged.
- [ ] Unknown types were Title-cased (not dropped).

## 6. Backup exists and is complete

- [ ] `StudyVault/.obsidian-backup/<timestamp>/` exists.
- [ ] Backup file count matches pre-migration `.md` count (minus intentional exclusions).
- [ ] At least one sample backup file byte-identical to pre-migration content.

Skip this section ONLY if user explicitly chose "Apply all (no backup)".

## 7. Report output

The summary includes: wiki-links converted (+ unresolved handling), callouts (foldable + plain), tag lines merged, embeds flagged, learning-history integrity result (PASS/FAIL + file list), backup location, files skipped due to `manual_edits: true`.

## 8. Smoke test

- [ ] Read top-to-bottom: one concept note, one practice file, one dashboard, one `concepts/*.md`. No leftover `[[`, `[!`, `#tag`, `![[` tokens.
- [ ] All tables render valid markdown (pipe alignment intact, no stray `>` from callout conversion).
