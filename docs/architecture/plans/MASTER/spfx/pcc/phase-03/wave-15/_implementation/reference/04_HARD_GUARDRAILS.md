# Hard Guardrails

These guardrails apply to every prompt in this package.

## Prohibited Runtime Behavior

- No command/write routes.
- No POST/PATCH/DELETE routes.
- No live SharePoint writes.
- No Graph/PnP writes.
- No tenant/list/group/security mutations.
- No Procore/Sage/AHJ/camera writeback.
- No sync/mirror behavior.
- No iframe/current-image embed behavior.
- No production deployment.
- No SPPKG packaging.
- No manifest/version bump.

## Prohibited Data Behavior

- No secrets in fixtures, docs, tests, logs, URLs, or SharePoint payload assumptions.
- No access tokens, refresh tokens, API keys, signed URLs, passwords, or SAS tokens.
- No tenant-production URLs in fixtures unless already present in approved repo fixture pattern.
- No user-owned drift staging.

## Prohibited Architecture Behavior

- Do not make PCC the source of truth for external records.
- Do not transfer Wave 14 approval/checkpoint ownership to External Systems.
- Do not transfer Project Readiness ownership to External Systems.
- Do not make HBI an authority or approver.
- Do not make Priority Actions the source record owner.
- Do not use Power Automate as an MVP runtime dependency.
- Do not add external SDKs or runtime dependencies.

## Stop for Guidance

Stop if any prohibited behavior appears necessary to satisfy a prompt.
