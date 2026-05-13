# Prompt 06 — Implement Source Handoff Policy and Module Seams

You are Claude Code using Opus 4.7. Implement the B05 source-handoff safety posture. Do not re-read files that are still within your current context or memory.

## Objective

Ensure Adobe queue/source handoff behavior remains truthful, optional, and backend-validated.

## Binding decisions

- Row-level `sourceOpenUrl` is optional.
- SPFx must not guess Adobe URLs.
- Signing URL endpoints are not the default row-level “Open in Adobe Sign” contract.
- General module-level Adobe launch may exist only if backend-derived and policy-approved.
- URL policy must mirror/reuse the established HB/PCC URL-policy doctrine.

## Implementation lanes

### URL policy adapter
Implement or adapt a policy evaluator for Adobe handoff URLs that enforces:
- HTTPS only,
- no local/private hosts,
- no credential-like query parameter names,
- approved host rules where applicable,
- structured reason codes,
- no thrown parser failures.

### Provider integration
Ensure the Adobe adapter:
- includes `sourceOpenUrl` only when allowed,
- omits the URL safely otherwise,
- emits governed warning/reason code where the B04/B05 warning model supports it.

### Frontend/module seam
If B03/B04 UI/module files are present, ensure:
- row CTA appears only when `sourceOpenUrl` exists,
- absent URL does not render a broken button/link,
- any module-level general launch is clearly separate from row-level action.

If those UI files are not present, document the exact seam for the later UI prompt rather than inventing false placeholders.

## Tests

- URL allowed case,
- HTTP URL blocked,
- localhost/private host blocked,
- credential-like query param blocked,
- unknown/non-approved host blocked when policy is configured,
- item remains renderable when URL omitted,
- no source URL synthesized in frontend.

## Closeout

Return:
- handoff policy files,
- UI/module seams touched or intentionally deferred,
- tests run,
- whether Prompt 07 may proceed.
