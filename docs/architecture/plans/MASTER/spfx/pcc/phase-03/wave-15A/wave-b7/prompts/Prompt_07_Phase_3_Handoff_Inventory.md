# Prompt 07 — Phase 3 Handoff Inventory

## Objective

Create a precise handoff inventory for the next phase: duplicate top-level surface header card removal and command-header content migration. This prompt is documentation-only unless a trivial test comment update is necessary and explicitly justified.

Do not remove or modify runtime cards in this prompt.

## Mandatory Opening Instruction

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks

Search/inspect current production surface files for:

```text
dataActiveSurfacePanel
Project Intelligence
HeaderCard
OverviewCard
LaunchPadHeaderCard
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
PccSiteHealthOverviewCard
PccControlCenterSettingsSurface
ReadinessHeroSlot
HomeCard
```

Inspect the current state of:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
```

## Handoff Document Requirements

Create a handoff file in a repo-appropriate planning path selected by current repo convention. Do not invent an odd path if a current Phase 2/Phase 3 package path exists.

The handoff must include:

1. **Duplicate header card inventory**
   - surface;
   - component;
   - current title;
   - current marker use;
   - whether the card is purely duplicative or partially operational.

2. **Content relocation map**
   - identity/title/description → command header;
   - counts/chips → command header summary;
   - useful operational list → keep as bento card;
   - source/read-only cue → command header or source card;
   - gateway/launch action → future module launcher/card gateway.

3. **Test impact inventory**
   - tests that currently expect the card;
   - tests that currently expect card-level marker;
   - Playwright selectors to update.

4. **Recommended Phase 3 prompt sequence**
   - remove Project Home `Project Intelligence` from bento after header absorbs content;
   - remove/demote Documents header card;
   - remove/demote Team & Access header card;
   - remove/demote External Platforms header card;
   - remove/demote Settings/Site Health/Readiness/Approvals top overview cards where duplicative;
   - update Project Home first-fold composition.

5. **Hard stops for Phase 3**
   - no loss of operational content;
   - no direct-child regression;
   - no false affordances;
   - no package/lockfile/manifest drift.

## Validation Required

```bash
git status --short
pnpm exec prettier --check <new-handoff-file>
git diff --check
```

Run app tests only if runtime/test files were changed; this prompt should normally be docs-only.

## Required Response Format

```markdown
## Objective

## Repo-Truth Checks Performed

## Handoff File Created

## Duplicate Header Card Inventory Summary

## Phase 3 Prompt Sequence Recommendation

## Validation Run

## Package / Lockfile / Manifest Posture
```
