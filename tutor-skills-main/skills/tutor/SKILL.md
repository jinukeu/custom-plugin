---
name: tutor
description: >
  Interactive quiz tutor for markdown StudyVault learning. Use when the user wants to take a diagnostic
  assessment, study/review specific sections, drill weak areas, or check their progress dashboard. Triggers:
  "quiz me", "test me", "let's study", "/tutor", "학습", "퀴즈", "평가".
---

# Tutor Skill

Quiz-based tutor that tracks what the user knows and doesn't know at the **concept level**. Operates on plain-markdown StudyVaults from `tutor-setup`. No Obsidian or proprietary tools required.

> **Spec of record**: All progress calculations (Coverage, Accuracy, Mastery, Level, Status transitions, stale detection) are defined in [progress-rules.md](references/progress-rules.md). Sections referenced as §N below.

## File Structure

```
StudyVault/
├── *dashboard*              ← Compact overview: proficiency table + stats
└── concepts/
    ├── {area-name}.md       ← Per-area: seed block + tracker table + error notes
    └── ...
```

- **Dashboard**: aggregated numbers only. Stays small forever.
- **Concept files**: one per area. `## Concepts (N total)` seed block (authoritative for Coverage) + tracker table + error notes. Bounded growth.

## Workflow

### Phase 0: Detect Language

Detect user's language from their message → `{LANG}`. All output and file content in `{LANG}`.

### Phase 1: Discover Vault (lightweight)

Path discovery only — **do not read `concepts/*.md` here**. Defer reads to Phase 2.5 / Phase 6.

1. Glob `**/StudyVault/`. If none, inform user and stop.
2. List section directories under `concepts/` (names only).
3. Glob `**/StudyVault/*dashboard*` for path. Preserve existing path regardless of language.
4. Do **not** read dashboard or concept files yet.

### Phase 2: Ask Session Type (fixed options)

**MANDATORY**: Use AskUserQuestion with the **fixed option set below** — do not pre-read concepts/dashboard to build context-aware labels. User picks intent first; Phase 2.5 loads only what that intent needs.

Always present (header "Session"):

1. **Diagnostic** — Sample broadly to find undersampled concepts
2. **Drill weak** — Focus on 🔴 unresolved / low-mastery in a chosen area
3. **Drill stale** — Review 🟡 concepts due for refresh (triggers full stale scan in Phase 2.5)
4. **Choose a section** — User picks an area manually
5. **Hard-mode review** — Harder rephrasings of already-mastered concepts

