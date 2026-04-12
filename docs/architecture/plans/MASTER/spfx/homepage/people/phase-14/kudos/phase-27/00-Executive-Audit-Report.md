# HB Kudos — Repo-Truth Audit Report

## Objective

Conduct an exhaustive, repo-truth audit of the current HB Kudos implementation on the live `main` branch of `RMF112018/hb-intel`, judge it against the binding doctrine below, and produce a serialized remediation package that forces one-finding-at-a-time closure.

## Binding authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. Relevant supporting guidance under `docs/reference/ui-kit`
4. Actual implementation under `apps/hb-webparts/src/webparts/`

## Repo-truth implementation map

### Primary render surfaces
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

### Public-runtime sub-surfaces
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/*`

### Shared Kudos surface-family seams
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosFeed.module.css`

### Shared governance seams
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

### Runtime / packaging / guardrails
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/hb-webparts/.eslintrc.cjs`
- `apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts`
- `scripts/testing/people-kudos/smoke/index.ts`

### Adjacent non-Kudos People & Culture seams reviewed for boundary validation
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/PeopleCultureCompanion.tsx`

## Executive judgment

The current HB Kudos implementation shows real architectural progress, but it is **not yet doctrine-compliant** and **not yet fully premium / production-grade**.

The strongest parts of the implementation are:
- the explicit split-runtime ownership contract,
- the use of `@hbc/ui-kit/homepage` rather than prohibited root entry points,
- the existence of mount/runtime linkage and doctrine guard tests,
- the decomposition of the public runtime into smaller composition components,
- the companion CSS container-query work,
- the existence of packaging smoke coverage.

The weakest parts of the implementation are:
- raw-color / raw-spacing / bespoke-token drift in ordinary homepage source,
- a companion runtime that still carries too many responsibilities in one file,
- over-reliance on the composer flyout shell for non-composer surfaces,
- packaging-heavy validation with insufficient interactive UX / accessibility regression coverage,
- public-surface visual polish that is still more decorative than systematically productized,
- moderation workflow UX that is competent but not yet best-in-class.

## Findings

### Finding 01 — Shared token bridge is still locally authored and doctrine-drifting
**Severity:** P0

`KudosGovernancePrimitives.tsx` correctly tries to centralize Kudos tokens, but the bridge itself is still authored as a bespoke local palette with local hex and rgba values. That means the supposed governance seam still hardcodes visual decisions instead of simply translating governed theme semantics into local aliases.

#### Why this matters
- It defeats the doctrine’s token-discipline requirement.
- It creates long-term drift risk between shared UI-kit semantics and the Kudos family.
- It guarantees that future color and material changes remain manual and error-prone.

#### Correction direction
- Reduce the bridge to a true alias layer over governed theme tokens.
- Remove locally authored color values unless they are explicitly documented flagship exceptions.
- Move all remaining legitimate exceptions into one narrowly defined and documented seam.

---

### Finding 02 — Public-surface CSS is materially non-compliant with homepage token discipline
**Severity:** P0

`kudosSurface.module.css` contains extensive raw hex, raw rgba, hardcoded gradients, hardcoded shadows, and hardcoded pixel spacing/radius decisions in ordinary homepage webpart source.

#### Why this matters
- The homepage overlay explicitly prohibits direct hex/rgb values and hardcoded pixel spacing in ordinary homepage source.
- This is not an edge case or one-off flagship exception; it is the dominant posture of the file.
- The surface therefore fails binding doctrine, even if it looks polished in screenshots.

#### Correction direction
- Rebuild the CSS around governed `--hbk-*` variables and shared spacing/material tokens.
- Remove decorative local gradient/shadow authoring that cannot be justified as a formally documented flagship exception.
- Tighten the file until it is obviously doctrine-compliant by inspection.

---

### Finding 03 — Public surface is premiumized, but still not structurally strong enough
**Severity:** P1

The public surface is better than a generic card grid, but its quality still depends too heavily on gradients, glow, blur, and decorative refinement. The hero/featured/recent/archive composition is coherent, yet still reads more as a stylized recognition card stack than a distinctly productized homepage surface.

#### Why this matters
- The SPFx doctrine rejects subtle premiumization when structural improvement is required.
- The surface should feel intentionally authored for SharePoint page-canvas use, not merely embellished.
- Recent and archive zones remain especially conservative and leave UX value on the table.

#### Correction direction
- Revisit the public information hierarchy and spacing rhythm.
- Strengthen the top-band object, featured content authority, and the relationship between recent/archive/feed surfaces.
- Favor structural clarity over additional decorative treatment.

---

### Finding 04 — Flyout shell reuse has become a weak primitive seam
**Severity:** P1

The repo repeatedly reuses `HbcKudosComposerFlyout` for:
- the actual composer,
- the feed panel,
- input dialogs,
- datetime dialog,
- assignment dialog,
- companion detail panel.

That is efficient in the short term, but it now signals primitive mismatch.

#### Why this matters
- Different workflows are being forced through the same shell grammar.
- This reduces semantic clarity, makes the product feel flatter, and limits surface-specific UX improvements.
- It also makes future behavior changes riskier because unrelated flows share the same container semantics.

#### Correction direction
- Split the shell layer into purpose-specific primitives:
  - composer flyout,
  - reader / detail drawer,
  - governance decision panel,
  - compact task dialog.
- Preserve shared internals where appropriate, but stop presenting distinct workflows through the same visual wrapper.

---

### Finding 05 — Companion runtime is overgrown and under-extracted
**Severity:** P0

`HbKudosCompanion.tsx` still owns too much:
- tab definitions,
- reducer,
- filtering,
- queue-row rendering,
- detail-panel rendering,
- action routing,
- dialog orchestration,
- bulk approval,
- role-resolution branches,
- load / permission / host degradation states,
- audit timeline fetch orchestration.

The file is doing too much even though some supporting seams exist.

#### Why this matters
- It is harder to test, reason about, and close defects safely.
- UI changes and workflow changes are unnecessarily coupled.
- The companion can no longer evolve cleanly toward a more sophisticated moderation experience while this much logic remains fused.

#### Correction direction
- Extract state selectors, action planners, queue-region composition, detail-surface composition, and degraded-state rendering into dedicated modules.
- Preserve the split-runtime contract.
- Treat the current file as an orchestration host, not the whole workspace.

---

### Finding 06 — Companion workflow is solid but leaves major UX upside on the table
**Severity:** P1

The companion no longer looks like a throwaway admin form, but it is still closer to a good internal queue than a top-class moderation workspace. The queue is scanable, the action families are better grouped, and the filters are clearer than older versions — but the experience is still action-dense, modal-heavy, and not quite operationally optimized.

#### Why this matters
- Moderation surfaces benefit from denser scan patterns, stronger state visibility, and faster decision ergonomics.
- The current queue-card + flyout model still creates too much context switching.
- High-value moderation information could be made more legible without making the UI busier.

#### Correction direction
- Consider a split-view governance workspace:
  - denser master queue,
  - persistent scoped filters,
  - stronger row metadata system,
  - richer inline status presentation,
  - dedicated decision pane.
- Re-evaluate the row model, not just the styling.

---

### Finding 07 — Bulk operations are functionally present but operationally weak
**Severity:** P2

Bulk approve exists, but the current implementation is sequential, minimally instrumented, and not especially confidence-building. It is correct enough for a first pass, but weak for a premium moderation tool.

#### Why this matters
- Operators need clear feedback, partial-failure reporting, and a reliable sense of what happened.
- Sequential loops without richer status or summary create weak operational trust.
- This area will become more fragile as workflow complexity increases.

#### Correction direction
- Harden bulk execution reporting, progress communication, partial-failure surfacing, and retry posture.
- Keep the domain contract typed and auditable.

---

### Finding 08 — Validation is too packaging-centric for the real UX risk profile
**Severity:** P0

The repo has packaging smoke coverage and doctrine guard tests, which is good. But the current proof posture does not adequately validate:
- the actual public recognition UX,
- the composer workflow,
- archive/feed/article-reader behavior,
- companion moderation workflows,
- focus handling,
- reduced-motion behavior,
- interaction regressions,
- hosted-layout regressions.

#### Why this matters
- The biggest remaining risks are now interaction quality, doctrine regression, and UI workflow drift — not just packaging linkage.
- A premium UI cannot be validated mainly through artifact existence and manifest parity.

#### Correction direction
- Expand the automated suite to cover real user paths in the dev harness and, where applicable, SharePoint-hosted behavior.
- Add UX-specific and accessibility-specific assertions.

---

### Finding 09 — Mount / manifest / contract discipline is better than the UI layer and should be preserved
**Severity:** Preserve

The repo includes:
- adjacent manifests,
- mount-map linkage through runtime constants,
- doctrine guard tests proving key invariants,
- packaging smoke checks for shell-entry and manifest registration.

This is one of the healthiest parts of the implementation.

#### Why this matters
- It reduces drift.
- It gives the package a stable deployment spine.
- It should not be destabilized during visual/UI remediation.

#### Correction direction
- Preserve this seam.
- Extend it where needed, but do not replace it casually.

---

### Finding 10 — Import discipline is in place, but stack adoption is still shallow
**Severity:** P2

The homepage import rules are enforced by ESLint and the runtime generally stays inside `@hbc/ui-kit/homepage`, which is correct. The repo also uses `class-variance-authority` and `clsx`. But the premium stack is not yet being used to its full potential.

#### Why this matters
- The doctrine expects meaningful use of the approved premium stack where relevant.
- Right now some adoption is real, but some of it still reads as compliance-through-availability rather than compliance-through-surface-advancement.

#### Correction direction
- Keep the current import discipline.
- Use the premium stack more intentionally where it materially improves the product:
  - better overlays,
  - better detail panes,
  - richer anchored interactions where justified,
  - stronger variant systems.

## What should remain intact

The remediation package should preserve:
- the public / companion runtime split,
- `kudosRuntimeContract.ts`,
- mount-map constant linkage,
- the `@hbc/ui-kit/homepage` import posture,
- existing doctrine guard tests unless a guard itself becomes obsolete,
- the general public-runtime decomposition pattern,
- the container-query direction inside `companion.module.css`,
- typed governance patch contracts.

## Overall remediation strategy

1. Fix the doctrine failures first.
2. Replace weak styling seams before layering more UI polish on top.
3. Decompose the companion runtime before major workflow redesign.
4. Rebuild the moderation workspace as a stronger operational product.
5. Expand validation to match the real risk profile.
6. Close each finding completely before moving to the next one.
