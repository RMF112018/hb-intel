# 00 — Wave C Repo-Truth Audit Findings

## Audit boundary

Audited target:

- Repository: `RMF112018/hb-intel`
- Commit/ref observed through GitHub connector: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app: `apps/project-control-center`
- Models package: `packages/models/src/pcc`
- Governing docs:
  - `docs/reference/ui-kit/doctrine/`
  - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
  - Wave 15A blueprint and plan folders

## Confirmed prior wave inputs

### Wave A / baseline package

Confirmed repo contains the Wave 15A baseline package and closeout. Prompt 01 closeout states:

- canonical blueprint path exists;
- execution package path exists;
- baseline pass was docs-only;
- screenshot, tenant, accessibility, and keyboard evidence were missing at that time;
- next prompt was shell/nav remediation.

### Wave B / shell and navigation

Confirmed repo contains Prompt 02 closeout. Prompt 02 remediated shell/nav behavior and targeted:

- information architecture / navigation;
- shell / host fit;
- command-center hierarchy;
- responsive/container behavior;
- product confidence.

Prompt 02 did not claim `56/56`. Tenant-hosted proof remained deferred.

### Existing Wave C implementation

Confirmed repo contains Prompt 03 closeout. Prompt 03 implemented:

- `PccSurfaceContextHeader`;
- integrations across all primary routed surfaces;
- contract test for all surface ids;
- screenshot evidence for all eight surfaces in desktop wide, SharePoint constrained simulation, and tablet;
- no backend/API changes.

Prompt 03 residuals:

- before screenshots missing;
- narrow-container non-home captures deferred;
- tenant-hosted evidence missing/deferred.

### Later Prompt 05 impact

Confirmed repo contains Prompt 05 closeout. Prompt 05 standardized `PccPreviewState`, added `reason` / `nextStep`, introduced `PccDisabledAffordance`, centralized `pccSurfacePostureCopy`, and rewrote developer-facing posture language.

## Confirmed source ownership

| Concern | Current owner |
|---|---|
| App-level project/surface wiring | `apps/project-control-center/src/PccApp.tsx` |
| Shell frame | `apps/project-control-center/src/shell/PccShell.tsx` |
| Top intelligence header | `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` |
| Navigation surface registry display | `apps/project-control-center/src/shell/PccNavigationRail.tsx` |
| Shell state | `apps/project-control-center/src/state/usePccShellState.ts` |
| Primary surface routing | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` |
| Current surface registry | `packages/models/src/pcc/PccMvpSurfaces.ts` |
| Project placeholder | `apps/project-control-center/src/preview/projectPlaceholder.ts` |
| Surface context header | `apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx` |
| State primitive | `apps/project-control-center/src/ui/PccPreviewState.tsx` |
| Posture vocabulary | `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts` |

## Confirmed implementation facts

1. `PccApp.tsx` reads `activeSurface` from `PCC_MVP_SURFACES` and passes `activeSurface.displayName` and `activeSurface.description` into `PccShell`.
2. `PccApp.tsx` passes placeholder project context from `PCC_PROJECT_PLACEHOLDER` into the shell, not the actual selected project profile.
3. `usePccShellState.ts` includes `selectedProjectId` and `setSelectedProject`, but `PccApp.tsx` does not currently thread selected project identity into surfaces.
4. `PccProjectIntelligenceHeader.tsx` renders a shell-level `h1` and active-surface context.
5. `PccSurfaceRouter.tsx` routes the eight current primary surfaces.
6. `PccSurfaceContextHeader.tsx` renders project label, surface name, surface description, posture, source status, source confidence, and last updated fields.
7. `PccSurfaceContextHeader` props are narrow and string-only; it does not currently own lifecycle phase/status, next action, read-only/degraded/blocked status, or a normalized project model.
8. All eight routed surfaces now have at least one `PccSurfaceContextHeader` instance according to the current contract test.
9. Project labels are still hard-coded in most surface header calls (`Project 26-000-00 · ...`) except the Project Home hero and External Systems header, which use profile/header data in limited form.
10. `PccSurfaceContextHeader.contract.test.tsx` asserts marker presence, but it does not assert semantic values, dynamic project propagation, heading hierarchy, next action, or source confidence mapping.
11. `PccPreviewState` now supports `reason` and `nextStep`, but the current `PccSurfaceContextHeader` contract does not expose a next-action/limitation field.
12. `pccSurfacePostureCopy` is presentational and uses four posture kinds: `reference`, `loading`, `error`, and `unavailable`.

## Confirmed gaps requiring Wave C hardening

### Gap C-01 — shell project context is still placeholder-driven

`PCC_PROJECT_PLACEHOLDER` renders:

- `Project Control Center`
- `Project overview`
- `Last 12 Months`
- pills `Reference` and `PCC`

This provides app identity, not real selected project identity.

### Gap C-02 — selected project state is not materially used

`usePccShellState` has `selectedProjectId`, but the project id is not used to drive `PccProjectIntelligenceHeader` or most surface context labels.

### Gap C-03 — surface context fields are hard-coded per surface

Most surfaces use fixed labels, such as:

- `Project 26-000-00 · Team and Access Scope`
- `Project 26-000-00 · Document Control`
- `Project 26-000-00 · Readiness Center`
- `Project 26-000-00 · Approvals and Checkpoints`
- `Project 26-000-00 · Governance Configuration`
- `Project 26-000-00 · Site Health Context`

This creates future drift risk and weakens project-specific credibility.

### Gap C-04 — project lifecycle/status is not part of shared header contract

Project Home displays stage/status pills from `IProjectProfile`, but this is not consistently available in the shared surface header.

### Gap C-05 — next action / operational limitation is inconsistent

Some surfaces include preview cues; some rely on `PccPreviewState`; others use deferred cards or disabled affordances. There is no shared surface header contract for `nextActionLabel`, `limitationLabel`, or `operatorGuidance`.

### Gap C-06 — source confidence is string-only and not normalized

`sourceConfidenceLabel` exists, but current values are generally posture-copy strings (`Reference view`, `Unavailable`, `—`). This is safer than developer language but not yet a real confidence model.

### Gap C-07 — heading and hierarchy need explicit validation

The shell renders a top-level `h1`, many cards render titles via `PccDashboardCard`, and `PccSurfaceContextHeader` uses paragraphs. The current tests do not verify accessible heading order, repeated labels, or duplicate hierarchy.

### Gap C-08 — responsive evidence is incomplete

Prompt 03 captured wide, constrained, tablet, and one narrow Project Home screenshot. Non-home narrow container proof remains missing.

## Suspected findings requiring local verification

These require local repo inspection and screenshots before closure:

1. Some surface context headers may dominate the card content in constrained widths because the meta row has four fields.
2. Some `lastUpdatedLabel` values are misleading, particularly Project Home using `scheduledCompletionDate` as the last-updated label.
3. `sourceConfidenceLabel` may imply data confidence where the underlying read model only exposes fixture/reference state.
4. Surface purpose statements may be too long for constrained mode, especially Project Readiness.
5. The contract test may pass even if the user-visible copy is generic or duplicated, because it only checks marker presence.

## Required agent posture

Local agent must begin with repo-truth inspection. If the current branch already includes Prompt 03/05 implementation, the agent must harden and normalize; it must not rewrite the shared primitive or surface headers from scratch unless current repo truth proves they are missing or broken.
