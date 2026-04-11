# Prompt 05 — Validation, Packaging, and Release Closure

You are working in the local live repo.

## Objective

Prove that the HB Kudos implementation is now in production mode and that the package/build/manifests are fresh and aligned with source.

## Required validation scope

You must validate all of the following:

### Build and code quality
- type-check
- lint
- relevant tests
- any targeted test additions required to prove the production mode change
- no new errors introduced

### Runtime wiring
- manifest ↔ component ↔ export ↔ mount wiring
- public webpart manifest
- companion webpart manifest
- any package-solution / build-pipeline versioning that must change
- no stale manifest descriptions that still describe dev-mode behavior as final

### Production behavior proof
Demonstrate with code-level proof that:
- `simulatedRole` is no longer the live production access path
- admin/reviewer access is resolved via the real production model
- companion reads/writes/timeline target the canonical list host site
- public Kudos remains hosted correctly on `HBCentral`
- unauthorized users fail closed in the companion
- governance actions cannot run without resolved capability
- public viewers do not see governance-only internals

### Packaging freshness
- rebuild the relevant package artifacts
- verify the resulting `.sppkg` or packaging output is fresh
- verify manifests / versions / descriptions are aligned
- verify no stale dev-mode defaults remain as the intended production configuration

## Required closure report

Produce a concise but explicit closure report that includes:

1. what dev-mode behaviors were removed
2. the final production role-resolution model
3. the final canonical list-host site model
4. any remaining limitations or prerequisites
5. exact build / lint / test / package results
6. exact files changed
7. whether the implementation is now ready for deployment

## Non-negotiable closure rules

- Do not claim production mode without proof.
- Do not leave unresolved site-host ambiguity.
- Do not leave unresolved role-resolution ambiguity.
- Do not leave stale manifest/property descriptions.
- Do not leave hidden prompt-era TODO behavior active in production paths.

## Deliverables for this prompt

- final validated code
- fresh packaging output
- production-closure report
- explicit statement of readiness or remaining blocker
