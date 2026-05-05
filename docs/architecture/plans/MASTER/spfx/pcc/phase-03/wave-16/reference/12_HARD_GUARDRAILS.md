# 12 — Hard Guardrails

## Scope Guardrails

- This package closes documentation/package gaps only unless explicitly used later as implementation input.
- No runtime code implementation unless a later prompt explicitly authorizes it.
- No production rollout.
- No tenant mutation.
- No source-system mutation.
- No package/lockfile/manifest/workflow changes unless separately authorized.

## Settings Guardrails

- GET-only read-model posture for initial Wave 16 implementation.
- Backend command/write routes are future-gated.
- SPFx must not write directly to settings SharePoint lists.
- SPFx must not call Graph/PnP/SharePoint REST for tenant/list/security mutation.
- Settings commands must be backend-mediated and approval-governed when future authorized.
- Wave 16 owns project-facing settings visibility and governance posture, not source-system records.

## Security Guardrails

- No raw secret values in any layer.
- No raw secrets in fixtures, tests, screenshots, logs, audit events, HBI output, or UI state.
- Secret references only.
- Redaction must be role-aware.
- Permission-sensitive rows must fail closed.

## HBI Guardrails

- HBI may explain, cite, summarize, and refuse.
- HBI must not approve, mutate, decide, bypass, waive, close, post, sync, mirror, submit, or execute.
- HBI must not provide legal/claim/accounting/pricing/award authority.
- HBI must not reveal protected values.

## Cross-System Guardrails

- No Procore writeback.
- No Sage integration or accounting posting.
- No Autodesk mutation.
- No Power Automate runtime dependency.
- No external-system sync/mirror.
- No evidence-binary ownership by Wave 16.

## Documentation Guardrails

- Do not rewrite unrelated wave doctrine.
- Do not update canonical plan docs unless explicitly authorized.
- Do not broaden formatting.
- Preserve repo-truth citations/anchors in closeout docs.
