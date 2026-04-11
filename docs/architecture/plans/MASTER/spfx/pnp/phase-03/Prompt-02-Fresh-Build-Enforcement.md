# Prompt 02 — Fresh Build Enforcement

## Objective

Implement hard protections so current `hb-webparts` source always produces the bundled assets that enter the shipped `.sppkg`, and stale `dist` reuse cannot silently package old app code.

## Prompt

```text
You are now implementing build/package freshness protections for the PnP Operations / hb-webparts SPFx pipeline.

Primary paths:
- `tools/build-spfx-package.ts`
- any directly related build helper files/scripts
- only touch app/package config files if required by the fix

Important working rule:
- Do not re-read files that are still within your active context or memory window unless needed for precision.

Primary problem to solve:
The current packaging flow must not be able to reuse stale `apps/hb-webparts/dist` output and then ship an `.sppkg` whose bundled app code does not reflect current source.

Your job:
1. Audit the current freshness gate in `tools/build-spfx-package.ts`
2. Replace or harden it so `hb-webparts` packaging proves it is using a fresh build from current source
3. Remove any logic that allows “dist exists, so skip build” behavior to masquerade as package freshness
4. Ensure any cache-busting/content-hash logic still works after the fix
5. Ensure the final packaged asset set is derived from the current build output, not prior residue
6. Preserve good behavior for other domains unless a broader cross-domain correction is clearly the right long-term fix

Implementation expectations:
- Prefer deterministic freshness over fast-but-ambiguous reuse
- If you keep any optimization, it must be source-aware and prove currentness
- If deletion/cleaning is required, do it intentionally and explain why
- If domain-specific behavior is the wrong architecture, refactor toward a cleaner shared rule

Required outputs:
1. Code changes
2. A concise implementation note at:
   - `docs/architecture/reviews/pnp-ops-fresh-build-enforcement.md`

That note must include:
- The prior failure mode
- The exact fix implemented
- Why the new logic is safer
- Any tradeoffs introduced
- How to prove the fix works

Validation required in this task:
- Run the relevant packaging flow for `hb-webparts`
- Confirm a fresh `.sppkg` is produced
- Capture enough evidence in the implementation note to show the build really used current source

Do not leave this at a conceptual level. Implement the actual enforcement.
```
