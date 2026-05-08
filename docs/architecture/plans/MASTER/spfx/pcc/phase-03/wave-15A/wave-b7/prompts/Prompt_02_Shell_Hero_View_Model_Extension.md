# Updated Prompt 02 — Shell Hero View-Model Extension and Surface Metadata Seam

## Objective

Extend the PCC shell/header view-model seam so the shell hero can begin absorbing duplicate surface-header content without relying on bento header cards. This prompt adds deterministic, typed, read-only surface metadata to the shell hero view-model and renders it in the existing `PccProjectHeroBand` as non-interactive summary/cue content.

This prompt must preserve the Prompt 01 posture:

- shell `main[role="tabpanel"]` remains the semantic active-panel owner;
- card-level `data-pcc-active-surface-panel` markers remain temporary compatibility markers;
- bento direct-child invariants remain unchanged;
- no surface header cards are removed in this prompt;
- no Modules launcher or active command search is implemented.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This prompt is a shell hero/view-model extension only.

Do not:

- remove duplicate top-level/header cards;
- alter surface card ordering;
- alter surface runtime files;
- alter bento/grid/card primitives;
- introduce a Modules launcher;
- activate command search;
- introduce URL routing;
- introduce active module state;
- introduce live SharePoint, Graph, Procore, Sage, Autodesk, CRM, or tenant mutation;
- add package dependencies;
- edit `pnpm-lock.yaml`, package dependency sections, manifests, or package-solution files;
- edit Playwright/e2e files;
- broadly format unrelated files.

## Required Repo-Truth Checks Before Editing

Perform these checks before editing. Keep the intake targeted.

### 1. Confirm local baseline

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If relevant files are dirty, stop and report before editing.

Relevant files include:

```text
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

### 2. Inspect current shell hero view-model seam

Inspect:

```text
apps/project-control-center/src/preview/projectShellViewModel.ts
```

Confirm current posture:

- `IPccShellHeroViewModel` includes `primaryTitle`, `secondaryTitle`, `surfaceDescription`, `projectName`, `location`, `estimatedValueDisplay`, `scheduledCompletionDisplay`, and `projectStageLabel`;
- `deriveShellHeroViewModel(profile, activeSurfaceId)` derives the active surface from `PCC_MVP_SURFACES[activeSurfaceId]`;
- surface description comes from `PCC_SURFACE_HERO_DESCRIPTIONS[activeSurfaceId]`;
- no surface summary/cue/read-only metadata fields exist yet.

### 3. Inspect hero copy and surface registry

Inspect:

```text
apps/project-control-center/src/shell/surfaceHeroCopy.ts
packages/models/src/pcc/PccMvpSurfaces.ts
```

Confirm all eight surfaces are represented:

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

Confirm the implementation remains keyed by `PccMvpSurfaceId` and uses exhaustive `Record<PccMvpSurfaceId, ...>` typing.

### 4. Inspect current hero component and CSS

Inspect:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
```

Confirm current posture:

- hero renders identity block;
- hero renders four facts;
- hero renders non-interactive command-search preview slot;
- hero renders tab seam;
- hero does not render source-confidence markers;
- hero does not render client/status/project-number/last-updated facts;
- hero does not render pill-row markers;
- command-search preview has no `input`, `button`, or `a`.

### 5. Inspect existing tests

Inspect:

```text
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Confirm:

- `projectShellViewModel.test.ts` currently locks formatter behavior and the base hero view-model;
- `PccProjectHeroBand.test.tsx` currently locks hero content, negative forbidden markers, command-search inert posture, and responsive markers;
- `PccShell.responsive.test.tsx` currently locks shell hero/tab/canvas behavior and Prompt 01 shell-owned active-panel markers.

## Expected Files

Expected production files:

```text
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
```

Expected test files:

```text
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Optional new production file, preferred if it keeps `surfaceHeroCopy.ts` from becoming too large:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

If you create `surfaceHeaderMetadata.ts`, keep the exports deterministic, typed, and local to shell/preview usage. Do not place this metadata in `@hbc/models` for Prompt 02.

Do not edit these files in Prompt 02:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

## Required Model Shape

