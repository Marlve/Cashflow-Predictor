# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Cash-Flow Forecaster — project context

## What this is
A take-home assessment for a Shortcut Asia internship (paid, RM2,000/month, 3 months, on-site Bangsar KL). Submission deadline: **16 August 2026, 11:59pm**. This is judged on reasoning quality, not feature count — it is not a general-purpose finance app.

## What's actually being evaluated
- A systematic approach: planned, worked in steps, deliberate decisions rather than piling on features
- Understanding the problem and its limits
- Ability to explain how the solution works and why, out loud, in a pitch
- Sound reasoning about tradeoffs and alternatives considered
- Honest reflection on what's unfinished or uncertain
- Explicitly **not** graded: feature volume, decorative polish, a flashy demo video, or hours spent
- Two solid, fully-understood features beat many half-built ones
- Target build time: ~8-12 hours total. Do not scope-creep past this.

## The chosen topic
Cash-Flow Forecaster: plug in income and recurring bills, project balance across the month. Stated hard part (from the brief): bills land on different cycles (weekly/monthly/annual), and the useful output is the *exact day* the balance dips lowest — modelling overlapping cycles correctly is where the difficulty lives. This is the feature to go deep on.

## Scope decisions already made — do not re-litigate without checking in
1. **Income & recurring bills only.** No day-to-day discretionary spending (e.g. meals) tracking. Deliberately dropped — too unpredictable to model reliably, and adding it risks turning this into a transaction tracker instead of a forecaster.
2. **The app's promise is scoped, and the UI must say so.** It predicts the earliest day the balance could get tight *assuming no spending beyond committed recurring bills* — not a prediction of real spending. Prefer copy like "your floor" / "guaranteed low point" over "your balance will run out on X."
3. Spending categories (food/transport/memberships) are **not** part of the model — they don't affect timing. Cycle + date + amount is what matters, not category.
4. One-off *known* future expenses (e.g. an annual renewal) belong in the model, using the same "occurrence" mechanism as recurring items, just with a one-time cycle.

## Core algorithm — this is a simulation, not an optimization problem
There is no ordering to search over, so no need for anything from the "clever algorithms" toolbox.
1. Represent each item as `{ date, amount, name, cycle }`.
2. Expand every recurring item into its occurrences within the forecast window (monthly → 1, weekly → ~4, annual → 0 or 1 depending on whether it falls in range).
3. Merge all occurrences (income + bills) into one flat array.
4. Sort chronologically with the language's **built-in** sort. Do not hand-roll a sort algorithm — unnecessary complexity for this assessment.
5. Walk the sorted list once, tracking a running balance from a real starting balance. Track every local minimum, not just the single lowest point — balance can dip, recover, then dip lower again later in the month.

### Edge cases the occurrence-generation step must get right
- Monthly items due on a day that doesn't exist every month (e.g. the 31st)
- Weekly items anchored to a specific weekday — the exact weekday shifts which other bills it collides with
- Annual items that may or may not fall inside the forecast window at all
- Items starting partway through the window (no occurrence before their start date)
- Behaviour at the edges of the forecast window

## Reminder / lead-time design — needs a defensible answer for the pitch
A bare "lowest on the 24th" isn't useful alone — value comes from enough lead time to act. Decide and document:
- How much lead time counts as "enough" (too early = ignored noise, too late = useless)
- Whether it's fixed, or scaled to how fast the balance is falling / size of the shortfall
- Be ready to justify this in the pitch — directly maps to their question "what assumptions does your solution make."

## Tech stack
TypeScript, Next.js, React.

## Submission requirements
1. Working app hosted online (Vercel/Netlify/similar) or with clear setup instructions
2. Source repo (GitHub/GitLab/Bitbucket, public or invite), complex logic documented in-repo
3. 1-2 pages of documentation: planning/approach, why these tools, main technical decisions and reasoning, 1-2 flowcharts for key flows, architecture overview, where AI was used and how output was checked
4. 3-5 minute demo video (voiceover recommended): what was built, how it works, why key decisions were made
5. Deadline: 16 August 2026, 11:59pm

## AI use
Expected and should be discussed openly, not hidden. What matters: delegating the right work to AI while owning the parts that should stay owned, actually reading and verifying what it produces, catching and reworking wrong suggestions, avoiding complexity that isn't needed.

## Guardrails for the agent
- Do not add scope beyond what's listed above without checking in — target is ~8-12 hours, two well-understood features.
- Do not implement: discretionary-spending tracking, spend categorization as a model input, or a hand-rolled sort algorithm — all explicitly considered and rejected above.
- Every design decision should be explainable in plain language. If a piece of logic can't be explained simply, that's a signal it's more complex than this assessment calls for.
