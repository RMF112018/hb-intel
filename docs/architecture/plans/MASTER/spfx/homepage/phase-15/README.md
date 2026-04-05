# Phase E Prompt Package — Homepage Composition Pass

## Objective

This package instructs the local code agent to implement **Phase E** of the HB Central homepage premiumization program.

Phase E is the **homepage composition pass**. Its purpose is to make the homepage read like a coherent, premium digital front door rather than a stack of individually improved modules that still lack full-page narrative, rhythm, and hierarchy.

The primary targets are:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- homepage zone rhythm and section sequencing
- homepage composition shells and wrappers
- page-level spacing, section-intro, and inter-zone hierarchy rules
- any shared homepage-safe composition primitives required to express the final page narrative cleanly

Phase E must stay anchored to live repo truth and must preserve the lane boundaries, packaging model, homepage doctrine overlay, import discipline, accessibility rules, and authoring-safe behavior already established in the repo.

---

## Package Contents

1. `Phase-E-Implementation-Plan-Summary.md`
2. `Prompt-01-Phase-E-Baseline-and-Composition-Architecture.md`
3. `Prompt-02-Refine-Zone-Rhythm-and-Section-Narrative.md`
4. `Prompt-03-Redesign-ReferenceHomepageComposition-and-Inter-Zone-Hierarchy.md`
5. `Prompt-04-Polish-Composition-Shells-Spacing-and-Page-Level-Consistency.md`
6. `Prompt-05-Validation-Docs-and-Completion-Closeout.md`

---

## Required Execution Order

Run the prompts in order.

Do **not** skip ahead.

Each prompt assumes the prior prompt's changes are already present in the working tree.

---

## Locked Phase E Scope

### In scope
- strengthen homepage zone rhythm, spacing cadence, and section narrative
- improve inter-zone hierarchy so the page reads as one composed experience
- refine `ReferenceHomepageComposition` so it becomes a materially stronger governed visual reference
- refine or extend homepage composition shells/wrappers where that improves real repo truth
- improve page-level consistency across section headers, zone intros, spacing, background posture, and grouping logic
- preserve the distinction between what is a composition reference and what is a production rendering path
- update docs/tests/stories required by repo truth and touched scope
- preserve SPFx lane/package safety

### Out of scope
- shell takeover / custom SharePoint chrome
- Lane B Application Customizer work
- backend/data-model changes
- speculative “single homepage app” production architecture that contradicts the current independent-webpart model
- broad redesign of unrelated webparts beyond what is necessary to express composition truth
- major authoring-schema rewrites unless strictly required

---

## Repo-Truth Anchors

The prompts are written assuming the current live repo truth includes at least the following authoritative files and constraints:

- `apps/hb-webparts/README.md`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/webparts/*`
- `packages/ui-kit/src/homepage.ts`
- any homepage-safe primitives added during earlier premiumization phases
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

If repo truth has materially changed, the agent must reconcile against the live code before editing.

---

## Hard Gates

The code agent must satisfy all of the following:

- **Do not re-read files that are still within your current context window or memory.** Re-read only when needed to resolve uncertainty, verify drift, or inspect files not already in active context.
- Keep homepage imports compliant with the existing homepage entry-point doctrine.
- Do not introduce root `@hbc/ui-kit` imports into homepage webparts.
- Preserve Lane A ownership and do not create shell chrome.
- Do not regress `.sppkg` packaging, mount/dispatch seams, or multi-webpart cumulative behavior.
- Keep accessibility, token discipline, reduced-motion support, and authoring-safe defaults intact.
- Do not present the governed composition preview as if it were the production rendering path.
- Improve composition truth without relying on unsupported SharePoint shell manipulation.
- Update docs only where implementation truth changed; do not create speculative architecture drift.

---

## Expected End State

By the end of Phase E, the repo should have:

- a materially stronger homepage composition reference
- better zone-to-zone rhythm and section narrative
- cleaner page-level hierarchy across the five homepage zones
- stronger shared composition shells and spacing rules where justified
- a more premium, composed, and leadership-ready homepage reference experience
- validation, docs, and closeout artifacts aligned to implementation truth

---

## Completion Artifacts Expected from the Agent

At minimum, the agent should leave behind:

- code changes implementing the Phase E composition pass
- updated docs/stories/tests where required
- a completion note summarizing:
  - what changed
  - what was improved in the governed composition layer vs reusable shared wrappers
  - what remains limited by the current independent-webpart production model
  - any risks / follow-ons / migration notes
