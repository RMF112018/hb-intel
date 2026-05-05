# 03 — Target Surface Header Contract

## Design goal

The target contract must make every routed PCC surface answer the same operator questions:

1. What project am I viewing?
2. What surface am I in?
3. Why does this surface matter?
4. What is the current operational state?
5. What can I do next?
6. Is the content live, reference, read-only, degraded, blocked, unavailable, or loading?
7. What source confidence / freshness posture applies?

## Existing primitive to preserve

Do not discard the current primitive if it exists:

```text
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
```

Wave C hardening should evolve it compatibly unless repo truth proves it is not viable.

## Proposed normalized types

The agent may implement these as source-local app types unless a better existing model exists.

```ts
export type PccSurfaceOperationalPosture =
  | 'reference'
  | 'loading'
  | 'available'
  | 'read-only'
  | 'degraded'
  | 'blocked'
  | 'unavailable'
  | 'error'
  | 'unauthorized'
  | 'missing-config';

export interface PccProjectContextSummary {
  readonly projectId?: PccProjectId;
  readonly projectNumber?: string;
  readonly projectName: string;
  readonly clientName?: string;
  readonly projectLocation?: string;
  readonly lifecyclePhaseLabel?: string;
  readonly statusLabel?: string;
  readonly projectTypeLabel?: string;
}

export interface PccSurfaceSourceContext {
  readonly modeLabel: string;             // Reference, Live, Read-only, Loading, Error
  readonly sourceStatusLabel: string;     // Available, Source unavailable, Backend unavailable, Loading
  readonly confidenceLabel: string;       // High, Medium, Low, Reference, Unavailable
  readonly lastUpdatedLabel?: string;     // Timestamp or "Not listed"
  readonly generatedAtUtc?: string;
  readonly readOnly?: boolean;
}

export interface PccSurfaceActionContext {
  readonly nextActionLabel?: string;
  readonly limitationLabel?: string;
  readonly ownerLabel?: string;
}

export interface PccSurfaceHeaderViewModel {
  readonly surfaceId: PccMvpSurfaceId;
  readonly surfaceLabel: string;
  readonly surfacePurpose: string;
  readonly project: PccProjectContextSummary;
  readonly posture: PccSurfaceOperationalPosture;
  readonly source: PccSurfaceSourceContext;
  readonly action?: PccSurfaceActionContext;
}
```

## Required component contract

The shared header must accept either:

```ts
viewModel: PccSurfaceHeaderViewModel
```

or a backward-compatible prop set that internally normalizes to that view model.

Preferred final public component:

```tsx
<PccSurfaceContextHeader viewModel={headerViewModel} />
```

Allowed transitional component:

```tsx
<PccSurfaceContextHeader
  surfaceId="documents"
  projectLabel="Project 26-000-00 · Document Control"
  postureLabel="Reference view"
  sourceStatusLabel="Reference content"
  sourceConfidenceLabel="Reference view"
  lastUpdatedLabel="Not listed"
/>
```

If transitional props remain, the local agent must document why and define the next migration step.

## Required display fields

### Required at all breakpoints

- project number or project name;
- current surface label;
- state/posture;
- source status;
- at least one short operational cue.

### Required on standard/wide layouts

- project number + project name;
- lifecycle/status when available;
- surface purpose;
- source confidence;
- last updated or `Not listed`.

### Required on constrained layouts

- never wrap into an unusable metadata wall;
- collapse non-critical metadata into compact row or stacked key-value pairs;
- preserve surface label and project identity;
- do not hide state/posture entirely.

## Text hierarchy

Required visual hierarchy:

1. Shell header: app/project identity and active surface context.
2. Surface context header: selected project + current surface + operational posture.
3. Card title: local region title.
4. Section headings and row labels.

Avoid:

- multiple competing hero headers on the same surface;
- repeating the exact same surface title in shell, surface header, and card title without distinction;
- long registry descriptions in the constrained shell header where they crowd project identity.

## Accessibility contract

- Surface context must be inside a meaningful section or header region.
- The region must have either `aria-label` or `aria-labelledby`.
- Critical state must not be conveyed by color alone.
- Loading and error states must preserve existing `PccPreviewState` `aria-busy` and `role=alert` behavior.
- The header must not introduce focus traps or interactive controls unless a future prompt explicitly scopes them.
- If a next-action limitation is shown, disabled affordances must use `PccDisabledAffordance` or an equivalent `aria-describedby` pattern.

## Data seam rules

1. Use current read models when they already expose the data.
2. Do not create backend routes or new API fields in Wave C.
3. If source freshness is unknown, say `Not listed`, not `Live`, `Fresh`, or `Current`.
4. If content is fixture/reference, say `Reference` / `Reference content`.
5. If a surface is admin-managed or non-executable, say so in the next-action/limitation field.
6. Do not infer phase/status from route names.

## Marker contract

Preserve current markers and add only stable, testable markers if needed:

```text
data-pcc-surface-context
data-pcc-surface-context-id
data-pcc-context-project
data-pcc-context-surface
data-pcc-context-surface-description
data-pcc-context-posture
data-pcc-context-source-status
data-pcc-context-source-confidence
data-pcc-context-last-updated
data-pcc-context-lifecycle-status
data-pcc-context-next-action
data-pcc-context-limitation
```

Do not remove existing markers without updating tests and documenting downstream impact.
