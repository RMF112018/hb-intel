# Prompt-11A-01 — Tool Launcher Rebuild README / Implementation Brief

## Objective

Conduct a **repo-truth documentation phase** for the Tool Launcher / Work Hub and produce the governing implementation brief for the rebuild workstream.

This phase is **Phase 11A** in the current sequence and corresponds to the previously defined **Phase 00**.

This is a **documentation and governance phase only**.

Do **not** implement the rebuild in this phase.

Do **not** perform visual refinements in this phase.

Do **not** modify runtime behavior in this phase.

Your job is to examine current repo truth and produce the markdown package that will govern the rebuild phases that follow.

---

## Primary Goal

Create a durable implementation brief that makes the following unambiguous:

1. what current repo truth actually implements,
2. which seams should be preserved,
3. which seams are clearly transitional and should be replaced,
4. why the current launcher underperforms relative to the governing doctrine,
5. what later phases must accomplish,
6. and what validation expectations will govern those later phases.

The resulting brief should give the next prompts enough clarity to execute effectively without forcing a timid or over-constrained result.

---

## Governing Inputs

You must use the live repo on `main` as source of truth.

Required paths to inspect:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

You may inspect additional adjacent files where useful, but stay disciplined.

Do not widen this phase into a generalized homepage program review.

---

## Governing Interpretation

The SPFx doctrine is controlling.

You must explicitly interpret the launcher through that doctrine, including the doctrine positions that:

- premium SPFx surfaces must be visibly non-generic,
- default Fluent-feeling card outcomes are not acceptable as the flagship answer,
- design-safety-zone outcomes are prohibited,
- structural rebuild is preferred over decorative refinement when a surface is materially underperforming,
- the premium stack is approved where justified,
- SharePoint host constraints must still be respected.

This brief must call out where the current Tool Launcher appears to still be constrained by older or weaker UI-kit habits or transitional implementation choices.

---

## Required Deliverables

Create the following markdown files:

### 1. Main README / Implementation Brief
Create:
`docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`

This file must contain these sections:

- Title
- Purpose of Phase 11A
- Repo-Truth Assessment
- Reusable Seams
- Transitional / Replaceable Seams
- Doctrine Interpretation
- Why the Current Launcher Underperforms
- Rebuild Posture
- Downstream Phase Sequence
- Validation Philosophy
- Risks / Constraints
- Exit Criteria for Phase 11A

### 2. Change Boundaries File
Create:
`docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`

This file must make clear:

- what this workstream is allowed to change later
- what later phases should preserve
- what is explicitly out of scope
- what package/runtime/authoring constraints cannot be violated
- where `@hbc/ui-kit` should be extended vs bypassed vs wrapped

### 3. Validation Checklist
Create:
`docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`

This file must define the checks that later phases must satisfy, including:

- repo-path scope discipline
- SharePoint host safety
- authoring safety
- partial-data resilience
- accessibility expectations
- search/discovery expectations
- packaging/render parity expectations
- clean build expectations before deployment

---

## Required Findings to Capture

The brief must explicitly state, in grounded repo-truth terms:

### A. What should be preserved
Examples likely include:
- live SharePoint list sourcing seam
- normalized launcher contract seam
- presentation derivation seam
- mount/runtime seam
- useful data model concepts
- useful logo/icon fallback concepts

### B. What is transitional and should not dictate the future surface
Examples likely include:
- weak current composition patterns
- timid card-first hierarchy
- passive support/status treatment
- legacy grouped fallback posture
- overly mechanical ordering logic
- any inline-style-heavy surface logic that makes premium scaling harder

### C. What later phases should rebuild
Examples likely include:
- command surface
- featured stage
- support/status surface
- discovery overlay / search UX
- launcher-specific primitives
- ordering and grouping rules that should be product-driven rather than purely alphabetical or mechanical

---

## Writing Standard

The markdown files must be:

- direct
- specific
- grounded in the actual codebase
- strong enough to support a structural rebuild posture
- not overloaded with decorative prose
- not timid
- not visually prescriptive beyond what doctrine or repo truth requires

Do not write vague strategy language.

Do not hide behind “could,” “might,” or “consider” where repo truth already supports a firmer conclusion.

Where certainty is limited, say exactly why.

---

## Important Constraints

- Do not implement runtime code changes in this phase.
- Do not create visual mocks in this phase.
- Do not rewrite unrelated docs.
- Do not re-read files that are already in current context or memory.
- Do not claim a rebuild is warranted unless your brief grounds that position in the repo and doctrine.
- Do not default to incremental polish language if the evidence points to structural rebuild.

---

## Required Completion Notes

When finished, provide a concise completion note summarizing:

- which files were created
- which repo areas were inspected
- the key preserve vs replace conclusions
- the recommended next phase
- whether any uncertainty remains that later phases must resolve

---

## Final Instruction

Execute **Phase 11A** as a strict README / implementation-brief phase for the Tool Launcher rebuild workstream.

This phase should leave the repo with a clear governing markdown package that later code-agent prompts can rely on for disciplined execution.