Add the following typed shell metadata contract. Exact export location may be either `projectShellViewModel.ts` or the optional new `surfaceHeaderMetadata.ts`, but the public view-model shape must be as follows.

```ts
export type PccShellSurfaceSummaryTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface IPccShellSurfaceSummaryItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone?: PccShellSurfaceSummaryTone;
}

export interface IPccShellSurfaceCue {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface IPccShellSurfaceHeaderMetadata {
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
}
```

Extend the existing `IPccShellHeroViewModel` with:

```ts
readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
readonly surfaceCues: readonly IPccShellSurfaceCue[];
readonly readOnlyCue: string;
```

`deriveShellHeroViewModel(profile, activeSurfaceId)` must populate the new fields from deterministic surface metadata keyed by `PccMvpSurfaceId`.

## Required Surface Metadata

Create deterministic metadata for all eight surfaces using an exhaustive `Readonly<Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>>`.

Use exactly this content unless repo truth reveals a stronger existing copy source. Do not introduce numeric counts unless they already exist in the shell hero view-model inputs.

```ts
export const PCC_SHELL_SURFACE_HEADER_METADATA: Readonly<
  Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>
> = {
  'project-home': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Command preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Fixture / read-model preview' },
      { id: 'authority', label: 'Authority', value: 'Advisory only' },
    ],
    surfaceCues: [
      { id: 'priority-actions', label: 'Focus', value: 'Priority actions and project signals' },
      { id: 'hbi-boundary', label: 'HBI', value: 'Grounded preview, no writeback' },
    ],
    readOnlyCue: 'Read-only preview — no decisions, approvals, or writeback authority.',
  },
  'team-and-access': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Team access preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Project team and access posture' },
      { id: 'authority', label: 'Authority', value: 'Request context only' },
    ],
    surfaceCues: [
      { id: 'team-visibility', label: 'Focus', value: 'Team visibility and permission posture' },
      { id: 'access-boundary', label: 'Boundary', value: 'No access changes from this header' },
    ],
    readOnlyCue: 'Read-only preview — access changes require governed workflows.',
  },
  documents: {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Document control preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'SharePoint / OneDrive / external references' },
      { id: 'authority', label: 'Authority', value: 'Navigation context only' },
    ],
    surfaceCues: [
      { id: 'document-posture', label: 'Focus', value: 'Document access and source posture' },
      { id: 'external-files', label: 'Boundary', value: 'No file moves or writeback' },
    ],
    readOnlyCue: 'Read-only preview — no uploads, moves, deletes, or external launches.',
  },
  'project-readiness': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Readiness preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Readiness framework and module signals' },
      { id: 'authority', label: 'Authority', value: 'Evidence context only' },
    ],
    surfaceCues: [
      { id: 'readiness-posture', label: 'Focus', value: 'Blockers, evidence, and startup-to-closeout controls' },
      { id: 'module-boundary', label: 'Boundary', value: 'No checklist completion from this header' },
    ],
    readOnlyCue: 'Read-only preview — readiness actions remain governed by source modules.',
  },
  approvals: {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Approval checkpoint preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Routing and checkpoint context' },
      { id: 'authority', label: 'Authority', value: 'No approval authority' },
    ],
    surfaceCues: [
      { id: 'routing-posture', label: 'Focus', value: 'Pending decisions and checkpoint posture' },
      { id: 'approval-boundary', label: 'Boundary', value: 'No approve / reject action from this header' },
    ],
    readOnlyCue: 'Read-only preview — approvals require explicit governed action outside the shell header.',
  },
  'external-systems': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'External platform preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Platform registry and mapping posture' },
      { id: 'authority', label: 'Authority', value: 'Launch context only' },
    ],
    surfaceCues: [
      { id: 'registry-posture', label: 'Focus', value: 'External platform mapping and source health' },
      { id: 'integration-boundary', label: 'Boundary', value: 'No sync or external writeback' },
    ],
    readOnlyCue: 'Read-only preview — external platform actions remain outside this header.',
  },
  'control-center-settings': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Settings preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Project, site, persona, and integration context' },
      { id: 'authority', label: 'Authority', value: 'Configuration context only' },
    ],
    surfaceCues: [
      { id: 'settings-posture', label: 'Focus', value: 'Setup posture and inherited configuration context' },
      { id: 'settings-boundary', label: 'Boundary', value: 'No setting changes from this header' },
    ],
    readOnlyCue: 'Read-only preview — configuration changes require governed settings workflows.',
  },
  'site-health': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Site health preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Configuration drift and repair posture' },
      { id: 'authority', label: 'Authority', value: 'Repair context only' },
    ],
    surfaceCues: [
      { id: 'health-posture', label: 'Focus', value: 'Drift, repair posture, and operating health signals' },
      { id: 'repair-boundary', label: 'Boundary', value: 'No repair acknowledgement from this header' },
    ],
    readOnlyCue: 'Read-only preview — repair acknowledgements require governed source workflows.',
  },
};
```

