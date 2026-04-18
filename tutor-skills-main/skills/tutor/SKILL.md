---
name: tutor
description: >
  Interactive quiz tutor for markdown StudyVault learning. Use when the user wants to:
  (1) Take a diagnostic assessment of their knowledge,
  (2) Study or review specific sections/topics,
  (3) Drill weak areas identified in previous sessions,
  (4) Check their learning progress or dashboard,
  or says things like "quiz me", "test me", "let's study", "/tutor", "학습", "퀴즈", "평가".
---

# Tutor Skill

Quiz-based tutor that tracks what the user knows and doesn't know at the **concept level**. The goal is helping users discover their blind spots through questions.

Operates on plain-markdown StudyVaults produced by `tutor-setup`. No Obsidian or other proprietary tools required — the vault is a regular folder of markdown files.

> **Spec of record**: All progress calculations (Coverage, Accuracy, Mastery, Level badge thresholds, Status transitions, stale detection) are defined in [progress-rules.md](references/progress-rules.md). This file references it by section (§N).

## File Structure

```
StudyVault/
├── *dashboard*              ← Compact overview: proficiency table + stats
└── concepts/
    ├── {area-name}.md       ← Per-area concept tracking (seed + attempts + status + error notes)
    └── ...
```

- **Dashboard**: Only aggregated numbers. Links to concept files. Stays small forever.
- **Concept files**: One per area. Contains a `## Concepts (N total)` seed block (authoritative total for Coverage) plus a tracker table with attempts, correct count, Streak, date, status, and error notes. Grows proportionally to unique concepts tested (bounded).

## Workflow

### Phase 0: Detect Language

Detect user's language from their message → `{LANG}`. All output and file content in `{LANG}`.

### Phase 1: Discover Vault

1. Glob `**/StudyVault/` in project
2. List section directories
3. Glob `**/StudyVault/*dashboard*` to find dashboard
4. If found, read it. Preserve existing file path regardless of language.
5. Read every `concepts/*.md` if any exist — parse both the `## Concepts (N total)` seed block and the tracker table.
6. If dashboard not found, create from template (see Dashboard Template below)

If no StudyVault exists, inform user and stop.

### Phase 1.5: Stale Sweep & Schema Backfill (MANDATORY, auto)

Runs on every `tutor` invocation with no user interaction. Implements [progress-rules.md §5 (Stale Detection)](references/progress-rules.md) and [§8 (Backfill)](references/progress-rules.md).

1. **Schema backfill** (one-time per vault): For each `concepts/*.md`, if the `Streak` column is missing OR `## Concepts (N total)` seed block is missing → apply [§8 Backfill Rules](references/progress-rules.md). Emit the one-time backfill notice.
2. **Stale detection**: For each row across all concept files, if `Status == 🟢 AND (today − Last Tested) > 14 days` → demote to 🟡 (Streak preserved). Use today's date from the conversation context.
3. **Persist**: Write any changed concept files. Do not touch Attempts / Correct / Error notes.
4. **Recompute dashboard**: Rebuild the Proficiency table and Stats per [§2](references/progress-rules.md) and [§3](references/progress-rules.md). Write dashboard.
5. **Notify user** if any row changed:
   ```
   ℹ️ {N}개 개념이 복습 대기(stale)로 전환되었습니다.
      - {area}: {count}개
      …
   ```
   Suppress the notice if nothing changed (keep output quiet on typical runs).

### Phase 2: Ask Session Type

**MANDATORY**: Use AskUserQuestion to let the user choose what to do. Analyze the post-sweep dashboard to build context-aware options, then present them.

Follow [progress-rules.md §7 (Session Option Construction)](references/progress-rules.md). Summary:

1. If **⬜ Undersampled** areas exist → include "Diagnostic" option naming those areas (coverage-building)
2. If **🟥 Weak** or **🟨 Fair** areas exist → include "Drill weak" option naming the weakest area by Mastery
3. If **🟡 stale** concepts ≥ 3 (across all areas) → include **"Drill stale"** option ("{N} concepts due for review")
4. Always include "Choose a section" so the user can pick any area manually
5. If all areas are 🟩/🟦 AND no stale concepts → include "Hard-mode review" option

Present these as an AskUserQuestion with header "Session" and concise descriptions showing which areas each option targets. The user MUST select before proceeding.

### Phase 3: Build Questions

1. Read markdown files in target section(s)
2. Pick drill targets based on session type:
   - **Drill weak**: Read `concepts/{area}.md` → find 🔴 unresolved concepts. Rephrase in new contexts.
   - **Drill stale**: Collect 🟡 stale concepts across all areas (not 🟡 tentative). Rephrase to test same knowledge from a different angle — stale concepts must not be repeat-questioned verbatim.
   - **Diagnostic**: Sample from undersampled areas' concepts (untested concepts from the seed block have priority).
   - **Choose a section / Hard-mode**: Sample broadly from the chosen area.
3. Craft exactly 4 questions following `references/quiz-rules.md`

