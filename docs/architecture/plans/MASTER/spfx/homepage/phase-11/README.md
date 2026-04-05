# Phase A Prompt Package — Homepage Shared-System Uplift

## Objective

This package instructs the local code agent to implement **Phase A** of the HB Central homepage premiumization program.

Phase A is **not** a full homepage redesign. It is the **shared-system uplift** required before top-band redesign and broader webpart-level premiumization can be executed cleanly.

The target is to correct the shared visual-system limitations identified in the UI audit by upgrading:

- `@hbc/ui-kit/homepage`
- shared homepage-safe primitives used by multiple homepage surfaces
- homepage section / shell / metadata / CTA / icon / card treatment infrastructure
- `apps/hb-webparts/src/homepage/shared/*` where local composition shells should consume the upgraded shared surface language

Phase A must remain anchored to live repo truth and must **not** drift into shell takeover, lane-boundary violations, or generic “make it prettier” work.

---

## Package Contents

1. `Phase-A-Implementation-Plan-Summary.md`
2. `Prompt-01-Phase-A-Baseline-and-Shared-Surface-Architecture.md`
3. `Prompt-02-Implement-Homepage-Shared-Primitives-in-UI-Kit.md`
4. `Prompt-03-Upgrade-Homepage-Local-Shells-and-Clusters.md`
5. `Prompt-04-Refactor-Webparts-to-Consume-the-New-Shared-Language.md`
6. `Prompt-05-Validation-Docs-and-Completion-Closeout.md`

---

## Required Execution Order

Run the prompts in order.

Do **not** skip ahead.

Each prompt assumes the prior prompt's changes are already present in the working tree.

---

## Locked Phase A Scope

### In scope
- expand `@hbc/ui-kit/homepage` with homepage-safe premium primitives
- add stronger homepage typography/metadata/CTA/icon/surface affordances
- improve section shells and shared composition scaffolding
- improve reusable homepage card treatment and density posture
- refactor homepage webparts to consume the new shared language where appropriate
- update docs and stories required by repo standards
- preserve SPFx packaging and existing lane boundaries

### Out of scope
- shell takeover / custom SharePoint chrome
- Lane B Application Customizer work
- homepage zone re-architecture
- deep webpart-specific editorial redesign beyond what is needed to adopt the new shared primitives
- backend/data model changes
- per-webpart authoring schema overhauls unless strictly required by the new primitive contract
- broad changes outside `packages/ui-kit` and `apps/hb-webparts` except for directly related docs/tests/build config

---

## Repo-Truth Anchors

The prompts are written assuming the current live repo truth includes at least the following authoritative files and constraints:

- `apps/hb-webparts/README.md`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/webparts/*`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcCard/index.tsx`
- `packages/ui-kit/src/theme/typography.ts`
- `packages/ui-kit/DESIGN_SYSTEM.md`
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
- Promote only primitives that truly belong in the shared homepage entry-point. Keep one-off content compositions local.
- Add/update stories for new core shared primitives per repo design-system rules where applicable.
- Update docs only where implementation truth changed; do not create speculative architecture drift.

---

## Expected End State

By the end of Phase A, the repo should have:

- a materially stronger homepage-safe primitive layer in `@hbc/ui-kit/homepage`
- upgraded shared card / metadata / CTA / icon / section-shell affordances
- homepage shared shells that no longer read as nearly unstyled semantic wrappers
- homepage webparts partially premiumized through the new shared system
- tests, lint, docs, and stories updated to match implementation truth

---

## Completion Artifacts Expected from the Agent

At minimum, the agent should leave behind:

- code changes implementing the shared-system uplift
- updated docs for the new homepage entry-point/shared primitive surface
- story coverage for new shared primitives where required
- a completion note summarizing:
  - what changed
  - what was deliberately left local
  - what remains for later phases
  - any risks / follow-ons / migration notes