Content constraints:

- Compact labels only.
- No invented live counts.
- No autonomous HBI decision language.
- No source-of-truth claim by HBI or command search.
- No approve/reject/writeback/sync/upload/delete authority.
- Do not use `data-pcc-source-confidence` markers; existing tests forbid them.
- Do not use `data-pcc-pill`, `data-pcc-status-pill`, `data-pcc-hero-pill`, or `data-pcc-hero-pill-row`; existing tests forbid those markers.

## Rendering Requirements

Update `PccProjectHeroBand.tsx` to render the new metadata in the hero surface without adding interactive affordances.

Required DOM markers:

```text
data-pcc-hero-surface-summary
data-pcc-hero-summary-item="<item.id>"
data-pcc-hero-summary-tone="<tone-or-neutral>"
data-pcc-hero-surface-cues
data-pcc-hero-surface-cue="<cue.id>"
data-pcc-hero-read-only-cue
```

Recommended structure:

```tsx
<div className={styles.surfaceSummary} data-pcc-hero-surface-summary="">
  {viewModel.surfaceSummaryItems.map((item) => (
    <div
      key={item.id}
      className={styles.surfaceSummaryItem}
      data-pcc-hero-summary-item={item.id}
      data-pcc-hero-summary-tone={item.tone ?? 'neutral'}
    >
      <span className={styles.surfaceSummaryLabel}>{item.label}</span>
      <span className={styles.surfaceSummaryValue}>{item.value}</span>
    </div>
  ))}
</div>

<div className={styles.surfaceCueRow} data-pcc-hero-surface-cues="">
  {viewModel.surfaceCues.map((cue) => (
    <span key={cue.id} className={styles.surfaceCue} data-pcc-hero-surface-cue={cue.id}>
      <span className={styles.surfaceCueLabel}>{cue.label}</span>
      <span className={styles.surfaceCueValue}>{cue.value}</span>
    </span>
  ))}
  <span className={styles.readOnlyCue} data-pcc-hero-read-only-cue="">
    {viewModel.readOnlyCue}
  </span>
</div>
```

The exact CSS class names may vary, but the data markers must match.

Do not render `button`, `a`, `input`, `select`, `textarea`, `tabindex="0"`, `role="button"`, click handlers, keyboard handlers, URLs, or external launch affordances.

## CSS Requirements

Update `PccProjectHeroBand.module.css` using existing PCC theme variables only.

Required layout intent:

- wide/comfortable modes:
  - identity and command search remain in the top row;
  - metadata summary and cue/read-only row sit between identity/description and facts or immediately above the facts row;
  - facts remain visible and compact;
- compact modes:
  - metadata wraps without horizontal overflow;
  - summary items may wrap to two columns or a single column as needed;
  - read-only cue must remain visible but compact;
- phone mode:
  - grid remains one column;
  - command search remains non-interactive and does not obscure metadata.

Allowed style sources:

- existing `--pcc-*` variables already provided by `PccShell`;
- `--pcc-hero-accent` already set by `PccProjectHeroBand`;
- no new hard-coded hex values;
- no rgba literals unless already used in this CSS file;
- no `!important`.

Do not introduce global CSS.

## Required Tests

### 1. `projectShellViewModel.test.ts`

Add tests proving:

