# Prompt 02 — Shared Foleon Reader View Model and Layout Registry

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, and the repo’s existing no-assumption / repo-truth posture.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, Foleon routes, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.

---

## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
```

Use these as controlling baseline documents.

Do not reopen the hero/post-hero edge-authority decision unless implementation evidence proves the Prompt 01 contract is defective.

The current expected baseline is:

- `HbHomepageShell` governs the post-hero shell body and Foleon slot metadata.
- `HbHomepageEntryStack` governs the hero / shared edge authority.
- Prompt 01 added a dormant opt-in edge-to-window contract and metadata for eligible Foleon reader slots.
- Default hosted output should remain unchanged unless a later prompt opts into edge behavior.
- This pass should not redesign the visual layout of Project Spotlight, Company Pulse, or Leadership Message.

---

## Objective

Refactor the Foleon reader rendering path so **preview and production states share a normalized view model and route through a lane-specific layout registry**.

This prompt is an architecture-seam pass. Its purpose is to remove the current “single shared preview skeleton owns layout” condition and establish a clean registry that later prompts can use to implement differentiated lane compositions.

Do **not** perform the full visual redesign of all lanes in this prompt. Temporary wrappers are acceptable, but each lane must resolve through a unique layout component and stable layout marker.

---

## Required Repo-Truth First Step

Inspect, at minimum:

```text
packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx
packages/foleon-reader/src/index.ts

packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderPreview.tsx
packages/foleon-reader/src/readers/FoleonReaderModule.module.css
packages/foleon-reader/src/readers/FoleonReaderModule.module.css.d.ts
packages/foleon-reader/src/readers/readerConfigs.ts
packages/foleon-reader/src/readers/ProjectSpotlightReader.tsx
packages/foleon-reader/src/readers/CompanyPulseReader.tsx
packages/foleon-reader/src/readers/LeadershipMessageReader.tsx
packages/foleon-reader/src/readers/__tests__/**

packages/foleon-reader/src/services/FoleonReaderContentService.ts
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/types/foleon-runtime.types.ts
packages/foleon-reader/src/components/FoleonIframeHost.tsx
packages/foleon-reader/src/components/FoleonStates.tsx

apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css
```

Also inspect the package manifests / version authority files that govern `@hbc/foleon-reader` and `hb-webparts` if source changes require version/package updates.

---

## Current Problem to Solve

The baseline audit identified that the three Foleon lanes currently feel “cookie-cutter” because:

- `ProjectSpotlightReader`, `CompanyPulseReader`, and `LeadershipMessageReader` are thin wrappers over one `FoleonReaderModule`.
- `FoleonReaderPreview.tsx` renders one shared structure and only swaps copy/tone values by lane.
- Production rendering also uses a shared module structure with tone-based CSS differences.
- The current architecture does not provide a strong seam for lane-owned composition.
- Preview fallback and production content can drift because preview copy and production record data are not normalized into one lane view model.

Prompt 02 must fix the architecture seam without attempting the final visual redesign.

---

## Required Architecture

Create or equivalent:

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
packages/foleon-reader/src/readers/layouts/
```

Add or equivalent:

```ts
export type FoleonReaderLayoutKey =
  | 'projectSpotlight'
  | 'companyPulse'
  | 'leadershipMessage';
```

Add or equivalent registry:

```ts
export const FOLEON_READER_LAYOUTS = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
} as const;
```

Each lane must have a unique layout component, even if the first implementation is a temporary compatibility wrapper:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
```

Each layout component must emit stable, testable markers, for example:

```tsx
data-foleon-reader-layout="project-spotlight"
data-foleon-reader-lane="projectSpotlight"
data-foleon-reader-state="preview|ready"
```

Use the naming that best aligns with the repo’s conventions, but the markers must let tests prove lane-specific layout routing.

---

## Required View Model

Create a normalized reader view model covering, at minimum:

```ts
export interface FoleonReaderViewModel {
  readonly lane: FoleonReaderLayoutKey;
  readonly state: 'preview' | 'ready';
  readonly readerKey: string;
  readonly contentTypeKey: string;
  readonly placementKey: string;
  readonly title: string;
  readonly summary?: string;
  readonly eyebrow: string;
  readonly previewLabel?: string;
  readonly freshnessLabel: string;
  readonly freshnessValue: string;
  readonly audience: string;
  readonly archiveGroup: string;
  readonly chips: readonly FoleonReaderChip[];
  readonly facts: readonly FoleonReaderFact[];
  readonly supportItems: readonly FoleonReaderSupportItem[];
  readonly governanceNotes: readonly string[];
  readonly statusNotes: readonly string[];
  readonly actions: readonly FoleonReaderAction[];
  readonly iframe?: FoleonReaderIframeModel;
  readonly warnings: readonly string[];
}
```

The exact field names may differ if repo conventions require it, but the model must support:

- lane identity;
- state: `preview` or `ready`;
- title;
- summary;
- eyebrow;
- preview label;
- freshness label/value;
- audience;
- archive group;
- chips / facts;
- support items;
- media / iframe readiness;
- actions;
- governance/status notes;
- warnings.

Preview view models must be honest and clearly labeled as preview/sample content.

Production view models must preserve active Foleon record data and existing gate behavior.

---

## Required Adapter Functions

Create adapter helpers, or equivalent, that centralize conversion from existing state into the view model:

```ts
createPreviewFoleonReaderViewModel(config, lane): FoleonReaderViewModel
createReadyFoleonReaderViewModel(config, lane, record, resolution, context): FoleonReaderViewModel
```

The adapters must preserve existing semantics:

- Project Spotlight freshness should continue to prefer `issueDate ?? publishedOn`.
- Company Pulse and Leadership Message freshness should continue to prefer `lastEditorialUpdate ?? publishedOn`, unless repo truth shows another current rule.
- Audience should default to `Companywide` when missing.
- Archive group should default to `Archive coming soon` when missing.
- Preview must not emit live reader telemetry or mount an iframe.
- Ready state must preserve Foleon iframe host mounting and existing origin-policy/gate behavior.

---

## Required Rendering Behavior

Refactor `FoleonReaderModule.tsx` so:

1. loading / error / blocked behavior remains functionally equivalent;
2. preview state creates a preview view model and renders through the layout registry;
3. ready state creates a ready view model and renders through the layout registry;
4. iframe mounting remains governed by existing desktop/mobile behavior;
5. actions such as `Open reader` and `Open full archive` still behave as they do today;
6. the registry selects by lane, not by generic tone only;
7. preview and production for the same lane share the same layout component and layout marker.

Do not remove preview fallback. Do not make preview and production structurally unrelated.

---

## Temporary Layout Compatibility Requirement

Because this prompt is not the full redesign, the initial lane layout components may reuse a shared internal compatibility component or shared primitives.

However:

- each lane must have a unique exported layout component;
- each lane must have its own layout marker;
- the registry must route to those unique components;
- `FoleonReaderPreview.tsx` must no longer be the sole layout authority for preview rendering;
- the architecture must make it straightforward for later prompts to replace only one lane layout at a time.

Acceptable temporary structure:

```text
layouts/
  FoleonReaderCompatibilityLayout.tsx
  ProjectSpotlightReaderLayout.tsx
  CompanyPulseReaderLayout.tsx
  LeadershipMessageReaderLayout.tsx
```

The compatibility component may reuse existing CSS classes to avoid visual churn, but lane wrappers must exist.

---

## CSS Requirements

Make only the CSS changes needed to support the new registry/view-model seam.

Allowed:

- add layout marker classes;
- add compatibility layout classes if needed;
- preserve existing visual output where practical;
- add minimal selectors for `data-foleon-reader-layout`.

Not allowed in this prompt:

- final edge-to-window visual behavior;
- major visual redesign of the three readers;
- removing all borders/chrome;
- changing homepage shell spacing;
- changing hero/entry-stack edge behavior.

Prompt 01 already established the shell/entry-stack edge contract. Do not duplicate or reimplement it here.

---

## Accessibility Requirements

Preserve or improve current accessibility:

- Maintain `aria-labelledby` relationships.
- Ensure preview labels are explicit and not visually deceptive.
- Preserve meaningful iframe `title`.
- Preserve mobile collapsed-reader semantics.
- Do not add non-semantic wrappers that obscure headings or actions.
- Do not remove visible affordances for opening archive or mobile reader.

---

## Required Tests

Add or update tests that prove:

1. each lane resolves to a unique layout component;
2. preview and production for the same lane share the same layout marker;
3. old shared preview component is no longer the only layout authority;
4. `ProjectSpotlightReader`, `CompanyPulseReader`, and `LeadershipMessageReader` still route through their correct config/lane;
5. loading behavior still works;
6. error behavior still works;
7. blocked behavior still works;
8. mobile ready-state lazy iframe behavior still works;
9. ready state preserves existing iframe host and callbacks;
10. preview state remains clearly labeled as preview/sample content;
11. no test relies only on tone color as the proof of lane differentiation.

If JSDOM cannot validate layout geometry, do not fake geometry assertions. Use DOM markers and component routing tests in this prompt. Actual visual/geometry proof belongs to later Playwright/hosted validation.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
```

The report must include:

```text
# Foleon Reader View Model and Layout Registry Report

## Scope

## Baseline Inputs
- 00_BASELINE_AUDIT.md
- 01_EDGE_CONTRACT_REPORT.md

## Source Files Changed

## Architecture Implemented

## View Model Fields

## Layout Registry

## Preview-to-Production Parity

## Behavior Preserved

## Tests Added / Updated

## Validation Commands and Results

## Package / Versioning Impact

## Known Follow-Up Work
- Prompt 03 Project Spotlight layout
- Prompt 04 Company Pulse layout
- Prompt 05 Leadership Message layout
- Prompt 06 testing/package/hosted proof

## Risks / Mitigations

## Rollback Plan
```

---

## Versioning / Package Authority

Before finalizing:

1. Inspect repo package/version authority for `@hbc/foleon-reader`, `hb-webparts`, and any generated package artifacts that consume the reader package.
2. If repo rules require a version bump for TypeScript/CSS changes, perform the required bump.
3. If package proof is required, run the repo-approved proof commands.
4. Do not claim package proof passed unless it actually ran and passed.
5. If broader lint/type/test failures exist outside this prompt’s changes, record them precisely in the report.

---

## Validation Plan

Use repo-approved commands after inspecting package scripts.

Minimum expected validation:

```text
pnpm --filter @hbc/foleon-reader test -- --runInBand
pnpm --filter @hbc/foleon-reader typecheck
pnpm --filter @hbc/foleon-reader lint
```

If `hb-webparts` depends on package build output or type exports affected by this refactor, also run the narrowest relevant `hb-webparts` type/test commands.

If actual script names differ, use the closest repo-approved scripts and document the exact commands used.

---

## Git / Commit Requirements

If source changes are made, produce a commit summary and description in this format:

```text
Summary:
HB Foleon Reader <version if applicable>: add shared view model and layout registry

Description:
Adds a normalized Foleon reader view model and lane-specific layout registry so preview and ready states route through the same lane-owned composition seam. Introduces unique Project Spotlight, Company Pulse, and Leadership Message layout components with stable layout markers while preserving existing loading, error, blocked, mobile iframe gating, telemetry, route, and origin-policy behavior. Documents validation and follow-up lane redesign work in 02_VIEW_MODEL_AND_REGISTRY_REPORT.md.
```

Do not commit unless the user separately asks you to commit.

---

## Hard Do-Nots

Do not:

- redesign the final Project Spotlight, Company Pulse, or Leadership Message layouts in this prompt;
- remove preview fallback;
- make preview and production use unrelated layouts;
- change Foleon iframe origin policy;
- change Foleon route behavior;
- change Foleon backend sync behavior;
- change SharePoint list schemas;
- change homepage shell pairing, row placement, or Prompt 01 edge-contract behavior;
- alter Safety Field Excellence, HB Kudos, or People & Culture;
- hard-code tenant-specific page widths;
- use global `overflow-x: hidden`;
- rely on color/tone alone as the proof of lane differentiation;
- claim validation passed unless it actually ran and passed.

---

## Final Response Required From Agent

When complete, respond with:

```text
Summary:
<one-line summary>

Description:
<commit-style description>

Files changed:
<list>

Validation:
<commands run and pass/fail result>

Version/package impact:
<state whether version/package changed and why>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md

Follow-up:
Prompt 03 should implement the Project Spotlight reader layout using the new registry seam.
```
