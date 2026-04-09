# Prompt 05 — Resolve PeopleCulture Naming, Authority, and Duplicate Surface Ambiguity

You are working in the live HB Intel repository.

## Objective
nClose the authority and naming ambiguity around the coexisting `PeopleCulture.tsx` and `PeopleCultureMerged.tsx` files by establishing one authoritative production surface, cleaning up misleading duplicate authority, and documenting the final decision clearly.

This is a narrow authority-resolution task. It may include light code cleanup, import cleanup, archival, rename, or removal work as repo truth supports.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCulture.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/index.ts`
- `apps/hb-webparts/src/mount.tsx`
- any manifest or registration files tied to the People and Culture webpart
- any relevant people-culture architecture / plan docs that explain the intended operating model

---

## Required work

### 1. Prove actual authority
Determine exactly:
- which component is mounted in production,
- which file is actively referenced by the runtime path,
- which file is legacy, superseded, experimental, or ambiguous,
- and whether either file is effectively dead code.

### 2. Resolve the naming and authority model
Based on live repo truth, do one of the following cleanly:
- archive / remove the non-authoritative file,
- rename the authoritative file for clarity,
- or preserve both only if both have a legitimate and documented role.

Your outcome must leave no confusion about which file is authoritative for production.

### 3. Clean exports and references
Update any indexes, references, comments, and docs so they reflect the resolved authority model.

### 4. Document the decision
Create:

`docs/architecture/reviews/PeopleCulture-Authority-and-Naming-Resolution.md`

This note must include:
- prior ambiguity,
- runtime truth,
- final authority decision,
- exact files changed,
- and any preserved non-authoritative artifact with rationale.

### 5. Confirm mount-path clarity
Make sure `apps/hb-webparts/src/mount.tsx` and any related packaging/runtime docs are consistent with the final authority model.

---

## Validation requirements

Report exactly:
- which file is now authoritative,
- what happened to the other file,
- which exports or references changed,
- and whether the PeopleCulture naming/authority gap is fully closed.

---

## Guardrails

- Do not redesign the People and Culture experience broadly.
- Do not leave both files active unless there is a clear, documented need.
- Do not keep ambiguous names if a clearer authoritative name is warranted.
- Preserve runtime correctness.

---

## Completion requirement

When finished:
1. resolve the duplicate-authority ambiguity in code and references
2. create `docs/architecture/reviews/PeopleCulture-Authority-and-Naming-Resolution.md`
3. provide a short completion note stating:
   - which file is authoritative,
   - what happened to the non-authoritative file,
   - whether the ambiguity is fully closed.
