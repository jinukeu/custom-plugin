# Progress Rules — Coverage, Mastery, Streak, Stale

This is the **spec of record** for how learning progress is computed and stored. `tutor`, `tutor-setup`, `tutor-sync`, and `tutor-migrate` all reference this file. When the rules change, update this file first.

---

## 1. Concept File Schema

`StudyVault/concepts/{area}.md`:

```markdown
# {Area Name} — Concept Tracker

## Concepts (N total)

- concept name 1
- concept name 2
- ...

| Concept | Attempts | Correct | Streak | Last Tested | Status |
|---------|----------|---------|--------|-------------|--------|
| concept name | 2 | 2 | 2 | 2026-04-15 | 🟢 |

### Error Notes

**concept name**
- Confusion: …
- Key point: …
```

### Field meanings

| Field | Type | Meaning |
|-------|------|---------|
| Concept | string | Unique concept label within the area |
| Attempts | int ≥ 0 | Total times this concept was tested |
| Correct | int ≥ 0 | Total times answered correctly (lifetime) |
| **Streak** | int ≥ 0 | **Consecutive** correct answers since last miss. Resets to 0 on wrong answer |
| Last Tested | `YYYY-MM-DD` | Date of the most recent attempt |
| Status | enum | 🔴 / 🟡 / 🟢 (see §4) |

**Concepts seed block** (`## Concepts (N total)`):
- Lists **all** concepts the area is expected to cover. Tested OR not.
- `tutor-setup` (Phase D6) and `tutor-migrate` (Phase M4 backfill) create this.
- `tutor-sync` keeps it in sync when area structure changes.
- `tutor` treats it as the authoritative total for Coverage calculation.

### Fallback for total concept count

If the `## Concepts (N total)` seed block is missing (older vault not yet migrated), fall back to: `area 폴더 NN-<area>/*.md 파일 수 중 Practice/practice/문제풀이/빈출 문제 제외`. Emit a one-time warning suggesting the user run `/tutor-migrate` or let tutor auto-backfill.

---

## 2. Dashboard Schema

`StudyVault/*dashboard*`:

```markdown
# Learning Dashboard

## Proficiency by Area

| Area | Concepts | Covered | Accuracy | Mastery | Level | Details |
|------|----------|---------|----------|---------|-------|---------|
| 확장성 기초 | 10 | 10/10 (100%) | 10/10 (100%) | 10/10 (100%) | 🟦 Mastered | [details](concepts/확장성 기초.md) |
| DNS         | 4  | 1/4 (25%)    | 0/1 (0%)     | 0/4 (0%)     | ⬜ Undersampled | [details](concepts/DNS.md) |
| **Total**   | **N** | **x/N**     | **a/b**      | **c/N**      | (overall level) | |

> ⬜ Undersampled · 🟥 Weak · 🟨 Fair · 🟩 Good · 🟦 Mastered

---

## Stats

- **Total Concepts**: N (across all areas)
- **Covered**: x / N (%)
- **Mastered (🟢)**: c / N (%)
- **Stale (🟡)**: k
- **Unresolved (🔴)**: u
- **Weakest Area**: <area with lowest Mastery among non-Undersampled>
- **Strongest Area**: <area with highest Mastery>
```

### Column meanings

| Column | Formula |
|--------|---------|
| Concepts | Total count from `## Concepts (N total)` seed (or fallback) |
| Covered | `len(rows in tracker table) / Concepts` — how many have been tested ≥ once |
| Accuracy | `count(Status=🟢 in tracker) / len(rows in tracker)` — among tested, how many are confirmed |
| Mastery | `count(Status=🟢 in tracker) / Concepts` — the primary skill indicator |
| Level | Derived from Coverage + Mastery per §3 |

Use "x/N (p%)" format for human readability. Display "-" for undefined ratios (e.g. `0/0`).

---

## 3. Level Badge Thresholds

Let `cov = Covered%`, `mas = Mastery%`.

```
⬜ Undersampled  — cov < 50%                       (judgment deferred)
🟥 Weak          — cov ≥ 50%  AND mas < 40%
🟨 Fair          — cov ≥ 50%  AND 40% ≤ mas < 70%
🟩 Good          — cov ≥ 70%  AND 70% ≤ mas < 90%
🟦 Mastered      — cov ≥ 90%  AND mas ≥ 90%
```

Edge cases:
- `Concepts = 0` → Level = ⬜ (no data to judge)
- If `cov ≥ 50%` but the row does not satisfy any of 🟥/🟨/🟩/🟦, use the highest tier it satisfies. For example `cov=60%, mas=72%` → not 🟩 (coverage too low) → fall back to 🟨.

---

## 4. Status Transitions (Phase 6 logic)

Status values:

| Emoji | Name | Meaning |
|-------|------|---------|
| 🔴 | unresolved | Currently missed; has error note |
| 🟡 | tentative OR stale | Either one correct answer not yet confirmed (Streak = 1), or was 🟢 but >14 days without testing |
| 🟢 | confirmed | Mastered: Streak ≥ 2 AND age ≤ 14 days |

Transition table (on each graded answer):

