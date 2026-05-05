# 04 — Implementation Requirements

## Execution principle

Implement the smallest shared-system hardening that brings Wave C closer to doctrine without broad visual redesign.

## Required source inspection before changes

The local agent must inspect:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.module.css
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/ui/pccSurfacePostureCopy.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/*ProjectProfile*
apps/project-control-center/src/surfaces/**/*
apps/project-control-center/src/tests/**/*
```

Also inspect Wave 15A closeouts before coding:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-02/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-03/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-05/
```

## Implementation requirements

### Requirement C-01 — preserve current shared primitive

If `PccSurfaceContextHeader` exists, harden it rather than replacing it. Preserve current markers and tests.

### Requirement C-02 — introduce a normalized context view model

Create one narrow helper/model file if no suitable source already exists, for example:

```text
apps/project-control-center/src/surfaces/shared/pccSurfaceHeaderViewModel.ts
```

Responsibilities:

- convert `PccMvpSurfaceId`, project summary, posture kind, and source status into user-facing header fields;
- provide surface-specific purpose and limitation strings from a centralized map;
- avoid per-surface hard-coded project labels.

### Requirement C-03 — use real fixture/profile project data where available

Use existing model fixtures such as `SAMPLE_PROJECT_PROFILE` or read model envelope data. Do not hard-code `26-000-00` inside every surface unless that value is deliberately sourced from the project profile fixture.

### Requirement C-04 — thread selected project context deliberately

Evaluate whether `usePccShellState.selectedProjectId` should be threaded in this wave.

Allowed outcomes:

1. Implement a safe `selectedProjectId` -> project profile resolver using existing fixtures/models.
2. Leave selected-project wiring deferred, but document why and ensure all hard-coded labels are centralized in a placeholder/context helper.

Do not create backend/API reads.

### Requirement C-05 — reduce duplicated purpose copy

Do not let the same long `PCC_MVP_SURFACES[id].description` dominate shell header and surface header. Provide a short shell workflow label and a fuller surface purpose where appropriate.

### Requirement C-06 — expose operational state and next action

Every surface header must have a consistent operational cue. Examples:

- `Reference view · Managed by PCC administrator`
- `Read-only · Launch links open source systems`
- `Source unavailable · Check configuration`
- `Loading · Updating project readiness`

### Requirement C-07 — normalize source confidence

Map available read-model properties where present:

- `mode`
- `sourceStatus`
- `readOnly`
- `generatedAtUtc`
- warnings

Where not present, use conservative strings:

- `Reference content`
- `Not listed`
- `Unavailable`

### Requirement C-08 — responsive behavior

Harden CSS for:

- wide desktop;
- standard desktop;
- SharePoint constrained width;
- tablet;
- narrow/phone.

The context header must never require horizontal scrolling. The meta row must wrap cleanly or collapse to a compact stack.

### Requirement C-09 — accessibility

Add/verify:

- `aria-label` or `aria-labelledby` on surface context section;
- non-color status labels;
- no additional `h1` inside surface cards;
- stable text alternatives for status/posture;
- no hover-only meaning.

### Requirement C-10 — version bump discipline

If runtime files change in the SPFx package, follow current repo convention and bump:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Use the next 4-part version after repo truth. Do not bump docs-only prompts.

## Non-requirements

Do not:

- build new backend routes;
- change route ids;
- change surface registry ids;
- replace `PccBentoGrid`;
- redesign all cards;
- create live Graph/Procore/SharePoint calls;
- claim final `56/56`.
