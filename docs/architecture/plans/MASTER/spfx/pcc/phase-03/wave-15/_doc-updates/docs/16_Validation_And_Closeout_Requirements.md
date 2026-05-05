# 16 — Validation and Closeout Requirements

Required validation: git status, branch, HEAD, recent commits, lockfile MD5 before/after, JSON validation, Prettier check, git diff check, no source/runtime/package/lockfile mutation.

Closeout must include files changed, validation results, lockfile MD5 before/after, no-runtime attestation, no-live-integration attestation, no-secrets attestation, residual TODOs limited to approved TODOs, commit summary and commit description.


## Artifact Placement Proof

Closeout must include artifact placement proof showing each package artifact was promoted, copied, split, merged, or intentionally retained as package-only reference with a stated reason. The closeout must reference both:

- `docs/19_Artifact_Placement_And_Canonical_Docs_Promotion_Map.md`
- `artifacts/artifact_placement_map.json`
