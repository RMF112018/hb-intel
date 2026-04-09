# Prompt 01 — Capture Visual Proof for Migrated Homepage Consumers

You are working in the live HB Intel repository.

## Objective

Close the audit gap around presentation-lane visual proof by creating concrete, consumer-tied visual evidence for the named migrated homepage consumers.

This is a proof-and-documentation task with any minimal code/doc support needed to generate the proof artifacts. Do not redesign the UI unless necessary to make the visual-proof workflow viable.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-03-Presentation-Surface-Family-Implementation.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-05-Homepage-Migration-Wave-1.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-08-Verification-Visual-Proof-and-Packaging.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`

Inspect the live consumer surfaces and any existing proof-case mounts or isolated render seams that can support evidence generation.

---

## Named consumers that must be covered

You must produce visual proof coverage for:

- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/webparts/leadershipMessage/LeadershipMessage.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/SmartSearchWayfinding.tsx`

You may also include supporting contextual proof for these intentionally-local premium consumers if it helps the documentation set read as a coherent homepage lane:

- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`

---

## Required work

### 1. Establish or use isolated render seams
Identify the best repo-truth path for capturing visual proof for each named consumer, such as:
- existing proof-case mounts,
- Storybook stories,
- a lightweight evidence harness,
- or another already-aligned isolated render path.

Do not invent a bloated new system if one already exists or can be extended cleanly.

### 2. Generate visual artifacts
Create concrete visual evidence for each named migrated consumer.

At minimum, for each named shared-surface consumer, capture:
- a rendered default state,
- the consumer name,
- the shared surface family it uses,
- and enough framing that the evidence is unambiguous.

Where feasible, include:
- desktop framing,
- one smaller-width framing if the surface materially adapts,
- and any state that best demonstrates the premium lane distinction.

### 3. Create an evidence directory and index
Create a durable in-repo evidence location under:

`docs/architecture/reviews/evidence/ui-system-visual-proof/`

Include:
- the image assets,
- a concise markdown index,
- consumer-to-artifact mapping,
- and a note of how each artifact was produced.

### 4. Tie proof back to audit closure
Update or create a concise review note under:

`docs/architecture/reviews/UI-System-Visual-Proof-Closure.md`

This note must:
- name each covered consumer,
- link it to its artifact(s),
- identify the shared surface family used,
- and state whether the proof materially demonstrates movement beyond generic internal-app card UI.

---

## Validation requirements

Report exactly:
- which visual capture path was used,
- which named consumers were covered,
- what artifacts were produced,
- what consumers were not covered and why,
- and whether the resulting evidence satisfies the audit report’s proof gap.

---

## Guardrails

- Do not redesign the consumers unless necessary for evidence generation.
- Do not claim visual proof exists unless you actually produce and store artifacts.
- Do not produce vague or anonymous screenshots that are not traceable to a named consumer.
- Keep evidence naming disciplined and stable.

---

## Completion requirement

When finished:
1. store the visual artifacts under `docs/architecture/reviews/evidence/ui-system-visual-proof/`
2. create or update `docs/architecture/reviews/UI-System-Visual-Proof-Closure.md`
3. provide a short completion note listing:
   - which consumers now have visual proof,
   - what evidence path was used,
   - whether the visual-proof gap is fully closed or only reduced.
