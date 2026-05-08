# Implementation Plan — PCC Phase 03 Conditional Command Header Content

## 1. Objective

Complete Phase 03 by making the PCC shell command header conditionally render deterministic, surface-specific content for all current MVP surfaces.

The implementation should make the header feel like the active command context for the selected surface while preserving existing tab semantics, bento layout, read-only posture, and Phase 04 duplicate-card handoff boundary.

## 2. Phase Objective Restated

The header should begin replacing the informational role of old top-level surface cards by carrying:

- active surface identity;
- active surface description;
- compact summary items/chips;
- source/read-only/degraded cues;
- Project Home command-summary posture;
- compact seam for future health trend/visual summary content.

The bento field remains operational content. Duplicate top-level cards remain in place during Phase 03 and are documented for Phase 04.

## 3. Current Repo-Truth Findings to Re-Verify

Prompt 01 must re-check all of these:

| Item | Planning Audit Finding | Must Re-Verify |
|---|---|---|
| Shell active-panel ownership | `main[role="tabpanel"]` carries `data-pcc-active-surface-panel` | Yes |
| Card marker compatibility | `PccDashboardCard.dataActiveSurfacePanel` remains temporary compatibility | Yes |
| Metadata source | `surfaceHeaderMetadata.ts` appears to be source of truth | Yes |
| View-model seam | `projectShellViewModel.ts` exposes metadata arrays/cue | Yes |
| Hero rendering | `PccProjectHeroBand.tsx` renders summary/cue/read-only zones | Yes |
| Command search | `PccCommandSearch.tsx` is non-interactive preview | Yes |
| Package-solution path | `apps/project-control-center/config/package-solution.json` | Yes |
| Duplicate cards | Still present and Phase 04 handoff inventory | Yes |

## 4. In Scope

- Repo-truth pre-edit verification.
- Exact target metadata matrix for all eight MVP surfaces.
- Deterministic header metadata model.
- Header rendering refinement.
- Project Home command-summary posture in header.
- Source/read-only/no-writeback/degraded cues.
- Header accessibility semantics.
- Responsive wrapping/compact behavior.
- Unit/component tests.
- Phase 04 duplicate-card handoff inventory.

## 5. Out of Scope

- Duplicate-card removal.
- Full Modules launcher.
- Command routing.
- Active module state.
- Project Home bento composition realignment.
- Cross-surface operational content realignment.
- Broad visual polish.
- Live tenant writes.
- External-system sync.
- Approval execution.
- Repair execution.
- File operations.
- Settings mutation.
- Package/manifest/lockfile changes.

## 6. MVP Surface Registry

Current surfaces to cover exhaustively:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

## 7. Target Metadata Requirements

Prompt 01 must produce the final matrix before Prompt 02 edits.

### 7.1 Required Metadata Shape

Each surface must have:

```text
surfaceSummaryItems[]
  - id
  - label
  - value
  - tone, where applicable

surfaceCues[]
  - id
  - label
  - value

readOnlyCue
```

### 7.2 Metadata Quality Rules

- Use stable, testable IDs.
- Keep labels compact.
- Keep values deterministic.
- Use fixture-derived values only when the repo already has safe deterministic fixture data.
- Do not invent live counts.
- Do not imply source access that is not present.
- Do not imply writeback, approval authority, repair authority, settings mutation, external launch execution, or file operations.
- Do not expose hidden tenant facts.

## 8. Surface-by-Surface Target Guidance

### Project Home

Header should include:

- Project Control Center / Project Home identity.
- command preview or command summary mode.
- source preview/read-model cue.
- HBI advisory/no decision/no writeback cue.
- high-priority actions if safely derived from existing `projectCommandSummary`.
- pending approvals if safely derived.
- blocking setup gaps if safely derived.
- compact future health trend seam or trend-summary placeholder.

### Team & Access

Header should include:

- team visibility/access posture;
- access manager boundary;
- pending request/access audit context if deterministic;
- no access changes from header.

### Documents

Header should include:

- Document Control identity;
- SharePoint / OneDrive / external systems source posture;
- read-only / launch-only / no file moves/uploads/deletes;
- document health/source posture if deterministic.

### Project Readiness

Header should include:

- readiness posture;
- blockers/evidence/source confidence context if deterministic;
- no checklist completion from header;
- readiness actions remain governed by source modules.

### Approvals

Header should include:

- approvals/checkpoints identity;
- pending/escalated/recent posture if deterministic;
- no approve/reject/waive/defer authority;
- no writeback.

### External Systems

Header should include:

- external platforms / launch pad identity;
- configured/degraded/not-configured posture if deterministic;
- launch-only/no sync/no external writeback;
- source permission/configuration cue.

### Control Center Settings

Header should include:

- settings identity;
- missing required configuration posture;
- inherited settings / overrides / governance context if deterministic;
- no setting changes from header.

### Site Health

Header should include:

- site health identity;
- overall health/critical/warning/repair posture if deterministic;
- last-check/source cue if deterministic;
- no repair acknowledgement/execution from header.

## 9. File Boundaries

### Likely Runtime Files

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

### Likely Test Files

```text
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

### Reference-Only Surface/Header-Card Files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
```

### Avoid Unless Narrowly Justified

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
pnpm-lock.yaml
package.json
apps/project-control-center/package.json
apps/project-control-center/config/package-solution.json
```

## 10. Prompt Execution Plan

### Prompt 01 — Repo Baseline and Phase 2 Verification

- Re-check current `main`.
- Confirm shell ownership and metadata source.
- Define target metadata matrix.
- Confirm package-solution path.
- Confirm Phase 04 handoff boundary.

### Prompt 02 — Surface Command Header Metadata

- Implement metadata matrix.
- Add metadata tests.
- Preserve deterministic/read-only scope.

### Prompt 03 — PccProjectHeroBand Conditional Rendering

- Render metadata as meaningful surface-specific header content.
- Preserve command-search preview.
- Add conditional rendering tests.

### Prompt 04 — Header A11y and Responsive Semantics

- Harden semantic structure, wrapping, labels, non-color-only indicators.
- Add responsive/a11y tests.

### Prompt 05 — Tests and Targeted Validation

- Complete all-surface coverage.
- Run baseline validation.
- Confirm no package/lockfile/manifest drift.

### Prompt 06 — Phase 4 Handoff Inventory

- Document duplicate/header-card removal candidates.
- Map content relocation.
- Preserve runtime behavior.

## 11. Acceptance Criteria

- Header renders unique surface-specific content for every MVP surface.
- Header content is deterministic and fixture-safe.
- Header includes source/read-only/no-writeback/degraded cues.
- Project Home header includes command-summary posture or clearly defined seam.
- Tabs and tabpanel accessibility remain valid.
- Bento direct-child invariant remains valid.
- No full Modules launcher is introduced.
- No command routing or active module state is introduced.
- Duplicate/header cards remain in runtime and are documented for Phase 04.
- Check-types and tests pass.

## 12. Evidence / Validation Position

Phase 03 generally requires unit/component validation only. Live Playwright evidence is optional unless the implementation touches Playwright selectors, live evidence fields, screenshots, or screenshot-dependent docs.

## 13. Required Runtime/Test Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## 14. Required Docs-Only Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## 15. Optional Live Evidence

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```
