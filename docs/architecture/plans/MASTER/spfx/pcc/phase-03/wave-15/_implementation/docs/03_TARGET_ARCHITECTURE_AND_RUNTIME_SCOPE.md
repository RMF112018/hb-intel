# Target Architecture and Runtime Scope

## Objective

Implement the first runtime version of Wave 15 `External Systems Launch Pad` as a governed, mock/read-model-first, PCC-native project hub.

The implementation should make external-system access, mapping posture, source health, launch-link review state, audit visibility, and source lineage visible and testable without enabling live writeback or live external integrations.

## Feature Definition

`External Systems Launch Pad` provides:

- project-specific external-system launch links;
- system registry visibility;
- source-system mapping posture;
- source-health posture;
- mapping/review queues;
- custom project link draft/review state;
- audit/event visibility;
- HBI source-lineage explanation and refusal behavior;
- controlled handoff to Priority Actions, Project Readiness, and Wave 14 Approvals/Checkpoints.

## Architecture Principles

1. Launch first, integrate later.
2. PCC owns mappings, launch records, review records, audit records, and health snapshots.
3. Source systems own source records.
4. Project-specific records belong to project sites.
5. Global non-secret configuration belongs in HB Central.
6. No secrets in SharePoint, fixtures, SPFx, docs, logs, or URL payloads.
7. Custom links require PM/PX approval posture.
8. Iframe/current-image camera behavior remains future-gated.
9. Wave 14 owns approval/checkpoint semantics.
10. Priority Actions owns action rendering/dedupe, not External Systems source ownership.
11. HBI may summarize/cite/refuse; HBI may not approve/mutate/decide.

## Runtime Scope Authorized by This Package

Authorized:

- TypeScript shared models.
- Deterministic fixtures.
- Pure URL policy and state-mapping helpers.
- Mock/backend read-model provider extensions.
- GET-only read-model routes.
- SPFx read-model client/fallback parity.
- SPFx display surfaces and disabled future-command affordances.
- Safe launch-link display/open affordances only where no write, token, secret, iframe, or provider mutation is involved.
- Tests.
- Closeout docs where explicitly requested in the prompt.

Not authorized:

- POST/PATCH/DELETE command routes.
- SharePoint list creation/provisioning.
- SharePoint/Graph/PnP writes.
- External API calls to Procore/Sage/AHJ/camera providers.
- Sage posting or accounting updates.
- Procore writeback/sync/mirror.
- iframe/current-image rendering.
- public camera embed activation.
- secret storage.
- package/lockfile changes.
- SPFx manifest/Sppkg/version changes.
- tenant deployment.

## MVP UX Surface Set

Implement or scaffold these surface groups using the Wave 15 wireframes:

1. Launch Pad Home.
2. Project Launch Links.
3. Add/Edit Project Link Drawer.
4. Custom Link Review Queue.
5. External System Registry.
6. Mapping Source Health.
7. Mapping Review Detail.
8. Audit History.
9. HBI Source Lineage Panel.

## Expected User Experience

The user should be able to see:

- which systems are configured/missing/degraded;
- which project launch links are approved, pending, blocked, stale, archived, or unavailable;
- why a link is blocked or requires review;
- which mappings are stale, conflicted, missing, or confirmed;
- which review items need attention;
- which source-health issues affect confidence;
- which audit events have been captured in fixture/read-model form;
- which fields HBI can explain with citations and which requests HBI refuses.

The user should not be able to execute real changes in this package.

## Navigation / Placement

The existing PCC shell has an `external-systems` surface. Retain the route/surface identity and refactor the implementation behind it.

Do not create a new PCC module identity unless repo truth shows the existing surface cannot be reused. If a new file family is added under `src/surfaces/externalSystems`, preserve imports/export style used by neighboring surfaces.
