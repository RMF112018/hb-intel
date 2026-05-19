# Prompt 02 — Backend Contract and Resolver Implementation

## Objective

Implement the backend and shared-model foundation for Adobe Sign embedded action launch resolution.


General execution rules for the local code agent:

- Work from current repo truth only.
- Do not assume prior plans are current if code differs.
- Do not re-read files that are still within your current context or memory.
- Do not implement unsupported Adobe behavior.
- Do not create a custom signing UI.
- Do not proxy Adobe signing content.
- Preserve existing behavior when the embedded feature flag is disabled.
- Keep changes incremental, testable, and reversible.
- Provide concise commit summaries and validation evidence after each prompt.


## Required Work

1. Add shared launch DTOs in the appropriate `packages/models/src/myWork/` file.
2. Add a new backend route unless repo truth strongly favors evolving the existing route:
   - preferred route:
     ```text
     POST /api/my-work/me/adobe-sign/action-launch/resolve
     ```
3. Reuse the current actor normalization, token service, and Adobe signing URL retrieval patterns.
4. Add or extend launch policy evaluation:
   - validate URL,
   - require HTTPS,
   - require approved Adobe origin,
   - classify iframe eligibility,
   - preserve external fallback.
5. Add structured telemetry.
6. Preserve the existing external action-link route and behavior.

## Required Contract

Implement the equivalent of:

```ts
AdobeSignActionLaunchResult =
  | embedded-ready
  | external-ready
  | invalid-input
  | authorization-required
  | principal-unresolved
  | scope-insufficient
  | source-unavailable
  | not-ready
  | no-action-url
  | rate-limited
  | policy-rejected
  | embed-not-supported;
```

## Required Tests

Add tests for:

- embedded-ready,
- external-ready,
- invalid input,
- authorization required,
- insufficient scope,
- no action URL,
- provider malformed response,
- policy rejection,
- rate limit,
- source unavailable.

## Output

Provide:

- files changed,
- contract summary,
- route summary,
- test commands run,
- unresolved tenant-validation items.
