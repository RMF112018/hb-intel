# Hard Guardrails

Every implementation prompt must enforce these restrictions.

## Repo / Git

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not stage unrelated files.
- Do not commit without staged-file proof.
- Do not change `pnpm-lock.yaml` unless separately authorized.
- Do not change package manifests unless separately authorized.
- Do not change SPFx manifests.
- Do not change CI/workflows.
- Do not change deployment files.
- Do not perform production rollout.

## Runtime / External Systems

- No AHJ portal scraping.
- No AHJ API calls.
- No automated permit submission.
- No automated inspection scheduling.
- No automated AHJ status polling.
- No Procore API/runtime integration.
- No Microsoft Graph runtime integration.
- No SharePoint REST runtime operations.
- No PnP runtime operations.
- No Document Crunch runtime integration.
- No Adobe Sign runtime integration.
- No external-system writeback/sync/mirror.
- No evidence file upload.
- No evidence storage implementation.
- No evidence sync/mirror behavior.
- No backend write routes.
- No persistence writes.
- No direct approval execution.
- No workflow mutation.
- No tenant mutation.
- No SPFx packaging or deployment.

## Allowed Safe Scope

- Type-only model contracts.
- Deterministic fixtures.
- GET-only backend mock read models.
- Read-only envelopes.
- Fixture-first SPFx client/surface wiring.
- Explicit backend opt-in using existing PCC client pattern.
- Disabled/inert controls.
- Launcher/reference-only metadata.
- Signal metadata for Priority Actions, Project Readiness, and Approvals / Checkpoints.
