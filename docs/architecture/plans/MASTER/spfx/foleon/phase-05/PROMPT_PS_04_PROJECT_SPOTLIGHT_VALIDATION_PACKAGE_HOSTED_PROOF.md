# PROMPT PS-04 — Project Spotlight Validation, Package Proof, and Hosted Proof

You are working in the `RMF112018/hb-intel` repository. Use current `main` plus the completed Project Spotlight implementation branch/commit as repo truth.

## Objective

Validate the Project Spotlight visual-first implementation end-to-end: source truth, tests, accessibility, responsive/no-overflow behavior, full-window viewer behavior, package/version authority, and hosted SharePoint proof.

## Critical Instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.

## Source Files to Inspect

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
```

Inspect all package/version authority files changed by the implementation.

## Validation Requirements

### 1. Source validation

Confirm:

- Project Spotlight no longer renders primary `reader` language.
- `Preview layout` is not visible in primary UI.
- metadata ribbon is removed or demoted from employee UI.
- hero media uses record-backed `heroImageUrl`/`thumbnailUrl`.
- ready state does not fabricate gallery/video/team/client.
- preview visual placeholders are clearly preview/sample.
- full-window viewer remains the only Project Spotlight iframe path.
- no raw iframe was added.
- no accepted-origin/governance logic was changed.

### 2. Test validation

Run:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If package authority tests exist, run them.

If blocked:

- state exact blocker;
- state which commands did run;
- do not overclaim.

### 3. Accessibility validation

Verify:

- one interactive launch control in card;
- visible CTA;
- keyboard activation opens viewer;
- disabled state has `aria-disabled`, visible reason, and `aria-describedby`;
- focus returns after viewer close;
- Escape closes viewer;
- images have valid alt handling;
- preview decorative visuals are not noisy to assistive tech;
- link/button purpose is descriptive.

### 4. Responsive/no-overflow validation

Browser-proof these viewport classes:

```text
Desktop wide
Desktop constrained
Tablet
Mobile
```

Verify:

- no right-edge overflow;
- no horizontal scroll caused by Project Spotlight;
- paired row layout remains stable with HB Kudos;
- mobile stack bleeds/aligns to shell rules;
- no global overflow suppression used to hide layout problems.

### 5. Full-window viewer validation

Verify:

- preview does not open fake viewer;
- ready enabled opens viewer;
- viewer uses `FoleonIframeHost`;
- viewer iframe title is descriptive;
- close button works;
- Escape works;
- focus returns;
- blocked embed states show employee-facing disabled reason.

### 6. Package proof

If packaging is required:

- validate version lockstep;
- build/package with the repo-required Node/SPFx version;
- produce `.sppkg`;
- capture package path and version;
- capture manifest/package evidence;
- document tenant/app catalog upload steps if performed.

### 7. Hosted SharePoint proof

On hosted page, verify:

- Project Spotlight visual-first layout is visible.
- Title/copy are employee-facing.
- Preview is honest.
- No old primary strings remain.
- Image/media behavior is correct.
- Viewer opens only when it should.
- No layout spillover into HB Kudos or row boundaries.

## Required Closure Report

Return:

```text
Summary:
Source proof:
Tests:
Accessibility proof:
Responsive/no-overflow proof:
Viewer proof:
Package/version proof:
Hosted proof:
Remaining risks:
Rollback plan:
Commit:
```

## Commit Target

```text
Project Spotlight visual showcase: validation and package proof
```
