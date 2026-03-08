# SF06 Agent Handoff Prompt

---

## Agent Briefing

You are the HB Intel implementation agent, governed by `CLAUDE.md` v1.2, `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`, and `docs/architecture/plans/hb-intel-foundation-plan.md`. All work described below is Phase 2 — Shared Packages.

**Before doing anything else**, read the following files in full:

1. `/Users/bobbyfetting/hb-intel/docs/explanation/feature-decisions/PH7-Shared-Features-Evaluation.md` — Full objective and evaluation rationale for all Phase 7 shared features.
2. `/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF06` spec file at the path matching the pattern used for SF01–SF05 (likely `PH7-SF-06-Shared-Feature-Versioned-Record.md` inside `docs/architecture/plans/shared-features/` or equivalent spec location). Read it in full before beginning the interview.

---

## What Has Been Completed

The following shared feature plan families are **complete**. Do not re-do or revisit them.

| Feature | Summary File | Tasks |
|---|---|---|
| SF01 SharePoint Docs | `SF01-SharePoint-Docs.md` | T01–T09 |
| SF02 BIC Next Move | `SF02-BIC-Next-Move.md` | T01–T09 |
| SF03 Complexity Dial | `SF03-Complexity-Dial.md` | T01–T09 |
| SF04 Acknowledgment | `SF04-Acknowledgment.md` | T01–T09 |
| SF05 Step Wizard | `SF05-Step-Wizard.md` | T01–T09 |

All plan files live at:
```
/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/
```

---

## Standing Decisions (Apply to SF06 and All Future SFs — Do Not Ask Again)

**Q10 — Testing Sub-Path Pattern:** Always default to the standard platform testing pattern (Option B equivalent). `@hbc/{package}/testing` sub-path exports: typed config factory, 6 canonical named states, hook stub with vi.fn() mutations, and a wrapper factory. No rendered harness component. Do **not** include Q10 in the SF06 interview.

---

## Your Task

Conduct the structured design interview for:

**`PH7-SF-06-Shared-Feature-Versioned-Record.md`**

Then generate the complete family of plan files.

---

## Interview Protocol (Mandatory Structure)

Ask **one question at a time**. Do not present the next question until the user has answered the current one.

For each question:
- Present the question as `**Question N of 9**` (9 questions total — Q10 is a standing decision, skip it)
- Provide **3 options (A / B / C)** unless the decision space genuinely warrants only 2
- For each option include:
  - A 2–3 sentence description of what it entails
  - **Pros:** (2–3 bullet points)
  - **Cons:** (2–3 bullet points)
  - Mark your recommendation with `⭐ Recommended` if you have one
- After the user answers, echo back: `**Locked: D-0N — [short title]** → [option letter]: [one-sentence summary]`
- Then immediately present the next question

Questions should cover the major architectural decision dimensions of the spec, including but not limited to: versioning strategy, storage/retrieval pattern, conflict resolution, diff presentation, restore/rollback rules, access control, performance/pagination, integration with BIC/Acknowledgment/SharePoint as applicable, and any feature-specific concerns surfaced by reading the spec.

If the user asks a clarifying question mid-interview (e.g., "does this interact with SF02/SF04/SF05?"), pause, provide a thorough analysis of the cross-feature touchpoints, then resume the interview at the same question.

---

## Plan File Generation (After All 9 Answers Are Locked)

Once all decisions are locked, output a decisions summary table, then generate the following **10 files** one at a time (do not batch):

### File Structure

```
SF06-Versioned-Record.md          ← Summary file
SF06-T01-Package-Scaffold.md
SF06-T02-TypeScript-Contracts.md
SF06-T03-[Core-Logic].md          ← Name reflects the primary state/engine component
SF06-T04-Hooks.md
SF06-T05-[Primary-Component].md   ← Name reflects the main UI component
SF06-T06-[Secondary-Component].md ← Supporting UI (diff viewer, timeline, etc.)
SF06-T07-[Integration].md         ← Storage, SharePoint, or cross-package integration
SF06-T08-Testing-Strategy.md
SF06-T09-Deployment.md
```

Adjust T03/T05/T06/T07 names to accurately reflect the SF06 architecture once you have read the spec.

### What Each File Must Contain

**`SF06-Versioned-Record.md` (Summary)**
- All locked decisions table (D-01 through D-09 + standing D-10)
- Full directory tree for `packages/versioned-record/`
- Key data structures / state shape diagram
- Integration points with other `@hbc/*` packages
- Effort estimate (sprint-weeks)
- 4-wave implementation plan
- 20-item Definition of Done
- Task file index