**CRITICAL**: Read `references/quiz-rules.md` before crafting ANY question. Zero hints allowed.

### Phase 4: Present Quiz

Use AskUserQuestion:
- 4 questions, 4 options each, single-select
- Header: "Q1. Topic" (max 12 chars)
- Descriptions: neutral, no hints

### Phase 5: Grade & Explain

1. Show results table (question / correct answer / user answer / result)
2. Wrong answers: concise explanation
3. Map each question to its area

### Phase 6: Update Files

#### 1. Update concept file (`concepts/{area}.md`)

Apply the transitions from [progress-rules.md §4 (Status Transitions)](references/progress-rules.md) for each graded answer. Key rules:

- Always update `Last Tested` to today, `Attempts += 1`.
- `Correct += 1` only if correct.
- `Streak += 1` if correct, `Streak = 0` if wrong.
- New status per §4 transition table. In short:
  - New / 🔴 → correct → 🟡 (Streak = 1)
  - 🟡 → correct → 🟢 if Streak+1 ≥ 2, else 🟡
  - 🟢 → correct → 🟢 (Streak++)
  - Any → wrong → 🔴 (Streak = 0, error note updated)
- Error notes are **never deleted** — always preserved even after return to 🟢.

If a concept is new, add it to the tracker table. Do **not** modify the `## Concepts (N total)` seed block in Phase 6 — it is structural data owned by tutor-setup/tutor-sync/tutor-migrate. (If the concept is not in the seed block, that's OK — still add to tracker; Coverage formula handles it.)

Tracker row format:
```markdown
| Concept | Attempts | Correct | Streak | Last Tested | Status |
|---------|----------|---------|--------|-------------|--------|
| concept name | 2 | 1 | 0 | 2026-02-24 | 🔴 |
```

Error notes format (add on wrong answer; update existing entry if the concept was previously missed):
```markdown
### Error Notes

**concept name**
- Confusion: what the user mixed up
- Key point: the correct understanding
```

#### 2. Update dashboard

Recompute all columns per [progress-rules.md §2 (Dashboard Schema)](references/progress-rules.md) and [§3 (Level Thresholds)](references/progress-rules.md):

- `Concepts`: from seed block (or fallback)
- `Covered` = `|tracker rows| / Concepts`
- `Accuracy` = `|Status=🟢| / |tracker rows|`
- `Mastery` = `|Status=🟢| / Concepts`
- `Level` from §3 thresholds (Coverage gate first, then Mastery tier)

Stats: Total Concepts, Covered, Mastered (🟢), Stale (🟡), Unresolved (🔴), Weakest/Strongest Area (by Mastery, excluding ⬜).

Dashboard stays compact — no session logs, no per-question details.

## Dashboard Template

Create when no dashboard exists. Filename localized to `{LANG}`. Column schema follows [progress-rules.md §2](references/progress-rules.md):

```markdown
# Learning Dashboard

> Concept-based metacognition tracking. See linked files for details.

---

## Proficiency by Area

| Area | Concepts | Covered | Accuracy | Mastery | Level | Details |
|------|----------|---------|----------|---------|-------|---------|
(one row per section; Details column = relative link e.g. [details](concepts/area-name.md))
| **Total** | **0** | **0/0** | **-** | **0/0** | ⬜ Undersampled | |

> ⬜ Undersampled (cov<50%) · 🟥 Weak (mas<40%) · 🟨 Fair (40-69%) · 🟩 Good (70-89%) · 🟦 Mastered (90-100%)

---

## Stats

- **Total Concepts**: 0
- **Covered**: 0 / 0 (-)
- **Mastered (🟢)**: 0 / 0 (-)
- **Stale (🟡)**: 0
- **Unresolved (🔴)**: 0
- **Weakest Area**: -
- **Strongest Area**: -
```

## Concept File Template

Create per area when first question is asked. `## Concepts (N total)` seed block is normally created by `tutor-setup`/`tutor-migrate`. If tutor creates this file on the fly (no seed), leave the seed block with a `<!-- TODO: seed concept list -->` marker — Coverage falls back to file-count heuristic until filled.

```markdown
# {Area Name} — Concept Tracker

## Concepts (0 total)

<!-- TODO: seed concept list — run /tutor-sync or /tutor-migrate to populate -->

| Concept | Attempts | Correct | Streak | Last Tested | Status |
|---------|----------|---------|--------|-------------|--------|

### Error Notes

(added as concepts are missed)
```

## Important Reminders

- ALWAYS read [progress-rules.md](references/progress-rules.md) before Phase 1.5 / Phase 6 — it is the spec of record for all computations
- ALWAYS read `references/quiz-rules.md` before creating questions
- NEVER include hints in option labels or descriptions
- NEVER use "(Recommended)" on any option
- Randomize correct answer position
- After grading, ALWAYS update both concept file AND dashboard per §2/§3/§4
- Error notes are NEVER deleted — they are permanent learning history
- Communicate in user's language
- All cross-file links in concept/dashboard files use relative-path markdown links, never wiki-links
