# 09 — Testing, Validation, and Release Proof

## Test layers

### Backend unit tests

- role gate allows/denies correctly;
- config validation fails closed;
- content validation rules;
- placement validation rules;
- Graph mapper field names;
- eTag conflict handling;
- Foleon API client token handling mocked;
- SyncRuns writer.

### Backend integration tests

- unauthorized route returns 401/403;
- editor can create draft content;
- publisher can publish;
- viewer cannot mutate;
- operator can run sync;
- admin can validate/provision.

### Frontend unit tests

- shell state;
- role-aware navigation;
- content list and filters;
- editor form validation;
- validation checklist rendering;
- dirty-state handling;
- conflict-state handling;
- placement board logic;
- responsive mode helpers.

### E2E tests

- login as viewer/editor/publisher/operator/admin test users;
- create content draft;
- validate content;
- publish content;
- create placement;
- force blocked validation case;
- sync Docs mocked route;
- view SyncRuns.

## Hosted SharePoint proof

Capture evidence for:

- connector loads in SharePoint-hosted page;
- no console errors;
- runtime config present and redacted;
- role-gated actions hidden/blocked correctly;
- backend calls reach correct Functions app;
- SharePoint lists are updated through backend, not direct UI editing;
- display app reflects published content and placement.

## Design doctrine audit

Use:

- `homepage-uiux-audit-checklist.md`
- `homepage-uiux-audit-scorecard.md`
- governing UI doctrine
- benchmark material under `docs/reference/spfx-surfaces/benchmark/**`

Score categories 0–4.

Minimum acceptance:

- no category below 2 without documented exception;
- no critical accessibility failure;
- no generic enterprise-card dominant outcome;
- no unresolved host-fit instability;
- no dead primary path.

Target acceptance:

- 40+/56 for homepage-grade / premium SPFx acceptance;
- 48+/56 for benchmark-grade if this becomes a flagship surface.

## Breakpoint evidence

Capture screenshots or Playwright traces at:

- ultrawide desktop;
- standard desktop/laptop;
- tablet landscape;
- tablet portrait;
- phone portrait;
- phone landscape/short height;
- high zoom / constrained browser window.

## Accessibility proof

Validate:

- keyboard-only content creation;
- keyboard-only publish flow;
- keyboard-only placement flow;
- visible focus;
- dialog/panel focus trap and return;
- form labels and errors;
- contrast;
- reduced motion.

## Package truth proof

For SPFx package:

- manifest exists adjacent to webpart;
- package contains expected bundle;
- package contains expected manifest ID;
- package version matches runtime version;
- package does not reintroduce broken Feature Framework list `CustomSchema` assets unless explicitly proven safe.

## Backend release proof

Capture:

- deployed Functions artifact hash;
- route list;
- environment validation output;
- readiness endpoint output with secrets redacted;
- role-matrix results;
- Graph permission posture;
- Foleon config presence;
- SyncRuns write proof.

## Acceptance checklist

- [ ] Selected users can manage content in connector.
- [ ] Users do not need direct SharePoint list editing.
- [ ] Backend enforces roles.
- [ ] Foleon secrets are backend-only.
- [ ] All SharePoint writes go through backend.
- [ ] eTag conflicts are handled.
- [ ] Invalid content cannot be published.
- [ ] Invalid placements cannot be saved active.
- [ ] SyncRuns records are written.
- [ ] UI passes doctrine audit.
- [ ] Hosted proof captured.
