# Prompt 01 — Preflight B05 Runtime and Predecessor Foundations

You are Claude Code using Opus 4.7. Act as a precise repo-truth implementation auditor and code agent.

## Objective

Before writing B05 runtime code, inspect the live working tree and determine whether the B02, B03, and B04 implementation foundations required by B05 are present. Do not re-read files that are still within your current context or memory. Use targeted reads only.

## Governing inputs

Treat these documents as binding:
- canonical B05 dev-plan artifact,
- B04 read-model/routes/fixtures artifact,
- B03 shell/navigation artifact where module seams matter,
- B02 auth/runtime artifact,
- this B05 runtime implementation package.

## Required inspection lanes

1. Confirm whether `apps/my-dashboard/` exists and whether the app runtime/auth config from B02 is present.
2. Confirm whether the My Work shell/module seams from B03 are present where B05 later plugs in.
3. Confirm whether B04 My Work read-model models/routes/fixtures/client seams exist.
4. Confirm whether the backend My Work host exists under:
   ```text
   backend/functions/src/hosts/my-work-read-model/
   ```
5. Confirm current auth claim truth in:
   ```text
   backend/functions/src/middleware/validateToken.ts
   backend/functions/src/middleware/auth.ts
   ```

## Required output

Produce a structured verdict:

1. `PASS — B05 runtime implementation may proceed`
   or
   `BLOCKED — predecessor runtime foundation missing`
2. List concrete found files.
3. List concrete missing files/seams.
4. If blocked, identify which later B05 prompts may still proceed safely as interface-only/documentation-preserving work and which must not.
5. Do not create speculative scaffold files merely to make B05 appear executable.
6. Do not make any code edits in this prompt unless a tiny repo-truth correction is strictly necessary to make the preflight report accurate.

## Closeout

Return:
- branch / HEAD,
- findings,
- recommended next prompt,
- whether Prompt 02 can proceed.
