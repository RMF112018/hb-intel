# Wave 06 — Packaging, Validation, and SharePoint Proof for CompanyPulse

## Objective

Complete the remaining work by proving that the premium `CompanyPulse` newsroom implementation survives:
- compile
- build
- package generation
- SharePoint-hosted deployment expectations

This wave is not complete until the structural design intent is preserved into the cumulative `hb-webparts.sppkg`.

---

## Critical operating instructions

- Work from **repo truth** in the live repo.
- Do **not** re-read files already in your active context or memory unless needed to verify drift, build output, or resolve uncertainty.
- Keep this wave focused on validation, package generation, and proof.
- Do **not** reopen earlier design decisions unless a packaging or runtime failure forces a narrowly scoped correction.
- Do **not** report success based only on local component rendering.

---

## Primary target scope

- `apps/hb-webparts/src/webparts/companyPulse/*`
- any directly affected shared newsroom/ui files changed in Waves 04–05
- `hb-webparts` build/package output
- packaging/build scripts only if validation requires them

---

## Required validation sequence

### 1. Type and lint validation
Run the correct repo-truth commands for the webparts package:
- typecheck
- lint
- tests if applicable

Capture any failures precisely.
If there are failures, resolve only the issues necessary to complete the wave coherently.

### 2. Build validation
Run the correct clean build path for `hb-webparts`.

Do not rely on stale output.
Ensure the build reflects the actual current `CompanyPulse` implementation.

### 3. Packaging validation
Produce a fresh `hb-webparts.sppkg`.

The package must include the updated `CompanyPulse` implementation and preserve the intended manifest/render contract.

### 4. Structural intent validation
Confirm that the packaged result still reflects:
- premium newsroom hierarchy
- lead/secondary/tertiary structure
- premium surface behavior
- author-safe rendering posture

This wave is not only about “package exists.”
It is about ensuring that the packaged result still represents the design objective.

### 5. Runtime realism validation
If local or documented validation paths exist for confirming expected SharePoint-hosted behavior, use them.

At minimum, confirm that nothing in the packaging/build path has reverted or degraded the `CompanyPulse` implementation.

---

## Failure handling standard

If any build or packaging step fails:
- state exactly what failed
- state why it failed
- identify the specific file(s) involved
- fix only what is required to complete the wave coherently
- do not hide unresolved package or runtime risk

---

## Completion deliverables

When complete, provide:

1. concise summary of validation and packaging work
2. list of changed files
3. build/type/lint/test status
4. confirmation that a fresh `hb-webparts.sppkg` was produced
5. short statement of why the packaged result should still reflect the premium newsroom objective
6. any remaining risks, limitations, or recommended follow-up

---

## Final reminder

Premium SharePoint work is not complete until the package proves it.
Do not leave the work in an unbuilt or unverified state.
