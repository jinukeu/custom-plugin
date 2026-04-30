# Lesson Rules — Section Selection, Response Classification, Persistence

This is the spec of record for `lesson` skill internals. Sections are referenced by `lesson` SKILL.md as `[lesson-rules.md §X]`.

---

## §Section Selection

Given a concept note, the ordered lesson steps are the `##` headings whose body contains teachable content.

### Excluded headings (case-insensitive, both Korean and English variants)

| Excluded heading | Reason |
|---|---|
| `Overview Table`, `한눈에 비교` | Summary of the rest — not a step |
| `Exam/Test Patterns`, `시험 빈출 패턴` | Per-concept exam hints — taught implicitly via the concept body |
| `Related Notes`, `Related Concepts`, `관련 노트` | Cross-references, not content |

### Excluded by structure

A heading is also excluded if its body is **entirely** one of:
- A single markdown table.
- A bullet list with ≤ 3 items.
- Empty / whitespace only.

Rationale: such sections are metadata, not standalone teachable units.

### Sub-heading handling

`### …` headings (e.g. the `### Definition`, `### Principle`, `### Visualization`, `### Example`, `### Exceptions` sub-blocks introduced by the textbook-depth template) are taught **as part of their parent `##` section** in a single step. Lesson does NOT split a `##` section into multiple steps along `###` boundaries. Splitting would create artificially fragmented questions and double-count toward Coverage.

---

## §Seed Label Format

Match `setup` skill exactly (see `setup/SKILL.md` Phase D6 and `setup/references/templates.md` Concept Tracker Template):

- Default: `<file-basename> · <section-title>` where:
  - `<file-basename>` = the concept note's filename without `.md` extension and without leading `NN-` prefix if present.
  - `<section-title>` = the `##` heading text, with any trailing `[type-tag]` (e.g. `[mechanism]`, `[supplement]`) preserved.
- Disambiguation: if `<section-title>` is **globally unique within the area** (no other concept note in the same `NN-<area>/` folder has a `##` with the same title), the file-basename prefix MAY be omitted: just `<section-title>`.
- Lesson MUST follow whichever convention `setup` used in this vault. Detect by inspecting an existing seed entry: if it contains ` · `, use prefixed; otherwise use bare title.

---

## §Response Classification

After rendering a step's understanding prompt, classify the next user message.

### Confirmation (advance)

ALL of the following must hold:
- ≤ 4 whitespace-separated tokens.
- No `?` character.
- No interrogative words: `왜`, `무엇`, `어떻게`, `언제`, `어디`, `뭐`, `뭔`, `어느`, `why`, `what`, `how`, `when`, `where`, `which`, `who`.
- Matches a confirmation lexicon (case-insensitive):
  - Korean: `ok`, `오케이`, `다음`, `계속`, `진행`, `네`, `응`, `예`, `맞아`, `이해`, `이해함`, `이해했어`, `알겠어`, `알겠습니다`, `좋아`, `👍`.
  - English: `ok`, `okay`, `next`, `continue`, `got it`, `understood`, `clear`, `proceed`, `yes`, `yep`, `y`.

### Question (branch)

Anything else, including:
- Any message containing `?`.
- Messages with interrogative words.
- Statements implying confusion: `모르겠어`, `잘 모르겠어`, `헷갈려`, `다시`, `한번 더`, `idk`, `confused`, `not clear`.
- Long messages (> 4 tokens) even if they sound affirmative — likely they are also asking something.

### Tie-break

If a message is short and lexicon-matched but ALSO contains a `?` or interrogative → **Question** wins. Never advance on ambiguity.

---

## §Tracker Updates on Confirmation

Apply this exactly when the user confirms a step. Refer to [progress-rules.md §1, §4, §6](../../quiz/references/progress-rules.md).

```
seed_label = (label of current step)
row = lookup(tracker_table, seed_label)

if row is None:
    seed_block.add(seed_label)              # if not already there
    tracker_table.append({
        Concept:     seed_label,
        Attempts:    0,
        Correct:     0,
        Streak:      0,
        LastTested:  today,
        Status:      📘,
    })
elif row.Status == 📘:
    row.LastTested = today
elif row.Status in {🔴, 🟡, 🟢}:
    pass   # lesson must not overwrite quiz state
```

Persist `concepts/{area}.md` after each confirmation (one write per step). This keeps the resume invariant cheap: any interruption leaves the file in a consistent "next pending step" state.

---

## §Q&A Section Template

When the user asks a question on step S, append the following to the END of the concept note (after all existing `##` sections):

```markdown

## {Question topic — short noun phrase derived from the question, ≤ 8 words} [supplement]

> **Source:** lesson on {YYYY-MM-DD} — supplement to "{S.section_title}"

### {Definition / 정의}
{1-3 line direct answer.}

### {Principle / 원리}
{Explanation of the "why". Length as needed.}

### {Visualization (optional)}

{mermaid or ASCII diagram if it clarifies; otherwise omit this sub-block.}

### {Example / 예시}
{One concrete example.}
```

Localization:
- Korean note → use Korean sub-headings (`### 정의`, `### 원리`, `### 시각화`, `### 예시`).
- English note → use English sub-headings.
- Omit any sub-block that doesn't apply (e.g. no diagram needed → drop `### Visualization` entirely).

The `[supplement]` tag in the heading is required — it lets future `sync` runs and dashboards distinguish lesson-generated supplements from `setup`-authored canonical sections.

---

## §Seed Block Update on Q&A

After appending a `[supplement]` section, also:
1. Append to `## Concepts (N total)` seed block:
   ```
   - {file-basename} · {Question topic} [supplement]
   ```
   (Use the format detected per §Seed Label Format.)
2. Increment `N total` in the seed block heading.
3. Append a tracker row with `Status = 📘`, `Last Tested = today`, all counters at 0.

This keeps the seed-authoritative invariant (progress-rules.md §1) intact and ensures the supplement counts toward Coverage.

---

## §Skip-Already-Tested Default

If a step's tracker status is `🟡` or `🟢`, lesson skips the step by default and prints a one-line note:

```
⏭  Step {n}: "{section_title}" — already {🟡 tentative | 🟢 confirmed}, skipping.
```

The user can override by typing `다시` / `review` BEFORE lesson advances past that step's prompt. Override re-renders the step but does NOT modify the tracker row (still owned by quiz).

`🔴` rows are NOT skipped — re-teaching after a known error is the intended behavior. The `🔴` row remains until `quiz` clears it on a correct answer.

---

## §Failure Modes & User Messaging

| Situation | Behavior |
|---|---|
| Argument missing | Prompt user for the path. Do not auto-pick. |
| Path not under `StudyVault/NN-<area>/` | Stop with explanation. |
| Tracker file missing | Stop, suggest `/setup` or `/sync`. |
| Seed block missing in tracker | Apply progress-rules.md §1 fallback (treat file list as seed) and emit a one-time warning suggesting `/sync`. |
| All steps already 🟡 / 🟢 | Ask user whether to re-teach from the top. Default is to stop. |
| User aborts mid-lesson (Ctrl-C / "그만") | Already-confirmed steps are persisted (per-step writes). Next `/lesson` resumes from the next pending step automatically. |
