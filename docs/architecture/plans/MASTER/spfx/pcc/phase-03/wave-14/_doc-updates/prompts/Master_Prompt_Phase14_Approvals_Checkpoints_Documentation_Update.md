# Master Prompt — PCC Phase 14 Approvals / Checkpoints Comprehensive Documentation Update

## Objective

You are working in the `hb-intel` repo at:

```text
/Users/bobbyfetting/hb-intel
```

Execute a documentation-only update that incorporates the comprehensive **Phase 14 / Wave 14 — Approvals / Checkpoints** target architecture into PCC governing documentation.

Use this package as the authoritative planning input. Do not implement runtime code.

Do not re-read files that are still within your current context or memory. If you already inspected a file in this session and no repo changes occurred, use that context and cite it in your closeout. Re-read only when repo truth changed, context is stale, or direct verification is required.

## Required Repo-Truth Audit

Run first:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Capture `pnpm-lock.yaml` MD5 before and after. It must remain unchanged.

## Required Interpretation

Approvals / Checkpoints is the PCC-native checkpoint orchestration layer. It governs queue semantics, route steps, decisions, reason codes, source lineage, audit events, Priority Actions linkage, readiness impact, admin verification, and Wave 13G estimating checkpoint seams.

It is not a disconnected approval app, generic task list, Power Automate runtime, Procore/Sage execution layer, or HBI decision surface.

## Required Work

1. Confirm current PCC Phase 3 and Wave 14 repo truth.
2. Confirm current `approvals` surface and existing model/backend/SPFx limitations.
3. Add/update Wave 14 documentation using the docs and artifacts in this package.
4. Add target architecture, domain model, state/routing model, source integration contract, read/command boundary, storage posture, UX/wireframes, HBI/audit/security guardrails, and test gates.
5. Cross-reference Wave 13G Estimating Workbench as the feature authority for estimating workbench while Phase 14 owns checkpoint queue semantics.
6. Preserve source-of-record boundaries.
7. Validate all JSON.
8. Run Prettier check on touched markdown/json.
9. Close with evidence.

## Forbidden

- Runtime source code implementation.
- Approval execution.
- Direct SPFx-to-list decision mutation.
- Package install.
- Package/lockfile mutation.
- Power Automate runtime dependency.
- Procore writeback.
- Sage writeback.
- Tenant/list/group/security mutation.
- Production rollout.
- HBI decision authority.

## Expected Closeout

Return only:

```text
Commit summary: <summary>

Commit description:
<description with files changed, validation, guardrails, lockfile MD5 before/after, residual risks>
```
