# Prompt 00 — Deferred Scope Note

Date: 2026-04-09  
Scope basis: `Prompt-00-Repo-Truth-Architecture-and-Scope-Lock.md`

## 1. Purpose

This note locks what is intentionally out of scope at Prompt-00 and first-wave implementation.

## 2. Deferred items (explicit)

## 2.1 Browser-side PnP execution

Deferred permanently for this feature family.

Reason: privileged extraction must run server-side; browser execution violates security posture and token boundary rules.

## 2.2 Destructive or mutating SharePoint operations

Deferred beyond Phase-01 v1.

Reason: v1 is read/export oriented. Mutating operations require additional safety tiering, confirmation policy, compensation strategy, and stricter approvals.

Examples deferred:
- create/update/delete lists,
- field/schema mutation,
- permission rewrites,
- content/page rewrites,
- site structure mutation.

## 2.3 Tenant-wide backup/restore features

Deferred.

Reason: this expands into a platform backup product and exceeds Prompt-00/Phase-01 boundaries.

## 2.4 Unconstrained admin-center expansion

Deferred.

Reason: PnP Operations lane remains a bounded utility lane under existing admin-control-plane doctrine, not a separate unconstrained administration suite.

## 2.5 Advanced scheduling/queue orchestration beyond existing run framework

Deferred unless a later prompt demonstrates concrete necessity.

Reason: existing async run lifecycle is sufficient for first-wave action set; additional queue/scheduling complexity is premature at Prompt-00.

## 3. Deferred architecture decisions (to later prompts)

1. concrete PnP runtime host/process strategy in backend (Prompt-02),
2. artifact storage offload policy for large payloads (Prompt-02/03),
3. additional high-ROI actions beyond v1 locked catalog (Prompt-04),
4. operator guidance, packaging, and release validation closure (Prompt-05).

## 4. Guardrails while deferred

- No implementation may bypass server-side admin-control-plane routes.
- No implementation may introduce secrets in SPFx client code.
- New actions must be cataloged and risk-classified before implementation.
- Deferred items require explicit plan/prompt promotion before execution.
