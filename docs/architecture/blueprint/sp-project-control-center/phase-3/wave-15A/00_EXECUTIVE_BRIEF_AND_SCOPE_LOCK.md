# 00 — Executive Brief and Scope Lock

## 1. Executive Summary

Wave 15A is a required PCC UI doctrine remediation wave. The current PCC implementation demonstrates route coverage and fixture-driven preview behavior, but it does not yet meet the product-grade command-center standard required for Phase 3 closeout or Phase 4 tenant validation.

The remediation target is not a better-looking prototype. The target is a flagship SharePoint-hosted project operations surface that scores 56/56 against the adapted SPFx full-page product surface scorecard.

## 2. Why Wave 15A Exists

The doctrine audit identified systemic UX/UI drift in the PCC:

- The shell visually dominates the content.
- Project context is strongest on Project Home but fades across other surfaces.
- The navigation is module-based rather than workflow-oriented.
- The grid/card system produces equal-weight content and at least one severe layout failure.
- Preview/read-only/unavailable states are technically present but too developer-facing.
- Several surfaces read as unfinished fixtures rather than governed product previews.
- The SharePoint host chrome materially reduces available viewport and the current layout does not fully account for it.

Wave 15A resolves these issues before they become normalized as the PCC baseline.

## 3. Wave 15A Objective

Remediate PCC shared UX/UI foundations and primary surfaces so that:

- PCC operates as a coherent project command center.
- Every surface has clear project context, state, and next action.
- Shared shell, grid, card, and state patterns align with UI doctrine.
- Every major surface is usable inside actual SharePoint tenant chrome.
- The final scorecard result is 56/56 with evidence.

## 4. Scope

### In Scope

- PCC shared shell and top command header.
- SharePoint host fit.
- Left navigation and information architecture.
- Project context and surface header standard.
- Bento/grid/card hierarchy system.
- Preview/read-only/degraded/unavailable/blocked state model.
- Product language remediation.
- Project Home.
- Team & Access.
- Documents.
- Project Readiness.
- Site Health.
- Control Center Settings.
- Approvals.
- External Systems.
- Tests tied to layout, rendering, state, accessibility, and host fit.
- Tenant-hosted screenshot evidence.
- Scorecard closeout documentation.

### Out of Scope

- New backend feature execution.
- New external API integrations unless required to support existing preview content.
- New live approval workflow execution.
- New authorization architecture.
- Major data-model redesign unless required by current UI defects.
- Replacing the PCC feature roadmap.
- Rebranding HB Central or HB Intel.
- Implementing unrelated Phase 16+ scope.

## 5. Scope Boundary Rules

1. Do not widen Wave 15A into a backend integration wave.
2. Do not add new business functionality to compensate for weak UX hierarchy.
3. Do not defer shared primitive defects to surface-level styling.
4. Do not close Wave 15A with “near flagship” language. The objective is 56/56.
5. Do not rely on dev-server screenshots only. Tenant-hosted evidence is required.

## 6. Go / No-Go Standard

PCC may proceed beyond Wave 15A only if all are true:

- Final scorecard is 56/56.
- Every category is 4/4.
- Team & Access layout failure is corrected.
- All major surfaces have before/after screenshots.
- Published and edit-mode SharePoint screenshots are captured.
- State model language is product-grade.
- Project context is visible on every surface.
- Disabled controls either explain why they are disabled, provide preview alternatives, or are removed.
- Accessibility/keyboard review has no unresolved hard-stop issues.
- Closeout includes source, test, screenshot, and residual-risk evidence.