| Current | Answer | Next Status | Attempts | Correct | Streak | Error Note |
|---------|--------|-------------|----------|---------|--------|------------|
| (new) | correct | 🟡 | 1 | 1 | 1 | — |
| (new) | wrong | 🔴 | 1 | 0 | 0 | add |
| 🔴 | correct | 🟡 | +1 | +1 | 1 | keep (learning history) |
| 🔴 | wrong | 🔴 | +1 | — | 0 | update |
| 🟡 | correct | If Streak+1 ≥ 2 → 🟢, else 🟡 | +1 | +1 | +1 | keep |
| 🟡 | wrong | 🔴 | +1 | — | 0 | update |
| 🟢 | correct | 🟢 | +1 | +1 | +1 | keep |
| 🟢 | wrong | 🔴 | +1 | — | 0 | update |

Always update `Last Tested` to today on any graded answer.

**Error notes are never deleted** — they stay as learning history even after a concept returns to 🟢.

---

## 5. Stale Detection — Age-based Transition

**Trigger**: Phase 1.5 (Stale Sweep) in `tutor` SKILL.md, run once per tutor invocation, between Phase 1 (Discover) and Phase 2 (Ask Session Type).

**Algorithm**:

```
today = current date (YYYY-MM-DD)
STALE_DAYS = 14

for each concepts/{area}.md:
    for each row in tracker table:
        if Status == 🟢 and (today - parse(Last Tested)).days > STALE_DAYS:
            Status ← 🟡
            # Streak is NOT reset — preserved as learning history
    if any row changed: write concepts/{area}.md

recompute dashboard Proficiency table per §2, §3
write dashboard

if any row changed:
    emit notice to user: "ℹ️ N개 개념이 복습 대기(stale)로 전환되었습니다: …"
```

**Stale exit**: When a 🟡-stale concept is answered correctly, it returns to 🟢 (Streak already ≥ 2 from before, so the second-correct gate is already satisfied). Last Tested is updated.

**Streak preservation rationale**: Streak represents "longest recent confidence streak" — resetting it on time decay discards useful history. A returning user who answered a 🟢-Streak-5 correctly once should get 🟢-Streak-6, not 🟡-Streak-1.

---

## 6. Disambiguation: `🟡 (time-stale)` vs `⚠️ stale` (content-stale)

Two different "stale" concepts exist in this system:

| Marker | Owner | Meaning |
|--------|-------|---------|
| 🟡 in Status | tutor (Phase 1.5) | Concept was 🟢 but not tested in 14+ days — time decay |
| `⚠️ stale` appended to Status cell | tutor-sync (Phase S9) | Concept no longer appears in source material — content drift |

A row can carry both: `🟡 ⚠️ stale` — it's time-stale AND the source no longer mentions it. The `⚠️ stale` flag is a visual hint only; it does not gate quiz selection. Removing a `⚠️ stale` marker requires source material to be re-added or user override.

---

## 7. Session Option Construction (Phase 2)

After the sweep, count:
- `undersampled_areas`: areas with Level = ⬜
- `weak_areas`: areas with Level ∈ {🟥, 🟨}
- `stale_concepts`: total 🟡 rows across all concept files where `today - LastTested > STALE_DAYS`
- `all_strong`: all areas with Level ∈ {🟩, 🟦}

Present AskUserQuestion with options built per:

| Condition | Option label | Description |
|-----------|--------------|-------------|
| `undersampled_areas ≥ 1` | "Diagnostic" | Cover {area names joined with '/'} |
| `weak_areas ≥ 1` | "Drill weak" | Targets {weakest area by Mastery} |
| `stale_concepts ≥ 3` | "Drill stale" | Review {N} concepts due for refresh |
| `all_strong AND not above` | "Hard-mode review" | Challenge mastered material |
| always | "Choose a section" | Pick any area manually |

---

## 8. Backfill Rules (for existing vaults without new schema)

Applied by `tutor` Phase 1.5 as a one-time migration when it detects missing columns/blocks:

| Missing | Backfill |
|---------|----------|
| `Streak` column | Insert between `Correct` and `Last Tested`. For each row: `Streak = Correct if Status == 🟢 else 0` (conservative — assumes past 🟢 was built correctly, past 🔴 resets) |
| `## Concepts (N total)` seed | Scan area's `NN-<area>/*.md` (excluding Practice/문제풀이). List unique basenames (without numbering prefix) as concept seeds. Mark as `<!-- backfilled from file list; review for accuracy -->` |
| Dashboard old columns (정답/오답/정답률/수준) | Recompute all 5 new columns (Concepts/Covered/Accuracy/Mastery/Level) from concept files |

Emit one-time notice: "ℹ️ 스키마가 업데이트되었습니다. {N} concepts backfilled across {M} files. 정확도 확인을 위해 `concepts/*.md`의 seed block을 검토해주세요."

---

## 9. Date Arithmetic Note

- All dates stored as `YYYY-MM-DD` (ISO 8601 date only, no time component).
- Today's date is provided by the conversation's injected `currentDate` context.
- Age = days between two dates, calendar-based (not 24h), computed inclusively of the end date. `(today=2026-04-18) - (LastTested=2026-04-04) = 14 days` → not yet stale. `2026-04-03` → 15 days → stale.
- Parse failures (malformed date) → treat as "very old" → stale. Emit warning in sweep report.