For options 2 / 4 / 5, follow up asking which area (from Phase 1's directory list).

### Phase 2.5: Load Selected Scope & Lazy Sweep

Now — and only now — read files. Scope depends on Phase 2 selection:

- **Drill weak / Choose a section / Hard-mode / Diagnostic** → read `concepts/{selected-area}.md` + dashboard.
- **Drill stale** → read `concepts/*.md` (all) + dashboard. Only intent that requires full scan; user opted in.

Then on the loaded scope:

1. **Schema backfill** (one-time per file): If `Streak` column or `## Concepts (N total)` seed missing → apply [§8](references/progress-rules.md). Files outside loaded scope are backfilled lazily on next selection or in bulk in Phase 6.
2. **Stale detection**: If `Status == 🟢 AND (today − Last Tested) > 14 days` → demote to 🟡 (Streak preserved).
3. **Persist**: Write changed concept file(s). Do not touch Attempts / Correct / Error notes.
4. **Create dashboard** from [templates.md](references/templates.md) if missing.
5. **Notify user** only if scope changed:
   ```
   ℹ️ {N}개 개념이 복습 대기(stale)로 전환되었습니다.
      - {area}: {count}개
   ```
   Dashboard recompute deferred to Phase 6 (full-scan accuracy).

### Phase 3: Build Questions

1. Read markdown files in target section(s).
2. Pick drill targets per session type:
   - **Drill weak**: 🔴 unresolved → rephrase in new contexts.
   - **Drill stale**: 🟡 stale across all areas → rephrase to test same knowledge from a different angle (no verbatim repeats).
   - **Diagnostic**: undersampled areas; untested seed concepts have priority.
   - **Choose a section / Hard-mode**: sample broadly from chosen area.
3. Craft exactly 4 questions following [quiz-rules.md](references/quiz-rules.md).

**CRITICAL**: Read `references/quiz-rules.md` before crafting ANY question. Zero hints allowed.

### Phase 4: Present Quiz

Use AskUserQuestion: 4 questions, 4 options each, single-select. Header `Q1. Topic` (max 12 chars). Descriptions: neutral, no hints.

### Phase 5: Grade & Explain

1. Show results table (question / correct / user / result).
2. Wrong answers: concise explanation.
3. Map each question to its area.

### Phase 6: Update Files

#### 1. Update concept file (`concepts/{area}.md`)

Apply transitions from [§4 Status Transitions](references/progress-rules.md). Key rules:

- Always: `Last Tested = today`, `Attempts += 1`.
- `Correct += 1` only if correct.
- `Streak += 1` if correct, `Streak = 0` if wrong.
- New status per §4 transition table. Summary:
  - New / 🔴 → correct → 🟡 (Streak = 1)
  - 🟡 → correct → 🟢 if Streak+1 ≥ 2, else 🟡
  - 🟢 → correct → 🟢 (Streak++)
  - Any → wrong → 🔴 (Streak = 0, error note updated)
- Error notes are **never deleted** — preserved even after return to 🟢.

**Seed-authoritative labeling (MANDATORY)**: Every tracker row label MUST exactly match a `## Concepts (N total)` seed entry. For each graded answer:

1. Identify which concept the question tested.
2. Match to seed by exact string equality (case-insensitive whitespace-normalized fallback OK; tracker MUST use seed's canonical spelling).
3. If no seed match: find the **closest semantically related seed entry** and attribute the attempt there. If nothing reasonably matches, append the candidate to `### Pending Concepts` (one bullet + one-line rationale) and **skip the tracker update for this answer**. Never invent new tracker rows.
4. Never modify the seed block in Phase 6 — seed changes are owned by `tutor-setup` / `tutor-sync` / `tutor-migrate`. `Pending Concepts` is the handoff: next `/tutor-sync` promotes reviewed candidates.

This prevents label drift (same concept under multiple slightly-different labels), which inflates `|tracker rows|`, deflates Mastery (via `max()` denominator), and lets one mistake split into multiple 🔴 rows blocking 🟩/🟦.

**Invariant**: After Phase 6, `|tracker rows| ≤ |seed entries|` always holds. On pre-existing violation (legacy drift), emit a one-time warning suggesting `/tutor-sync` — do not auto-merge.

Tracker row + Error note formats: see [templates.md](references/templates.md).

#### 2. Update dashboard

**Read all `concepts/*.md` here** (first full read of session). Apply pending schema backfill to files not loaded earlier.

Recompute all columns per [§2 Dashboard Schema](references/progress-rules.md) and [§3 Level Thresholds](references/progress-rules.md):

- `Concepts`: from seed block (or fallback)
- `Covered` = `|tracker rows| / Concepts`
- `Accuracy` = `|🟢| / |tracker rows|`
- `Mastery` = `|🟢| / Concepts`
- `Level` from §3 (Coverage gate first, then Mastery tier)

Stats: Total Concepts, Covered, Mastered (🟢), Stale (🟡), Unresolved (🔴), Weakest/Strongest Area (by Mastery, ⬜ excluded).

Dashboard stays compact — no session logs, no per-question details.

## Templates

Dashboard / Concept file / Tracker row / Error note formats: see [references/templates.md](references/templates.md). Read only when creating a file from scratch.

## Important Reminders

- ALWAYS read [progress-rules.md](references/progress-rules.md) before Phase 2.5 / Phase 6 (spec of record).
- ALWAYS read [quiz-rules.md](references/quiz-rules.md) before creating questions. Zero hints.
- Error notes are NEVER deleted — permanent learning history.
- All cross-file links use relative-path markdown, never wiki-links.
