# Prompt 02 — Commit Build and Packaging Evidence for UI-System Closure

You are working in the live HB Intel repository.

## Objective

Close the audit gap around packaging/build proof by generating clean build evidence for the relevant SPFx package and documenting that evidence in-repo with traceable linkage to the named consumer webparts.

This is a build-proof and documentation task. Make only the minimal supporting documentation or script-touch changes required to capture and preserve the evidence.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-08-Verification-Visual-Proof-and-Packaging.md`
- `hb-webparts-multi-webpart-packaging-verification.md`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/README.md`
- any live build/package scripts actually used by this app

Inspect the real build path before assuming how packaging works.

---

## Required work

### 1. Prove the actual build path
Identify the real command(s), script(s), and artifact path(s) used to build the relevant SPFx package.

Document:
- the exact command(s),
- the exact script file(s) if any,
- the exact artifact output location,
- and the exact package(s) / webparts covered.

### 2. Run a clean build / packaging pass
Produce a clean build evidence pass for the relevant homepage/webpart package.

At minimum, capture:
- command executed,
- success/failure outcome,
- timestamp or dated evidence note,
- artifact path,
- and any warnings that materially affect trust.

### 3. Create durable evidence files
Create a durable evidence location under:

`docs/architecture/reviews/evidence/ui-system-build-proof/`

Store:
- build logs or curated build output excerpts,
- packaging command record,
- artifact path references,
- and any inspection notes that prove the intended code path was built.

### 4. Write closure note
Create or update:

`docs/architecture/reviews/UI-System-Build-and-Packaging-Proof-Closure.md`

This note must:
- name the exact package or packages built,
- name the relevant consumer webparts covered,
- reference the artifact path,
- explain what was proven and what was not proven,
- and clearly distinguish matrix-level proof from artifact-level proof.

### 5. Reconcile against the repo-root matrix
Update `hb-webparts-multi-webpart-packaging-verification.md` only if needed to reflect stronger artifact-backed proof.

Do not rewrite it broadly. Tighten it only where actual build evidence justifies an improvement.

---

## Named consumers that must remain traceable

Ensure the evidence path remains traceable to these webparts where applicable:

- HB Hero Banner
- Priority Actions Rail
- Company Pulse
- Leadership Message
- People and Culture
- Project / Portfolio Spotlight
- Safety and Field Excellence
- Smart Search / Wayfinding

Use the real manifest names, component IDs, and mount mappings where possible.

---

## Validation requirements

Report exactly:
- build command(s) used,
- artifact path(s) proven,
- whether the package build succeeded cleanly,
- what proof is now stronger than before,
- and what artifact-level questions remain open.

---

## Guardrails

- Do not claim artifact-level proof if you did not inspect the actual build outputs.
- Do not substitute old docs for current build evidence.
- Do not broaden this into unrelated webpart work.
- Preserve exact naming and GUID traceability.

---

## Completion requirement

When finished:
1. store the evidence under `docs/architecture/reviews/evidence/ui-system-build-proof/`
2. create or update `docs/architecture/reviews/UI-System-Build-and-Packaging-Proof-Closure.md`
3. update `hb-webparts-multi-webpart-packaging-verification.md` only if justified by actual evidence
4. provide a short completion note stating:
   - what was built,
   - what artifact-level proof now exists,
   - whether the packaging-proof gap is fully closed or only reduced.
