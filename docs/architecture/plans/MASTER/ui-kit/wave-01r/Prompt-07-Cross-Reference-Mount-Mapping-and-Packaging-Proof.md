# Prompt 07 — Cross-Reference Runtime Mount Mapping and Packaging Proof

You are working in the live HB Intel repository.

## Objective

Close the documentation traceability gap by explicitly linking the runtime mount mapping in `apps/hb-webparts/src/mount.tsx` to the packaging verification matrix and any stronger build evidence produced during audit closure.

This is a documentation and traceability task, with any minimal supporting updates needed to keep the evidence coherent.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `hb-webparts-multi-webpart-packaging-verification.md`
- `apps/hb-webparts/src/mount.tsx`
- any build-evidence closure note created during packaging proof work

---

## Required work

### 1. Reconcile runtime and packaging truth
For each relevant webpart in the packaging matrix, confirm:
- manifest path,
- component ID / GUID,
- mount.tsx runtime mapping,
- component file,
- and whether build evidence exists.

### 2. Tighten the matrix
Update `hb-webparts-multi-webpart-packaging-verification.md` so each entry is traceable not only to a manifest path but also to the runtime mount mapping.

Where applicable, add:
- exact GUID linkage,
- mount renderer key reference,
- component file reference,
- build-evidence note or link.

### 3. Add closure note
Create:

`docs/architecture/reviews/UI-System-Packaging-Traceability-Closure.md`

This note must include:
- what the matrix previously proved,
- what the new runtime cross-reference adds,
- whether traceability from manifest → mount mapping → consumer component → packaging proof is now complete,
- and any remaining weak points.

---

## Validation requirements

Report exactly:
- which entries were cross-referenced,
- what documentation improved,
- whether the runtime/packaging traceability gap is now fully closed,
- and what still depends on build-evidence quality rather than matrix quality.

---

## Guardrails

- Do not rewrite the matrix broadly beyond what is needed for traceability.
- Do not introduce guessed mappings.
- Preserve exact GUID and path correctness.
- Keep the documentation practical and audit-friendly.

---

## Completion requirement

When finished:
1. update `hb-webparts-multi-webpart-packaging-verification.md` with mount-traceability detail
2. create `docs/architecture/reviews/UI-System-Packaging-Traceability-Closure.md`
3. provide a short completion note stating:
   - what traceability was added,
   - whether manifest-to-runtime linkage is now explicit,
   - whether the documentation traceability gap is fully closed.
