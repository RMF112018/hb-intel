# 01 — Doctrine Authority Matrix

## Purpose

Translate governing UI doctrine and SPFx surface references into actionable acceptance criteria for PCC Wave 15A.

## Rule

The doctrine documents are acceptance criteria. A local agent must not treat them as optional inspiration.

## Authority Matrix

| Criterion ID | Source Document                                  | Requirement Summary                                                                                   | PCC Applicability                                                          | Acceptance Threshold                                                            | Evidence Required                                     | Gate Type            | Likely Source Files / Components                                   |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------- | ------------------------------------------------------------------ |
| DA-01        | UI-Doctrine-SPFx-Governing-Standard.md           | SPFx surfaces must respect SharePoint host, product-grade hierarchy, and explicit state ownership.    | Applies to all PCC surfaces.                                               | No hard-stop defects; surface reads as product, not debug/demo shell.           | Hosted screenshots, scorecard notes, test evidence.   | Hard gate            | PccShell, PccSurfaceRouter, all surfaces                           |
| DA-02        | UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md | Full-page SPFx app must fit host frame without fake native app chrome dominance.                      | Applies to PCC as a full-page command-center surface.                      | Shell supports operational work and does not dominate content.                  | Hosted viewport screenshots; host runtime validation. | Hard gate            | PccShell, app manifests, layout CSS                                |
| DA-03        | homepage-uiux-audit-scorecard.md                 | Use 14-category 56-point scoring as acceptance model adapted to PCC.                                  | Applies as adapted scorecard source.                                       | 56/56 only after evidence-backed validation.                                    | Final scorecard with evidence links.                  | Hard gate            | docs, all surfaces                                                 |
| DA-04        | SPFx-Widget-and-Bento-Layout-Patterns.md         | Bento/card layout must avoid unusable spans and must communicate hierarchy.                           | Applies to PCC grid and dashboard cards.                                   | No collapsed/narrow primary content; card weights reflect operational priority. | Footprint tests, screenshots.                         | Hard gate            | PccBentoGrid, PccDashboardCard, useBentoRowSpan                    |
| DA-05        | SPFx-Command-Center-Dashboard-Patterns.md        | Command-center surfaces prioritize status, risk, next action, and confidence.                         | Applies to PCC project home and module surfaces.                           | Users can identify blockers, status, owner, and next action in first scan.      | Per-surface screenshots and closeouts.                | Major quality factor | Project Home, Readiness, Approvals, Site Health                    |
| DA-06        | SPFx-State-Model-Standard.md                     | States must be explicit, useful, and role/context aware.                                              | Applies to preview, degraded, no-data, read-only, locked, disabled states. | No generic dead ends; disabled/read-only states explain reason and next step.   | State tests and screenshots.                          | Hard gate            | PccPreviewState, state mapping, sourceStateMessaging, surface copy |
| DA-07        | SPFx-Breakpoint-and-Container-Fit-Standard.md    | Surface must remain useful across host container widths.                                              | Applies to all PCC surfaces.                                               | Desktop/tablet/mobile widths remain readable and usable.                        | Responsive screenshot matrix and layout tests.        | Hard gate            | PccBentoGrid, CSS modules, surface layouts                         |
| DA-08        | SPFx-Host-Runtime-Validation-Standard.md         | Tenant-hosted validation must prove behavior inside SharePoint, not just local harness.               | Applies to final 56/56 closeout.                                           | Tenant evidence must be captured before score claim.                            | Tenant URL/build/screenshot evidence.                 | Hard gate            | SPFx package/config, Wave H docs                                   |
| DA-09        | SPFx-Surface-Quality-Standard.md                 | Surface quality requires professional information architecture, accessibility, and visual confidence. | Applies to every PCC surface.                                              | No category below professional threshold; flagship requires evidence.           | Scorecard and closeout per surface.                   | Hard gate            | all surfaces                                                       |
| DA-10        | AGENT-USAGE-GUIDE.md / GOVERNANCE-MAP.md         | Agents must follow authoritative docs and avoid local styling drift.                                  | Applies to every prompt execution.                                         | Shared primitives/tokens preferred over one-off local fixes.                    | Diff review and closeout attestation.                 | Hard gate            | all changed files                                                  |

## Adaptation of Homepage-Specific References to PCC

The homepage UI/UX checklist and scorecard are SPFx surface audit references. PCC is not the homepage, but it is a SharePoint-hosted full-page SPFx product surface. Therefore:

- Homepage-specific hero/content-band requirements must be adapted to PCC shell, project context, navigation, command-center hierarchy, bento/card layout, and surface composition.
- Accessibility, responsiveness, state model, tenant validation, and product confidence requirements apply directly.
- Any criterion that assumes homepage content publishing must be translated to PCC operational command-center purpose.
- Final acceptance must cite the adapted interpretation in the scorecard closeout.

## Hard Gates

The following are hard gates for any final 56/56 claim:

1. Tenant-hosted SharePoint validation.
2. Screenshot evidence for before/after and final state.
3. Accessibility and keyboard validation.
4. Test/typecheck/build evidence.
5. Per-surface closeout.
6. Final scorecard with evidence references.
7. No major doctrine deviation left unresolved unless explicitly documented as an accepted deferment that blocks 56/56.
