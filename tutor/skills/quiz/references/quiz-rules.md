# Quiz Design Rules

## Zero-Hint Policy (CRITICAL)

Every question must be answerable ONLY by someone who actually knows the material.

1. **Option descriptions**: NEVER reveal correctness
   - BAD: `label: "stderr"`, `description: "Error output stream used by Cloud Run for error classification"`
   - GOOD: `label: "stderr"`, `description: "Standard error stream"`

2. **No "(Recommended)" tag** on any option

3. **Randomize correct answer position MECHANICALLY** — LLM "mental randomness" is biased: it clusters the correct answer on the same slot across questions (the exact bug this rule exists to prevent). Never place answers by intuition:
   - Before assembling options (Phase 4), generate the positions with one Bash call:
     ```bash
     python3 -c "
     import random
     N = 4  # questions in this round (adjust if fewer)
     while True:
         p = [random.randint(1, 4) for _ in range(N)]
         if max(p.count(v) for v in p) <= 2:
             print(*p); break"
     ```
   - The i-th number = the correct option's slot for question i. Fill the remaining slots with distractors.
   - The re-roll constraint guarantees no slot is correct more than twice per round — "계속 같은 번호가 정답" cannot happen.
   - Do NOT use an exact permutation of 1–4 instead: knowing "each slot is used exactly once" would let a test-taker deduce the last answer by elimination.

4. **Question phrasing**: Ask about behavior/purpose/output, don't hint at the answer
   - BAD: "Which error stream does error() use?"
   - GOOD: "Where does error() method output go?"

5. **Plausible distractors**: Wrong options must be real concepts from the domain, representing common misconceptions

## Provide Sufficient Context (맥락 충분성)

Counterweight to Zero-Hint: hiding the answer is NOT the same as stripping context. The goal is discrimination — "those who know it solve it, those who don't can't" — not brevity. A stem that omits the setup produces noise errors (people who know the concept fail because the sentence is underspecified), not real signal.

1. **Context ≠ hint**: Stating the situation, premises, and criteria the question is measured against is NOT a Zero-Hint violation. Only revealing *which option is correct* is.

2. **State the frame for relational questions**: For comparison / direction / ordering / relative-magnitude questions, name the reference frame (the two ends of the axis, the baseline being compared) in the stem. Mirror-image option pairs ("A up · B down" vs "A down · B up") that can't be solved without an unstated frame are forbidden.

3. **Check question**: "From this stem alone, can a learner who knows the concept tell exactly what is being asked?" If not, add more context.

- BAD: "Which of the following is correct?" + [near-context-free one-line options]
- GOOD: "<1–2 sentences laying out situation · premises · criteria>, which is correct?" + [...]

## Triviality Gate & Auto-Pass (지엽성 게이트)

Questions must measure **understanding**, not incidental detail. A question is *trivial* (지엽적) when NOT knowing the answer does not indicate a gap in understanding the concept:

- Exact figures lifted from a table (limits, dates, default values) when the concept is about the mechanism, not the number
- Arbitrary spellings: flag/parameter/option names, section numbers, file names
- Enumeration memorization: "how many X are there?", "which is NOT in the list?", list-order recall
- Source-document incidentals: example values, phrasing quirks of the material

Litmus test: **"Would someone who genuinely understands this concept necessarily know this detail?"** If no, the question is trivial.

1. **Never include a trivial question.** Before giving up on a concept, try lifting it to a substantive angle (behavior / purpose / mechanism / comparison / debugging — see Question Types). Short ≠ trivial: factual recall of a load-bearing fact is fine.
2. **Auto-pass trivial-only concepts**: if a target concept offers ONLY trivial askables (pure enumeration / spec listing with no conceptual substance), do NOT quiz it. Add it to `auto_passed` (concept + one-line reason) in Phase 3; Phase 6 marks it 🟢 immediately without testing (spec: [progress-rules.md §4 Auto-Pass](../../_shared/progress-rules.md)).
3. **Refill the slot** with the next eligible concept. If the pool runs dry, a round with fewer than 4 questions is acceptable — never pad with trivia.

## Question Types

1. **Factual recall**: "What HTTP status code is returned when...?"
2. **Conceptual understanding**: "Why does the system use X pattern?"
3. **Behavioral prediction**: "What happens when X fails?"
4. **Comparison/distinction**: "What is the difference between X and Y?"
5. **Debugging scenario**: "Given this error, what is the most likely cause?"

## Difficulty Balancing

- Diagnostic: easy 40%, medium 40%, hard 20%
- Weak-area drill: medium 30%, hard 70%
- Review: all levels evenly

## Drilling Unresolved Concepts

When targeting 🔴 concepts from concept files:
- Do NOT repeat the exact same question — rephrase in a new context
- Test the same underlying knowledge from a different angle
- E.g., if user confused "400 vs 422", ask a scenario question where they must choose the correct status code for a new situation

## AskUserQuestion Format

- 4 questions per round, 4 options each, single-select
- Header: max 12 chars, "Q1. Topic"

## File Update Protocol

After grading:
1. Update `concepts/{area}.md` — apply [progress-rules.md §4 (Status Transitions)](../../_shared/progress-rules.md) including Streak column
2. Update dashboard — recompute Coverage / Accuracy / Mastery / Level per [progress-rules.md §2, §3](../../_shared/progress-rules.md)
3. Level badges (coverage-gated): ⬜ cov<50% · 🟥 weak · 🟨 fair · 🟩 good · 🟦 mastered

## Language Rule

All file content and output in the user's detected language. Badge emojis are universal.
