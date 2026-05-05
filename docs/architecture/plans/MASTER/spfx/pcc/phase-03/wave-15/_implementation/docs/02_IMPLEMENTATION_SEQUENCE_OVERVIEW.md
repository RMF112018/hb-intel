# Implementation Sequence Overview

## Strategy

Build Wave 15 progressively from stable shared contracts to read-model infrastructure, then SPFx UX, then integration seams, then tests/closeout.

The first implementation pass remains mock/read-model-first. It should make the Launch Pad usable and testable without live external integrations, tenant mutations, list provisioning, or command endpoints.

## Sequence

### Prompt 01 — Readiness Audit

Read-only audit. Confirm local branch, HEAD, worktree, lockfile, docs/artifacts, existing runtime posture, package scripts, and implementation gaps.

### Prompt 02 — Shared Models / Fixtures / Domain Contracts

Implement shared model contracts for the Wave 15 domain. Add fixtures and pure helpers only. No backend routes, SPFx UI, Graph/PnP/Procore/Sage clients, command handlers, or writes.

Primary outputs:

- Wave 15 model types/enums.
- Launch type and system registry contracts.
- URL policy result types and pure validator helper.
- Project launch-link, mapping, reference, review, health, audit, HBI lineage read-model contracts.
- Deterministic fixtures.
- Unit tests.

### Prompt 03 — Backend GET-Only Mock Read-Model Family

Extend the backend mock provider and GET-only route family for Wave 15. No command endpoints.

Primary outputs:

- `getExternalSystemsLaunchPad` or equivalent composite read model.
- Additional narrow read models as needed for registry, launch links, review queue, mapping health, audit, lineage.
- GET-only routes under `/api/pcc/projects/{projectId}/...`.
- Backend route/provider tests.

### Prompt 04 — SPFx Read-Model Client / Fixture Parity

Extend the SPFx read-model client interfaces, route registry, backend client, and fixture client.

Primary outputs:

- SPFx typed client methods.
- Fixture fallback parity.
- Backend-failure safe envelopes.
- Tests confirming no viewer persona serialization except allowed query `q` behavior for existing unified search.
- No runtime UI changes beyond client exports.

### Prompt 05 — Launch Pad Surface Shell

Refactor the External Systems surface into the Wave 15 Launch Pad shell using read-model data with safe fixture fallback.

Primary outputs:

- Launch Pad home.
- Project launch links list/cards.
- Status/degraded/empty/blocked states.
- No enabled write buttons.
- Open-approved-link affordances only if URL policy allows and implementation remains safe.

### Prompt 06 — Project Link Drawer / Review Queue / URL Policy UX

Implement drawer/review queue states from wireframes 03 and 04.

Primary outputs:

- Add/edit drawer shell as future-command intent only.
- Validation preview from pure URL policy helper.
- Review queue rendering.
- Role-aware visibility using read-model role/action matrix, not runtime authorization.
- No actual submit/approve/reject/archive writes.

### Prompt 07 — Registry / Mapping / Health / Audit / HBI Lineage

Implement registry, mapping source health, mapping review detail, audit history, and HBI lineage panel surfaces.

Primary outputs:

- Registry view.
- Mapping/source health view.
- Mapping review detail view.
- Audit history timeline/table.
- HBI lineage panel with refusal/unavailable/citation-ready states.
- Accessibility and responsive behavior.

### Prompt 08 — Project Home / Priority Actions / Readiness / Wave 14 / HBI Seams

Implement additive integration seams without transferring ownership.

Primary outputs:

- Project Home summary/card slot if appropriate.
- Priority Action candidates for stale mapping, blocked link, pending custom-link review, admin verification, source health degradation.
- Project Readiness blocker/reference rows for relevant Launch Pad conditions.
- Wave 14 handoff references for mapping corrections/checkpoint-required decisions.
- HBI no-authority preservation.

### Prompt 09 — Tests / Guardrails / Closeout

Run final targeted validations. Add closeout docs if authorized in prompt scope. Verify no hard guardrails breached.

### Prompt 10 — Fresh Reviewer

Independent reviewer prompt for a fresh session. No implementation unless separately authorized.

## Dependency Rules

- Do not add external SDKs.
- Do not add runtime dependencies without explicit approval.
- Use existing React, model, SPFx app, and test stack.
- `zod` already exists in `@hbc/models`; use it only if consistent with existing package patterns and no new dependency is required.
- TanStack/XState/AJV are research candidates only. Do not install them in this package.

## Commit Structure

Recommended commits:

```text
chore/spfx-pcc or feat(spfx-pcc): wave 15 external systems shared contracts
feat(spfx-pcc): wave 15 external systems mock read models
feat(spfx-pcc): wave 15 external systems read-model client parity
feat(spfx-pcc): wave 15 external systems launch pad shell
feat(spfx-pcc): wave 15 external systems link workflow states
feat(spfx-pcc): wave 15 external systems registry health audit lineage
feat(spfx-pcc): wave 15 external systems integration seams
docs/test(spfx-pcc): close wave 15 external systems implementation
```

Use the repo's preferred commit summary/description style if present in current context.
