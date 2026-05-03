# Prompt 04C — SPFx Unified Lifecycle Reusable Preview Components

## Objective

Build reusable, lightweight, fixture-safe preview components for the unified lifecycle seams prepared in Prompts 04A and 04B.

This prompt must not integrate the components into Project Home, Project Readiness, shell navigation, or a new standalone workspace. It only creates reusable components and focused rendering tests.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Current Baseline

Prompt 04A should provide canonical client/fixture parity.

Prompt 04B should provide adapters/view models for:

- lifecycle timeline;
- project memory;
- project lenses;
- project traceability / related records;
- warranty trace;
- cross-project knowledge / closed-project references;
- unified search / HBI grounding.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect component and test conventions in:

- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/package.json`

Do not re-read files still in current context or memory unless required to verify conventions.

## Required Components

Create reusable preview components or component seams, following repo naming and placement conventions.

Candidate names:

- `LifecycleTimelinePreview`
- `ProjectMemoryPanel`
- `ProjectLensSwitcher`
- `RelatedRecordsPanel`
- `WarrantyTracePreview`
- `ClosedProjectReferencePreview`
- `UnifiedProjectSearchPreview`

If the repo uses a different naming or folder convention, follow repo convention while preserving these responsibilities.

## Required Component Behavior

Components must be:

- preview-safe;
- compact enough for dashboard-style embedding;
- accessible;
- source-lineage-forward;
- explicit when data is:
  - fixture-backed;
  - mock;
  - preview;
  - redacted;
  - restricted;
  - source-unavailable;
  - backend-unavailable;
  - insufficiently evidenced.

## Component-Specific Requirements

### LifecycleTimelinePreview

Must render:

- lifecycle stage progression;
- current/active stage cues;
- historical stage context;
- readiness/gate signal cues;
- source/degraded state messaging.

### ProjectMemoryPanel

Must render:

- decisions;
- assumptions;
- key memory record summaries;
- evidence/source cues;
- assumption status such as open/validated/invalidated/superseded/converted-to-action;
- redacted/restricted summaries without exposing sensitive content.

### ProjectLensSwitcher

Must render:

- available lenses;
- active lens;
- visibility mode;
- visible/redacted/hidden counts where available;
- explicit messaging that lenses filter shared project truth, not separate workspaces.

It must not trigger route changes.

### RelatedRecordsPanel

Must render:

- related record clusters;
- traceability edges;
- confidence/source/evidence cues;
- estimate/scope/commitment/product/warranty relationships where provided.

### WarrantyTracePreview

Must render:

- warranty issue summary;
- evidence-backed recommendation when available;
- explicit insufficient-evidence / unresolved responsibility state when applicable;
- no-blame posture when recommendation is missing.

### ClosedProjectReferencePreview

Must render:

- closed-project references;
- future pursuit reference cues;
- cross-project eligibility/security/redaction posture;
- restricted/redacted messaging for unauthorized or sensitive records.

### UnifiedProjectSearchPreview

Must render:

- query input if current repo component patterns allow local preview state;
- grounded answers with citations;
- refusal/no-grounded-evidence state;
- no uncited answer posture.

If query input would introduce excessive state for this prompt, create a presentational component that receives a query/result view model and leave active search wiring for Prompt 05.

## Constraints

- No Project Home integration.
- No Project Readiness integration.
- No shell navigation changes.
- No new standalone workspace.
- No backend edits.
- No model edits unless required for a compile-blocking export issue.
- No package/dependency/lockfile changes.
- No live external calls.
- No tenant mutation.
- No broad CSS/theme overhaul.

## Styling / UX Guardrails

Follow existing PCC surface and card conventions.

Avoid:

- large full-screen dashboards;
- department-specific workspace language;
- heavy layout changes;
- overbuilt interactions;
- hidden data with no explanation.

Favor:

- compact preview cards;
- accessible headings/labels;
- clear degraded-state messaging;
- clear evidence/source/citation chips;
- redaction notices;
- no-blame warranty language.

## Tests

Add/update rendering tests proving:

- each component renders fixture-backed data without crashing;
- redacted/restricted records do not expose sensitive details;
- source-lineage/evidence/citation cues render where expected;
- warranty insufficient-evidence state does not display a responsible-party recommendation;
- grounded search results show citations;
- refusal/no-grounded-evidence state shows refusal reason or equivalent safe message;
- lens switcher does not create route/workspace behavior;
- components do not require live external integrations.

Use existing test utilities and avoid brittle snapshot-only tests.

## Validation

Run and report:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
md5 pnpm-lock.yaml
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Components added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps for Prompt 04D.
8. Commit hash if committed.
9. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 04C-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add unified lifecycle preview seams
```
