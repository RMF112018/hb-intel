# Gap Register

## Gap 01 — Handheld shelf suppression does not match runtime device-class output
- **Category:** Breakpoint / shell-fit quality
- **Current condition:** The launcher band CSS tries to suppress shelf treatment for `phone-portrait` and `phone-landscape`, while runtime emits `phone`.
- **Why it underperforms:** Phone portrait retains padding/material that should collapse, making the mobile launcher visually taller and less integrated.
- **Severity:** Critical
- **Recommended direction:** Align the CSS selectors with the real emitted device-class contract, then re-tune the handheld band's vertical footprint.
- **Affected seams:** `HbHomepageLauncherBand.tsx`, `HbHomepageLauncherBand.module.css`
- **Refinement vs redesign:** Refinement

## Gap 02 — Handheld trigger remains too tall and too dominant
- **Category:** Responsive UX
- **Current condition:** The mobile `HB Toolbox` / `More tools` entry reads as a large branded slab.
- **Why it underperforms:** It consumes too much first-screen attention and slows the user’s path to meaningful homepage value.
- **Severity:** Critical
- **Recommended direction:** Reduce overall trigger height, surrounding band padding, and vertical dead space; keep the action clear but faster.
- **Affected seams:** `homepage-launcher.module.css`, `HbcHomepageLauncherOverflow.tsx`, entry-stack spacing
- **Refinement vs redesign:** Refinement

## Gap 03 — Overflow posture is overcommitted to a modal bottom sheet
- **Category:** Interaction completeness
- **Current condition:** A sheet is enforced across display classes.
- **Why it underperforms:** Desktop and some tablet states need a lighter-weight secondary-launch surface.
- **Severity:** High
- **Recommended direction:** Use device-class-specific overflow surfaces.
- **Affected seams:** `priorityActionsPresentation.ts`, `HbcHomepageLauncher.tsx`, `HbcHomepageLauncherOverflow.tsx`, tests
- **Refinement vs redesign:** Redesign

## Gap 04 — Secondary IA is flattened into one `Company Tools` category
- **Category:** Information hierarchy
- **Current condition:** All overflow tools are rendered inside one category even though grouping metadata exists upstream.
- **Why it underperforms:** Scanability drops, trust drops, and users must visually brute-force the list.
- **Severity:** High
- **Recommended direction:** Reintroduce grouped secondary IA in the overflow surface.
- **Affected seams:** adapter / overflow rendering / tile grouping behavior
- **Refinement vs redesign:** Redesign

## Gap 05 — Primary tool hierarchy is encoded but not clearly communicated
- **Category:** Surface composition and hierarchy
- **Current condition:** The order is hard-coded, but the UI does not strongly communicate why those tools are primary.
- **Why it underperforms:** The surface feels arbitrary and equal-weight.
- **Severity:** High
- **Recommended direction:** Introduce stronger tiering and more intentional primary-launch storytelling.
- **Affected seams:** adapter, tile grammar, band composition
- **Refinement vs redesign:** Redesign

## Gap 06 — Desktop launcher still reads as a polished strip, not a flagship launch surface
- **Category:** Purpose-fit / persona
- **Current condition:** Good finish, weak product identity.
- **Why it underperforms:** The homepage’s main launch surface should feel unmistakably intentional and productized.
- **Severity:** High
- **Recommended direction:** Rework the desktop/tablet surface grammar, not just individual tile styling.
- **Affected seams:** UI-kit launcher family, homepage integration shell
- **Refinement vs redesign:** Redesign

## Gap 07 — Tests currently lock in some weak product decisions
- **Category:** Maintainability / closure
- **Current condition:** Several tests assert behavior that should now be reconsidered, especially universal sheet overflow and single-entry handheld posture.
- **Why it underperforms:** Weak UX choices become harder to change cleanly.
- **Severity:** Medium
- **Recommended direction:** Update tests after the new product contract is defined.
- **Affected seams:** `priorityActionsPresentation.test.ts`, `priorityActionsLauncherAdapter.test.ts`
- **Refinement vs redesign:** Refinement

## Gap 08 — Hosted proof is not strong enough
- **Category:** Validation and closure
- **Current condition:** Screenshots show conflicting handheld states relative to current source assumptions.
- **Why it underperforms:** Acceptance is not credible without packaged and hosted proof.
- **Severity:** High
- **Recommended direction:** Require a hosted breakpoint matrix and DOM/runtime marker proof in the next closure wave.
- **Affected seams:** package validation, hosted screenshots, QA evidence
- **Refinement vs redesign:** Refinement
