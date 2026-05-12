# Prompt 05 — B04 Cross-Layer Contract Validation and Error-Matrix Hardening

## 1. Objective

Harden the implementation across models, frontend client, and backend routes so the B04 contract is provably consistent end-to-end.

## 2. Why this work exists

B04’s value is not just individual files; it is the agreement between contracts, fixtures, frontend transport, and backend host semantics. This prompt closes drift risks before final validation.

## 3. Current repo-truth problem or gap

After Prompts 01–04, separate pieces may compile independently but still drift in subtle ways: route key mismatch, fallback envelope mismatch, query serialization drift, warning/status inconsistencies, or accidental platform-model overreach. Prompt 05 exists to catch and close those cross-layer issues.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

- Route IDs/paths must match across app and backend.
- `backend-unavailable` is a frontend safe-fallback state, not a normal successful live backend claim.
- Expected source/business degradation uses HTTP 200 envelopes.
- True malformed/auth/unhandled failures retain HTTP error semantics.
- No actor override route/query.
- My Work DTOs remain narrow BFF contracts, not `@hbc/my-work-feed` replacements.

## 5. Exact files, folders, docs, and symbols to inspect

Inspect outputs from Prompts 01–04 plus:
- `03_B04_Validation_And_Closeout_Requirements.md`
- `04_B04_Implementation_Gap_Register.md`
- any test suites added by prior prompts.

## 6. Required implementation outcome

Add or refine tests, comments, and helper normalization where required so B04 semantics are explicit and locked.

Do not broaden scope. This is a contract-hardening prompt, not a feature-expansion prompt.

## 7. Detailed change instructions

1. Verify route key/path agreement:
   - app route registry exactly matches backend route registration,
   - route response map uses the same route-key vocabulary,
   - no alternate slug exists.

2. Verify HTTP/source-state semantics:
   - route/provider expected business/source states return successful envelopes,
   - malformed queue input returns 400, not a degraded envelope,
   - route unhandled error returns 500,
   - frontend client collapses non-2xx/invalid body to `backend-unavailable`.

3. Verify warning/status alignment:
   - each degraded fixture has the required structured warning,
   - partial warning semantics are stable,
   - backend-unavailable fallback warning is consistent.

4. Verify query restrictions:
   - only `pageSize` and `cursor` are serialized,
   - no email/user/principal/actor query/path surface exists.

5. Verify auth transport:
   - backend client tests prove the bearer token callback is used,
   - routes remain `withAuth` protected.

6. Verify DTO purity:
   - My Work shared model files do not contain runtime client/provider/fetch/OAuth logic,
   - comments do not claim broad replacement of `@hbc/my-work-feed`.

7. Add tests or search-based guard tests only where the repo’s current practice supports them. Avoid brittle tests that inspect irrelevant formatting.

8. If a prior prompt left an implementation gap revealed by validation, fix it here, but do not add new features.

## 8. What done looks like

Done means:
- cross-layer contract agreement is tested,
- route/source/error semantics cannot drift silently,
- no actor override or raw-provider leakage appears,
- My Work DTO boundaries remain narrow and explicit.

## 9. Strict constraints / prohibitions

- Do not create new routes.
- Do not add UI cards.
- Do not implement live Adobe providers.
- Do not weaken existing validation to make tests pass.
- Do not silently change B04 literal contracts.

## 10. Validation requirements

Run the full applicable validation set:
```text
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If `apps/my-dashboard/` exists:
```text
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the My Dashboard package name differs, use the actual one and report it.

## 11. Proof of closure

Provide:
- the specific inconsistencies found and corrected, or state explicitly that none were found,
- a route/path agreement summary,
- a source-state/HTTP matrix confirmation,
- no-actor-override proof,
- validation outputs.

## 12. Commit / closeout expectations

Do not commit unless asked. Prepare the implementation for Prompt 06 closeout.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