- `deriveShellHeroViewModel` includes `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`;
- all eight `PCC_MVP_SURFACE_IDS` return non-empty metadata arrays;
- every summary item has non-empty `id`, `label`, and `value`;
- every cue has non-empty `id`, `label`, and `value`;
- `readOnlyCue` is non-empty for every surface;
- Project Home metadata includes:
  - summary item `mode = Command preview`;
  - summary item `authority = Advisory only`;
  - cue `hbi-boundary = Grounded preview, no writeback`;
  - readOnlyCue containing `no decisions`, `approvals`, and `writeback`;
- Approvals metadata includes:
  - summary item `authority = No approval authority`;
  - cue `approval-boundary`;
  - readOnlyCue containing `approvals require explicit governed action`.

### 2. `PccProjectHeroBand.test.tsx`

Add tests proving:

- the hero renders `data-pcc-hero-surface-summary`;
- the hero renders one `data-pcc-hero-summary-item` per `viewModel.surfaceSummaryItems`;
- each summary item renders label and value text;
- each summary item emits `data-pcc-hero-summary-tone`, defaulting to `neutral` when tone is omitted;
- the hero renders `data-pcc-hero-surface-cues`;
- the hero renders one `data-pcc-hero-surface-cue` per `viewModel.surfaceCues`;
- the hero renders `data-pcc-hero-read-only-cue`;
- all metadata/cue/read-only zones contain no `input`, `button`, `a`, `select`, `textarea`, `[tabindex="0"]`, or `[role="button"]`;
- existing negative tests remain valid:
  - no `data-pcc-source-confidence`;
  - no client/status/project-number/last-updated facts;
  - no pill-row markers;
  - no legacy phone-mode project-intel toggle;
- all eight surfaces render their deterministic metadata.

### 3. `PccShell.responsive.test.tsx`

Add only targeted coverage if needed:

- shell hero still renders at all responsive modes;
- `data-pcc-hero-surface-summary`, `data-pcc-hero-surface-cues`, and `data-pcc-hero-read-only-cue` exist in standard laptop mode;
- these markers also exist in phone mode;
- command-search slot remains non-interactive;
- tablist / tab / tabpanel accessibility remains unchanged;
- Prompt 01 shell-owned active-panel marker tests remain unchanged.

Do not duplicate all `PccProjectHeroBand.test.tsx` coverage here.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- projectShellViewModel.test.ts
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.responsive.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/preview/projectShellViewModel.ts apps/project-control-center/src/shell/surfaceHeroCopy.ts apps/project-control-center/src/shell/PccProjectHeroBand.tsx apps/project-control-center/src/shell/PccProjectHeroBand.module.css apps/project-control-center/src/tests/projectShellViewModel.test.ts apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If you create `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts`, include it in the Prettier check.

If filename-based filtering is unsupported, run the full package test and report the limitation.

If `prettier --check` fails only for touched files, run `prettier --write` only on touched files, then rerun:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <touched-files-only>
git diff --check
```

Do not run `pnpm install`, `pnpm add`, or any command that intentionally changes the lockfile.

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Implementation Plan

## Hero Metadata Content Plan

## Test / Validation Plan

## Package / Lockfile / Manifest Posture

## Risks / Open Items
```

## Required Following-Execution Response Format

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## What Changed

## Hero Metadata Contract

## Rendering / Accessibility Proof

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 02

Prompt 02 is complete only when:

- shell hero view-model includes typed `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`;
- deterministic metadata exists for all eight `PccMvpSurfaceId` values;
- metadata contains no invented live counts or writeback authority;
- `deriveShellHeroViewModel` populates the new fields for every surface;
- `PccProjectHeroBand` renders the metadata using the required data markers;
- rendered metadata is inert and non-interactive;
- existing hero facts, surface description, command-search preview, tab seam, and responsive mode markers remain intact;
- existing negative tests for source-confidence, client/status/project-number/last-updated facts, pill markers, and phone toggle remain valid;
- Prompt 01 shell-owned active-panel tests remain intact;
- no bento direct-child invariant is affected;
- no surface runtime files are edited;
- no Playwright/e2e files are edited;
- no package/lockfile/manifest/package-solution drift occurs.