**`SF06-T01-Package-Scaffold.md`**
- Full directory tree
- `package.json` (with correct `name: "@hbc/versioned-record"`, `exports` map including `"./testing"` sub-path)
- `tsconfig.json`, `vitest.config.ts`, `src/test/setup.ts`
- All barrel stubs (`src/index.ts`, `src/testing/index.ts`, etc.)

**`SF06-T02-TypeScript-Contracts.md`**
- All core interfaces, types, enums, and const registries
- Pure utility function signatures with full implementations
- Exported constants
- Every type referenced by later task files must be defined here

**`SF06-T03-[Core-Logic].md`**
- The central state machine, version engine, or diff computation module
- All pure functions implementing locked decisions
- Exhaustive state/transition table
- Representative unit tests

**`SF06-T04-Hooks.md`**
- All React hooks (`useVersionedRecord`, `useVersionHistory`, etc.)
- Full implementations including effects, memoisation, error handling
- Cross-package wiring (BIC, session-state, notification-intelligence as applicable)
- Representative unit tests

**`SF06-T05-[Primary-Component].md`**
- The primary UI component (e.g., `HbcVersionedRecord`, `HbcVersionTimeline`)
- Full implementation with sub-components
- Complexity tier integration
- CSS class definitions
- Representative unit tests

**`SF06-T06-[Secondary-Component].md`**
- Supporting UI components (diff viewer, restore confirmation, version badge, etc.)
- Full implementations
- CSS class definitions
- Representative unit tests

**`SF06-T07-[Integration].md`**
- Storage adapter (SharePoint list schema, Azure Function endpoints, or local cache — per locked decisions)
- Any cross-package amendment requirements (document exactly as SF05-T07 documented SF02 amendments)
- Setup scripts
- Smoke test commands

**`SF06-T08-Testing-Strategy.md`**
- Standard testing sub-path (D-10 standing decision)
- `createMockVersionedRecordConfig` typed factory
- 6 canonical named mock states — each with both runtime state and draft/storage shape
- `mockUseVersionedRecord` with vi.fn() stubs for all mutations
- `createVersionedRecordWrapper` wrapping necessary providers
- Unit test matrix (state machine + hooks)
- Storybook stories (10+ primary component + 6+ secondary)
- Playwright E2E scenarios (8–10)

**`SF06-T09-Deployment.md`**
- Pre-deployment checklist (all waves)
- Full ADR-0015 content (`docs/architecture/adr/0015-versioned-record-platform-primitive.md`) — all decisions with context, rejected alternatives, consequences
- Module adoption guide (`docs/how-to/developer/versioned-record-adoption-guide.md`)
- Any cross-package amendment notices (blocking dependencies called out explicitly)
- Blueprint and foundation plan progress comment blocks
- Verification commands (10+)

---

## File Output Location

Write all files to:
```
/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/
```

---

## Code Quality Standards (Apply to Every File)

- TypeScript — strict mode; no `any`; generics where the spec requires item-type parameterisation
- All hooks follow the `use{Name}<T>(config: I{Name}Config<T>, item: T)` signature pattern
- Pure functions are stateless, exported, and unit-testable in isolation
- Components read `useComplexity()` internally; never accept a complexity tier prop
- Testing sub-path (`@hbc/versioned-record/testing`) is a separate export and does not import production bundle internals unnecessarily
- Every cross-package amendment (if any) must include exact code snippets ready to copy into the target file

---

## Cross-Feature Awareness (Read Before Interviewing)

As you read the SF06 spec, actively look for touchpoints with:

| Package | Potential Touchpoint |
|---|---|
| `@hbc/bic-next-move` (SF02) | Version transitions may trigger BIC ownership changes |
| `@hbc/complexity` (SF03) | Version history depth / diff detail gated by tier |
| `@hbc/acknowledgment` (SF04) | Version publishing may require acknowledgment sign-off |
| `@hbc/step-wizard` (SF05) | Versioned records may be drafts within a wizard step |
| `@hbc/session-state` | Draft version persistence before commit |
| `@hbc/notification-intelligence` | Version conflict or restore notifications |

Surface any gaps (like the SF05 D-04 `BIC_MODULE_MANIFEST` wildcard gap) and document required cross-package amendments in T07 and T09.

---

## Begin

Read the spec and the evaluation doc, then begin the interview with **Question 1 of 9**.
