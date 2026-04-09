# Prompt 02 — Packaging Pipeline Validation and Stale-Artifact Prevention

## Objective

Prove that the structural split from Prompt 01 is fully wired into the existing `hb-webparts` packaging pipeline and that the produced `hb-webparts.sppkg` contains the intended up-to-date webpart registrations.

## Packaging posture to preserve

Unless Prompt 00 proved otherwise, treat the following as authoritative:

- domain: `apps/hb-webparts`
- package orchestrator: `tools/build-spfx-package.ts`
- package output: `hb-webparts.sppkg`

Do not create a new packaging domain.

## Required validation work

Validate all of the following explicitly:

### 1. Manifest discovery

Confirm that the new split manifests are discoverable by the `hb-webparts` multi-manifest packaging flow.

Check:

- manifest file location
- `componentType`
- exclusion logic
- expected target manifest inventory

### 2. Runtime registration alignment

Confirm alignment between:

- each source manifest ID
- `mount.tsx`
- the shell-manifest generation step
- and the final packaged component registration

### 3. Package-solution component inclusion

Confirm that the final shell package-solution step is including the expected component IDs for the split inventory.

### 4. Build cleanliness

Prevent stale artifacts by explicitly cleaning and then rebuilding the authoritative package path.

Use the authoritative build command for this domain:

- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

### 5. Artifact inspection

Inspect the generated package and prove:

- the expected `WebPart_*.xml` entries exist for the split inventory,
- the expected packaged manifests exist,
- the expected shim/loader mapping is present where applicable,
- the expected component IDs are present,
- no stale removed/legacy unintended registration was introduced,
- and the package reflects current source rather than a prior build.

## Required evidence files

Produce or update a proof note at:

- `docs/architecture/reviews/people-culture-split-initiation-packaging-proof.md`

The proof note must include:

- exact build command run,
- exact package output path,
- manifest IDs expected,
- manifest IDs actually found in the package,
- mount/runtime alignment summary,
- stale-artifact checks performed,
- and any mismatch found.

If a mismatch exists, stop and fix it before claiming completion.

## Additional required outputs

If the repo already uses a generated shim-proof or similar packaging proof artifact for `hb-webparts`, update that proof as needed and reference it in the note.

## Guardrails

- Do not treat a successful compile alone as packaging proof.
- Do not treat a new `.sppkg` timestamp alone as proof.
- Do not skip archive inspection.
- Do not skip mount/manifest cross-reference.
- Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.

## Completion report

Report back with:

- build command executed,
- final package path,
- expected manifest inventory,
- actual packaged manifest inventory,
- stale-artifact checks performed,
- and any corrections required/performed.
