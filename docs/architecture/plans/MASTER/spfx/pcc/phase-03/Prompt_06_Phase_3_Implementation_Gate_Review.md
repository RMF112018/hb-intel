# Prompt 06 — Phase 3 Implementation Gate Review After Phase 2 Step 4 or Step 5

## Objective

Conduct a repo-truth implementation gate review after Phase 2 Step 4 or Phase 2 Step 5 has landed. Determine whether any Phase 3 implementation work may safely begin, and if so, define the narrow authorized scope and remaining blockers.

Do not implement code in this prompt. This is a gate-review and planning update only.

## Required Timing

Run this prompt only after at least one of the following is true and verified in repo:

- Phase 2 Step 4 has produced stable dry-run proof artifact semantics.
- Phase 2 Step 5 has clarified mutation/executor boundaries.
- Phase 2 Step 6 has clarified post-provision validation / drift / repair posture.

If none of these are true, stop and produce a Not Ready gate decision.

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**
packages/project-site-provisioning/**
packages/project-site-template/**
backend/functions/**
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
```

Search for:

```text
Phase 2 Step 4
Phase 2 Step 5
Phase 2 Step 6
dry-run proof
proof artifact
plannedHash
mutationGate
executor
non-production
post-provision validation
drift
repair
manifestVersion
objectPlans
noSecretScan
noProcoreMirrorScan
```

## Allowed Files

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Implementation_Gate_Review.md
```

Optional updates to existing Phase 3 docs only if needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Workstream_Boundary.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Prompt_Package_Outline.md
```

## Forbidden Files

Do not modify:

```text
apps/**
backend/**
packages/**
tools/**
.github/**
scripts/**
infra/**
package.json
pnpm-lock.yaml
SPFx manifests
deployment workflows
tenant/provisioning scripts
```

## Required Deliverable — `Phase_3_Implementation_Gate_Review.md`

Include:

1. Objective
2. Gate timing confirmation
3. Sources audited
4. Phase 2 outputs verified
5. Phase 2 outputs not found
6. Stable interfaces identified
7. Unstable interfaces identified
8. Dry-run proof semantics review
9. Mutation/executor boundary review
10. Post-provision validation posture review
11. Manifest consumer stability review
12. SPFx implementation readiness
13. Backend implementation readiness
14. Admin workflow implementation readiness
15. Site Health/drift/repair implementation readiness
16. Tenant/non-production readiness
17. Production readiness
18. Procore boundary status
19. Gate decision
20. Authorized next prompt(s), if any
21. Remaining blockers
22. Open decisions
23. Validation results

## Required Gate Decision

Use one of:

```text
READY FOR LIMITED PLANNING ONLY
READY FOR LIMITED SPFX PLANNING IMPLEMENTATION
READY FOR LIMITED BACKEND READ-MODEL IMPLEMENTATION
READY FOR LIMITED NON-PRODUCTION EXECUTOR PLANNING
NOT READY FOR IMPLEMENTATION
```

Do not choose a ready status unless repo evidence supports it.

## Required Matrix

Include:

```markdown
| Phase 3 Area | Ready? | Evidence | Remaining Blocker | Authorized Next Prompt |
|---|---|---|---|---|
```

Cover:

- product architecture
- SPFx shell scaffold
- backend read models
- admin workflow
- manifest consumer interface
- Site Health read model
- drift/repair execution
- non-production rollout
- production rollout
- Procore runtime

## Validation

Run:

```bash
git status --short
```

Documentation-only. No build/typecheck required unless accidental implementation changes occur.

If implementation files are modified accidentally, revert them and re-run status.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Gate decision
Authorized next prompt
```

## Recommended Commit Summary

```text
docs(pcc): add phase 3 implementation gate review
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package, backend, or SPFx version change; documentation-only Phase 3 gate review.

Adds the Phase 3 Implementation Gate Review under docs/architecture/blueprint/sp-project-control-center/phase-3/. Reviews Phase 2 proof, mutation, executor, validation, manifest consumer, Site Health, non-production, and production gate status to determine whether any Phase 3 implementation work may begin.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed

Gate decision: <fill from review>
Authorized next prompt: <fill from review>
```
