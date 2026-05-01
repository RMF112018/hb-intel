# 02 — Implementation Roadmap

## Objective

Implement the remaining Phase 3 / Wave 7 **HB Document Control Center** work in safe, reviewable slices.

The first priority is not visual polish. The first priority is to align the SPFx consumer layer with the Wave 7 read-model contract already represented in the backend mock provider.

## Non-Negotiable Sequence

Do not start with UI-only rendering from the current legacy `sources` sample.

The required sequence is:

1. **03A — SPFx Document Control Read-Model Parity**
2. **03B — SPFx Three-Lane UI**
3. **04 — Permission / Action Rendering**
4. **05 — Source / Degraded States**
5. **06 — Reviews & Approvals Summary**
6. **07 — Closeout / Validation**
7. **08 — Reviewer Audit**

## Why 03A Comes First

Current repo truth shows:

- Backend mock provider returns additive Wave 7 document-control fields.
- SPFx fixture client still returns only legacy `sources`.
- Documents surface still renders the legacy two-lane preview.

If the UI is updated before the SPFx read-model fixture parity is corrected, the surface will either:

- hard-code Wave 7 data locally, creating another taxonomy source; or
- render a partial legacy model under a Wave 7 label.

Both outcomes are unacceptable.

## Implementation Slice 03A — SPFx Document Control Read-Model Parity

Primary goal:

- Bring `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` into parity with backend mock provider `getDocumentControl()` for additive Wave 7 fields.

Allowed files:

```text
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Possible supporting files only if required by tests/types:

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/DocumentControl.ts
```

Expected output:

- `getDocumentControl()` returns:
  - legacy `sources`
  - `wave7LaneVocabulary`
  - `sourceRegistry`
  - `sourceHealth`
  - `sourceHealthStates`
  - `reviewStates`
  - `reviewTypes`
  - `hardNoRules`
  - `roleActionAvailability`
  - `actionCatalog`
  - `reviewQueueSample`
- Tests confirm:
  - Project Coordinator present
  - Project Engineer absent
  - no root `My Project Files` exposure
  - no other-project folder exposure
  - `EX04` not available
  - legacy compatibility preserved

## Implementation Slice 03B — SPFx Three-Lane UI

Primary goal:

- Update `apps/project-control-center/src/surfaces/documents/` to render the HB Document Control Center three-lane shell from Wave 7 read-model fields.

Allowed files:

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
```

Possible supporting files only if following existing surface patterns:

```text
apps/project-control-center/src/surfaces/documents/useDocumentControlReadModel.ts
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/DocumentControlReadModelContent.tsx
```

Expected output:

- Header names **HB Document Control Center**.
- Three lanes render:
  - Project Record
  - My Project Files
  - External Systems
- My Project Files warning renders:
  - Files in My Project Files are working files for this project. They are not part of the formal project record unless submitted to Project Record.
- No root OneDrive folder or other-project folders render.
- No live file actions.
- No live external launch.
- Existing bento/grid direct-child invariants preserved.

## Implementation Slice 04 — Permission / Action Rendering

Primary goal:

- Render role/action availability and hard-no guardrails from read-model fields.

Expected output:

- R01–R23 vocabulary represented where available.
- PR/MP/SB/EX/WF action families represented.
- `EX04` shown as unavailable/forbidden.
- Project Coordinator included.
- Project Engineer not introduced.
- UI does not enforce real authorization; it only renders read-model guardrails.

## Implementation Slice 05 — Source / Degraded States

Primary goal:

- Render safe user-facing source states.

Expected states:

- missing-config
- access-issue
- source-unavailable
- throttled
- partial-results
- pending-initialization
- folder-creation-failed
- disabled
- empty

Expected output:

- Safe messages.
- No raw Graph/API errors.
- No live repair actions.

## Implementation Slice 06 — Reviews & Approvals Summary

Primary goal:

- Render review metadata and review queue summary.

Expected output:

- Review types and states render from read model.
- Assigned review, returned/rejected/approved states are represented where available.
- No live approval execution.
- No workflow mutation.

## Implementation Slice 07 — Closeout / Validation

Primary goal:

- Create/update closeout docs and run validation.

Expected output:

- Files changed.
- Tests run.
- Type checks.
- Lockfile checksum.
- Explicit exclusions.
- Recommended next prompt.

## Later Gated Work

The following remain out of scope until separately authorized:

- live Microsoft Graph file listing;
- live upload/download/copy-link;
- OneDrive folder creation runtime;
- project document search using Graph/Microsoft Search;
- SharePoint permissions listing;
- Procore API runtime;
- Adobe Sign agreement execution;
- Document Crunch API runtime;
- tenant mutation;
- SPFx packaging/deployment.

## Recommended Commit Sequence

### 03A

```text
feat(pcc): align document-control fixture read model with wave 7
```

### 03B

```text
feat(pcc): render document control three-lane shell
```

### 04

```text
feat(pcc): render document control action guardrails
```

### 05

```text
feat(pcc): add document control source state rendering
```

### 06

```text
feat(pcc): add document control review summary
```

### 07

```text
docs(pcc): close phase 3 wave 7 document control implementation
```
