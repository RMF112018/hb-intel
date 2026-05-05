# SPFx UX Implementation Blueprint

## Existing Surface to Refactor

Start with:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemTile.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.module.css
apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx
```

Retain existing route/surface identity unless repo truth requires otherwise.

## Recommended File Additions

Add focused components under `apps/project-control-center/src/surfaces/externalSystems/`:

```text
PccExternalSystemsLaunchPad.tsx
PccExternalSystemsLaunchPadHeaderCard.tsx
PccExternalSystemsSummaryBand.tsx
PccExternalSystemsProjectLinksPanel.tsx
PccExternalSystemsProjectLinkCard.tsx
PccExternalSystemsAddEditLinkDrawer.tsx
PccExternalSystemsReviewQueue.tsx
PccExternalSystemsRegistryPanel.tsx
PccExternalSystemsMappingHealthPanel.tsx
PccExternalSystemsMappingReviewDetail.tsx
PccExternalSystemsAuditHistory.tsx
PccExternalSystemsHbiLineagePanel.tsx
PccExternalSystemsPolicyMessage.tsx
PccExternalSystemsStateMessage.tsx
externalSystemsAdapter.ts
externalSystemsViewModel.ts
useExternalSystemsReadModel.ts
```

Use fewer files if repo style prefers tighter grouping, but do not collapse unrelated logic into a single large component.

## UX Mapping to Wireframes

### Wireframe 01 — Launch Pad Home

Implement:

- header card with project context;
- system-status summary;
- quick launch group;
- review/action queue summary;
- degraded/missing state callouts;
- HBI explanation entry point;
- no live write controls.

### Wireframe 02 — Project Launch Links

Implement:

- grouped links by system/category/link type;
- approved/pending/blocked/stale/archived states;
- disabled reasons;
- open-in-new-tab indicator;
- URL policy warning caption;
- empty and unauthorized states.

### Wireframe 03 — Add/Edit Project Link Drawer

Implement as future-command intent only:

- drawer shell;
- controlled fields backed by local component state;
- URL policy preview;
- validation summary;
- disabled submit/save buttons with reason captions unless prompt explicitly authorizes active future-intent buttons that do not persist;
- focus trap and return focus.

### Wireframe 04 — Custom Link Review Queue

Implement:

- submitted/rejected/blocked/stale rows;
- reviewer/owner labels;
- no actual approve/reject/archive execution;
- link to drawer/detail in read-only mode;
- role-aware disabled actions.

### Wireframe 05 — External System Registry

Implement:

- active/inactive systems;
- system category;
- posture;
- allowed link types;
- approved domains;
- owner/support labels;
- missing/unavailable state.

### Wireframe 06 — Mapping Source Health

Implement:

- mapping state counts;
- source-health severity;
- stale/conflict rows;
- recommended action labels;
- review item cross-reference.

### Wireframe 07 — Mapping Review Detail

Implement:

- selected review detail panel or inline card;
- mapping source object context;
- ownership and due-date indicators;
- checkpoint/approval handoff marker where applicable;
- no mutation.

### Wireframe 08 — Audit History

Implement:

- table/timeline hybrid;
- event type;
- actor;
- timestamp;
- subject;
- correlation ID;
- redacted metadata handling;
- loading/empty/unauthorized/unavailable states.

### Wireframe 09 — HBI Source Lineage Panel

Implement:

- context object title;
- field-lineage rows;
- citation labels;
- confidence/freshness;
- refusal/unavailable state;
- no HBI mutation or authority.

## Accessibility Requirements

- Drawer/panel focus moves inside on open.
- `Escape` closes drawer/panel.
- Focus returns to triggering control on close.
- `Tab` and `Shift+Tab` do not escape modal drawer/panel while open.
- Disabled actions must expose visible reason text and accessible labels.
- Error summaries must be linked to fields.
- Tables/lists must have semantic labels.
- Status changes should be announced with appropriate live-region treatment where existing repo patterns support it.

## Responsive Requirements

- Desktop: bento/card layout, side drawer/panel.
- Tablet: wider overlay panel, collapsible sections.
- Mobile/narrow: full-screen modal sheet and single-column cards.
- Do not introduce horizontal overflow.
- Preserve existing PCC shell/grid direct-child invariants.

## Styling Requirements

- Use existing PCC card, state, pill, and layout primitives where possible.
- Do not create a feature-local visual doctrine.
- Preserve light/dark theme compatibility.
- Avoid dense admin-table-only UI; combine summary cards, status chips, and tables only where tables are useful.

## Interaction Rules

Allowed interactions:

- expand/collapse details;
- filter/sort local fixture/read-model rows;
- open drawer/panel in read-only or local-only preview mode;
- open safe approved external launch URL in a new tab if URL policy returns allowed and no secret-like query exists.

Forbidden interactions:

- save draft to SharePoint;
- submit review item;
- approve/reject/archive links;
- create admin verification request;
- confirm mapping;
- call external provider APIs;
- iframe/embed camera current image;
- bypass role/redaction constraints.

## Component Testing Requirements

- sourceStatus mapping to preview/degraded states;
- allowed/blocked URL policy display;
- drawer focus and Escape behavior where feasible in jsdom;
- role/action disabled captions;
- HBI refusal rendering;
- audit metadata redaction;
- no `<iframe>` rendered;
- no direct Procore/Sage/Graph/PnP imports;
- bento/card direct-child invariant if existing tests assert it.
