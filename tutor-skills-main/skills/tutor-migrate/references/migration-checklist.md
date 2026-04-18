# Migration Self-Review Checklist

Run after Phase M4 transformations. Every item must PASS before declaring the migration complete. If any check fails, fix and re-verify — do not skip.

---

## 1. Obsidian syntax fully removed

- [ ] `rg -n '\[\[' StudyVault/` → 0 matches (all wiki-links converted, or intentionally commented as `<!-- TODO: ... -->`).
- [ ] `rg -n '!\[\[' StudyVault/` → 0 matches (embeds handled).
- [ ] `rg -n '^>\s*\[!' StudyVault/` → 0 matches (all callouts converted).
- [ ] `rg -n '^#[a-z0-9-]+(\s+#[a-z0-9-]+)*\s*$' StudyVault/` → 0 matches (no tag-only lines remain).

Any remaining `[[...]]` must be a user-chosen "Comment out" TODO — verify by inspecting each match.

---

## 2. Link integrity

- [ ] Every new `[text](path.md)` link resolves to an existing file.
  - Spot check: for each `.md` file under `StudyVault/`, run a quick existence check on each link target.
  - Report any broken links; do not fail silently.
- [ ] Anchor links `[text](path.md#slug)` — slug exists as a heading in the target file (best-effort check; non-ASCII slugs may be approximate).

---

## 3. Learning-history preservation (HIGHEST PRIORITY)

Two categories: **preservation** (byte-identical to backup) and **derived** (consistent with §8 backfill formulas).

### 3a. Preservation (byte-identical to backup)

- [ ] **Row count** — each `concepts/*.md` has the same number of tracker data rows as the backup.
- [ ] **Attempts / Correct / Last Tested / Status cells** — byte-identical to backup. These columns are never modified during migration; only the `Streak` column is *inserted* between Correct and Last Tested.
- [ ] **Error-note headings present** — every `### 오답 메모` / `### Error Notes` / equivalent heading that existed before still exists.
- [ ] **Error-note bodies** — each bolded concept label (e.g. `**샤딩 Celebrity(Hot-key) 문제**`) still appears exactly once; its bullet items are unchanged except for wiki-link → link syntax conversion.

### 3b. Derived columns (§8 formulas)

- [ ] **Streak column populated** — for every tracker row: `Streak == Correct` when `Status` contains 🟢, `Streak == 0` otherwise. No empty or malformed Streak cells.
- [ ] **Concepts seed block present** — every `concepts/*.md` has `## Concepts (N total)` with at least one bullet (or the explicit `TODO: area folder not found` marker).
- [ ] **Dashboard 7-column schema** — header is exactly `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` (labels localized; structure identical).
- [ ] **Dashboard cross-check** — for every area row:
  - `Concepts` value matches bullet count in the corresponding seed block.
  - `Covered` numerator matches tracker row count.
  - `Accuracy` / `Mastery` numerators match count of 🟢 rows.
  - `Level` matches [progress-rules.md §3](../../tutor/references/progress-rules.md) thresholds applied to the computed Coverage/Mastery.

If any check fails:
1. STOP.
2. Report the diverging file + row (preservation) OR failing formula (derived).
3. Offer rollback from the backup.

---

## 4. Frontmatter keywords merge

- [ ] Every file that previously had inline tag lines now has its `keywords:` frontmatter field populated with the union.
- [ ] `keywords:` values are kebab-case.
- [ ] No duplicate keywords (case-insensitive dedupe).
- [ ] Files without frontmatter had one created *only if* they had tag lines or the template calls for it — do not add empty frontmatter to files that don't need it.

---

## 5. Callout conversion

- [ ] No `> [!type]` / `> [!type]-` / `> [!type]+` markers remain.
- [ ] Every foldable callout is now a `<details><summary>...</summary>...</details>` block with blank lines around the body.
- [ ] Every plain callout's first line is now `> **Type:** ...` and body lines are unchanged.
- [ ] Unknown callout types were Title-cased (not dropped).

---

## 6. Backup exists and is complete

- [ ] `StudyVault/.obsidian-backup/<timestamp>/` exists.
- [ ] Backup file count matches pre-migration `find StudyVault/ -type f -name '*.md'` count minus any files the backup intentionally excludes.
- [ ] At least one sample backup file is byte-identical to the corresponding pre-migration content.

Skip this section only if the user explicitly chose "Apply all (no backup)".

---

## 7. Report output

The summary report to the user includes:

- [ ] Total wiki-links converted
- [ ] Unresolved wiki-links and how they were handled
- [ ] Callouts converted (foldable + plain)
- [ ] Tag lines merged into keywords
- [ ] Embeds flagged for manual review (if any)
- [ ] Learning-history integrity result (PASS/FAIL with file list)
- [ ] Backup location
- [ ] Any files skipped due to `manual_edits: true`

---

## 8. Smoke test

- [ ] Pick one concept note, one practice file, one dashboard file, one `concepts/*.md` file at random and read them top-to-bottom. No leftover `[[`, `[!`, `#tag`, or `![[` tokens.
- [ ] All tables render valid markdown (pipe alignment intact, no stray `>` from callout conversion).
