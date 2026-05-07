# 00 — Executive Brief and Scope Lock

## 1. Executive Summary

Wave 15A exists to correct PCC UI/UX doctrine drift before Phase 3 closeout and before Phase 4 tenant validation. The remediation is not cosmetic. It is a product-readiness program intended to move PCC toward a flagship, evidence-backed, SharePoint-hosted SPFx project control center.

The prior 56/56 scoring model is superseded for PCC readiness. Wave 15A now uses the reusable PCC 100-point UI/UX Mold Breaker scorecard.

## 2. Why Wave 15A Exists

The PCC Phase 3 implementation has produced a broad set of operational surfaces and shared primitives. However, current UI/UX concerns show that PCC risks entering Phase 4 with:

- Dense card-grid behavior.
- Module-first navigation.
- Weak command-center hierarchy.
- Overloaded surfaces.
- Read-only / preview / disabled affordance ambiguity.
- Incomplete tenant-hosted evidence.
- Incomplete accessibility and breakpoint proof.
- Limited differentiation from incumbent construction-tech UI/UX failure modes.

Wave 15A exists to prevent those issues from becoming Phase 4 defects.

## 3. Updated Success Standard

Wave 15A success means PCC can be scored under:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

With the following readiness target:

- **100/100 desired.**
- **95/100 minimum for Phase 4 entry consideration.**
- **No hard-stop failures.**
- **No pillar below 80% of available points.**
- **Complete evidence package.**
- **Independent re-score possible from evidence.**

## 4. Scope

### In Scope

- Shared shell, host-fit, and page-canvas behavior.
- Project identity and project context hierarchy.
- Navigation and active-surface clarity.
- Command/search/HBI affordance posture.
- Bento/grid behavior.
- Card hierarchy, density, and footprint behavior.
- Shared state model.
- Preview/read-only/deferred/degraded/missing-config language.
- Accessibility, keyboard, focus, contrast, ARIA, and touch viability.
- Responsive behavior across desktop, laptop, tablet, phone/narrow, high-zoom, short-height, and constrained host contexts.
- Surface-level remediation for:
  - Project Home
  - Project Readiness
  - Documents
  - External Platforms
  - Approvals
  - Team & Access
  - Site Health
  - Control Center Settings
- Mold Breaker differentiation from incumbent construction-tech patterns documented in the design-decision studies.
- Evidence collection and Phase 4 readiness scoring.

### Out of Scope

- Live write-side integrations.
- New production backend mutation behavior.
- New Procore, Sage, SharePoint, or HBI runtime authority beyond approved architecture.
- Feature expansion unrelated to UI/UX readiness.
- Surface redesigns that bypass shared primitive remediation.
- Cosmetic styling without a documented UX failure mode.
- Treating Phase 4 as the discovery stage for basic UI doctrine issues.

## 5. Scope Boundary Rules

- Wave 15A may change UI structure, layout, language, state treatment, accessibility behavior, and evidence requirements.
- Wave 15A should not change source-of-record ownership.
- Wave 15A should not convert preview/read-only workflows into live workflows unless separately authorized.
- Wave 15A should not hide honest limitations; it should communicate them better.
- Wave 15A should not mimic incumbent construction-tech density simply because that pattern is familiar.

## 6. Go / No-Go Standard

PCC is **Go for Phase 4 UI/UX entry** only if:

- Score is 95/100 or higher.
- No hard stops remain.
- All required evidence categories are complete.
- All critical surfaces pass their surface-specific evidence block.
- The final score references the package/version being validated.

PCC is **No-Go** if any hard stop remains, even if the weighted score appears acceptable.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

