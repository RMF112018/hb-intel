# Recommended Implementation Plan

## Objective

Replace the cookie-cutter Foleon reader presentation with lane-specific composition while preserving preview fallback, production iframe governance, shell placement contracts, accessibility, and no-overflow requirements.

## Recommended Architecture

Use the Hybrid Layout Registry.

```ts
export const FOLEON_READER_LAYOUTS = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
} as const;
```

## Component Hierarchy

Recommended structure:

```text
packages/foleon-reader/src/readers/
  FoleonReaderModule.tsx
  FoleonReaderViewModel.ts
  FoleonReaderLayoutRegistry.tsx
  layouts/
    ProjectSpotlightReaderLayout.tsx
    CompanyPulseReaderLayout.tsx
    LeadershipMessageReaderLayout.tsx
    FoleonReaderLayoutShared.tsx
    FoleonReaderLayouts.module.css
```

`FoleonReaderModule` continues to own:

- runtime resolution;
- loading/error/blocked states;
- iframe governance;
- mobile reader open behavior;
- telemetry callback wiring.

The new layout components own:

- composition;
- lane-specific visual hierarchy;
- preview/production layout parity;
- edge-bleed surface classing;
- internal safe-area structure.

## Data Model / View Model

Create a shared adapter:

```ts
function toFoleonReaderViewModel(input: {
  config: FoleonReaderModuleConfig;
  tone: FoleonReaderTone;
  resolution: PreviewOrReadyResolution;
  isMobile: boolean;
  readerOpen: boolean;
}): FoleonReaderViewModel
```

Preview should not be a separate layout. It should be a different view-model state consumed by the same lane-specific layout.

## CSS Architecture

Recommended CSS layers:

1. `FoleonReaderLayouts.module.css`
   - common layout tokens;
   - surface/safe-area classes;
   - edge-bleed response classes;
   - preview badge classes;
   - shared accessibility utilities.

2. Lane-specific class groups:
   - `.spotlightSurface`
   - `.pulseSurface`
   - `.leadershipSurface`
   - `.spotlightMediaPanel`
   - `.pulseBriefingGrid`
   - `.leadershipLetter`

3. Deprecated/legacy classes retained only during migration:
   - `.readerPreviewFallback`
   - `.previewSupportCard`
   - `.previewFeature`

Remove old cookie-cutter markers only after tests confirm the new components are active.

## Shell Data Attribute Requirements

Modify `HbHomepageShell.tsx` / shell resolver support to emit:

- `data-shell-band-layout`
- `data-shell-slot-visual-side`
- `data-shell-slot-edge-bleed`

Do not remove existing attributes.

## Container Query Approach

- Keep `HbHomepageShell.module.css` as the shell’s breakpoint/slot owner.
- Use container queries inside reader layout components for internal adjustments.
- Do not use hard-coded browser viewport widths to make slot-internal decisions.

## Edge-Bleed Implementation

Use the shell attributes and shell inset variables:

- left visual side: bleed left only.
- right visual side: bleed right only.
- stacked/full: bleed both sides.

Only apply to:

- `project-portfolio-spotlight`
- `company-pulse`
- `leadership-message`

unless a future pass adds hero or other zones.

## Accessibility Requirements

- Each reader keeps a meaningful `section` label.
- Preview states remain clearly identified.
- Do not rely on color alone to identify preview status.
- Maintain heading order.
- Keep iframe title descriptive.
- Preserve keyboard tab order according to DOM.
- Keep focus outlines inside visible safe areas.
- Respect `prefers-reduced-motion`.

## Testing Strategy

### Unit / Component Tests

Required tests:

- Project Spotlight resolves to `ProjectSpotlightReaderLayout`.
- Company Pulse resolves to `CompanyPulseReaderLayout`.
- Leadership Message resolves to `LeadershipMessageReaderLayout`.
- Preview and production use the same layout marker for each lane.
- Project Spotlight no longer renders the same three support-card structure as Company Pulse.
- Leadership Message does not render as a generic media feature card.
- Deprecated preview markers are absent or contained only in legacy fallback tests.

### Shell Contract Tests

Required tests:

- left-dominant major slot resolves `visual-side=left`.
- left-dominant minor slot resolves `visual-side=right`.
- right-dominant major slot resolves `visual-side=right`.
- right-dominant minor slot resolves `visual-side=left`.
- stacked layout resolves `visual-side=full` and `edge-bleed=both`.

### Browser / Playwright Tests

Required tests:

- no horizontal overflow in paired Row 1, Row 2, Row 3;
- no horizontal overflow in stacked states;
- Company Pulse right bleed uses actual visual right side;
- focus outlines remain visible;
- mobile stacked bleed reaches both sides while maintaining safe content padding.

## Package / Versioning Impact

Expected packages:

- `@hbc/foleon-reader`
- `hb-intel-homepage.sppkg`

Version bump required after implementation. The exact package version should follow current repo authority and not be guessed from this document.

## Rollout Plan

1. Execute Prompt 00: baseline audit.
2. Execute Prompt 01: shell edge-to-window contract.
3. Execute Prompt 02: shared view model and layout registry.
4. Execute Prompt 03: Project Spotlight layout.
5. Execute Prompt 04: Company Pulse layout.
6. Execute Prompt 05: Leadership Message layout.
7. Execute Prompt 06: tests/package/hosted proof.
8. Execute Prompt 07: closure audit.

## Backward Compatibility

Preserve:

- existing Foleon routes;
- iframe governance;
- content resolver behavior;
- SharePoint list schemas;
- homepage slot placement;
- fallback states;
- telemetry boundaries.

## Rollback Plan

- Keep the old preview module until the new layout registry is verified.
- Feature-flag lane-specific layouts if the repo already has a suitable feature flag system.
- If edge-to-window creates overflow, disable only the edge-bleed data attribute path and retain new compositions inside standard shell padding.
- Do not rollback Foleon iframe gating or list configuration.
