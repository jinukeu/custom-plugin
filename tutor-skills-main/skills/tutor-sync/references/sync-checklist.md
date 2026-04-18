# Sync Self-Review Checklist (Phase S10)

Run every item after all sync phases complete. Fix and re-verify until all pass.

## 1. Error Notes Integrity (최우선)

- [ ] Every `concepts/*.md` (or its archive counterpart) retains ALL error note entries that existed before sync.
- [ ] For renamed areas: new `concepts/<new>.md` contains every error note from old `concepts/<old>.md`.
- [ ] For merged areas: combined `concepts/<c>.md` contains every error note from both source areas, each prefixed with a `**source area**` subheading for traceability.
- [ ] For archived areas: `archive/concepts/<area>.md` exists and contains the full original concept tracker + error notes.
- [ ] Diff check: `grep -c '^\*\*[^*]' concepts/*.md archive/concepts/*.md` after sync ≥ same count before sync (per area).

## 2. Approval Log

- [ ] Every destructive operation (rename, merge, archive, stale-marking) was preceded by an AskUserQuestion with explicit user approval.
- [ ] No `concepts/{area}.md` file was renamed/deleted without approval.
- [ ] No `*dashboard*` row was removed or marked archived without approval.

## 3. Manifest Integrity

- [ ] `StudyVault/.manifest.json` exists and is valid JSON.
- [ ] Every source listed in `manifest.sources` exists on disk OR is recorded in `archived_sources`.
- [ ] Every note path in `manifest.sources[*].notes` exists under `StudyVault/` (not in `archive/`).
- [ ] Atomic write completed (no `.manifest.json.tmp` left behind).
- [ ] `version: 1` present.
- [ ] `last_build` timestamp updated.

## 4. Interlinking Integrity

- [ ] New notes have `## Related Notes` section with valid relative-path links.
- [ ] `00-Dashboard/moc.md` Topic Map links to every active note. No links to archived notes.
- [ ] `00-Dashboard/quick-reference.md` has an entry for each new note's key headings, each with `→ [Concept Note](path.md)`.
- [ ] `00-Dashboard/exam-traps.md` has entries for new patterns, each linking back to concept notes. No entries linking to archived notes.
- [ ] No broken relative-path links in any modified/new note (including links from existing notes into archived ones — these should have been removed).

## 5. Frontmatter Consistency

- [ ] Every new concept/practice note has YAML frontmatter with `source_pdf`, `part`, `keywords` (all 3 MANDATORY).
- [ ] `source_pdf` values reflect actual source mapping (not guessed from filename).
- [ ] `keywords` values use English kebab-case only and come from the Keyword Index registry.
- [ ] Notes with `manual_edits: true` were skipped, and the user was notified with the full list.
- [ ] MD-sourced notes have `source_section: "## ..."` if generated via section-level mapping.

## 6. Portability

- [ ] No `[[wiki-links]]` anywhere in new/modified notes (`grep -r '\[\[' StudyVault/` returns nothing).
- [ ] No Obsidian callouts `> [!type]` (`grep -rE '> \[!' StudyVault/` returns nothing).
- [ ] No inline `#kebab-tag` on its own line (used as Obsidian tags) in modified notes.
- [ ] All cross-note links use relative paths, not absolute.

## 7. Archive Policy

- [ ] Deleted sources' content notes moved to `StudyVault/archive/<NN-topic>/`, preserving relative structure.
- [ ] Removed areas' `concepts/<area>.md` moved to `StudyVault/archive/concepts/`.
- [ ] `*dashboard*` rows for archived areas show `(archived)` suffix and point to archive paths.
- [ ] MOC / Quick Reference / Exam Traps no longer link to archived notes.
- [ ] No content was permanently deleted — only moved.

## 8. Dashboard Synchronization

- [ ] `*dashboard*` Proficiency table rows match the current set of active (non-archived) `NN-*/` folders.
- [ ] Column schema is `Area | Concepts | Covered | Accuracy | Mastery | Level | Details` (7 columns, per [progress-rules.md §2](../../tutor/references/progress-rules.md)).
- [ ] New areas appear with `⬜ Undersampled` level and `0/N / - / 0/N` stats (Covered / Accuracy / Mastery).
- [ ] Renamed areas show updated name and link while preserving their attempts/correct/Streak counts and seed block.
- [ ] **Content-stale** concept rows (source-removed concepts) show `⚠️ stale` flag without losing attempts/correct/Streak/error-note data. Note: this is a separate marker from `progress-rules §6` time-stale (🟡 Status).
- [ ] Stats block: Total Concepts / Covered / Mastered (🟢) / Stale (🟡) / Unresolved (🔴) / Weakest & Strongest Area are recomputed correctly from `concepts/*.md` per [progress-rules.md §2](../../tutor/references/progress-rules.md).

## 9. Content Quality (inherited from tutor-setup)

Apply the relevant subset of [../../tutor-setup/references/quality-checklist.md](../../tutor-setup/references/quality-checklist.md) to **new and regenerated** notes only:

- [ ] Concept notes: Overview Table, concise concept sections, Exam/Test Patterns table, Related Notes.
- [ ] Practice notes: 8+ questions, answers in `<details>`, patterns in `<details>`, question type diversity (≥60% recall, ≥20% application, ≥2 analysis).
- [ ] ASCII diagrams for process/flow/state topics.
- [ ] Simplification-with-exceptions rule observed.
- [ ] Equal Depth Rule: every topic gets a dedicated note (no briefly-mentioned topics left under-documented).

## 10. Reporting

- [ ] Final summary reported to user includes:
  - New/Modified/Deleted file counts
  - Notes generated / skipped (manual_edits)
  - Area changes (renamed/merged/archived) with approval state
  - Confirmation that Error notes were preserved
- [ ] Report is in the user's detected language ({LANG}).
