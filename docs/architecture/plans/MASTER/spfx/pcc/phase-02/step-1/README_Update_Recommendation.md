<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# README_Update_Recommendation.md

# README Update Recommendation

## Objective

Create or update the Project Control Center documentation entry point so future Phase 2 work has a clear index, current status, and execution sequence.

## Current Finding

The requested path was not found at the audited commit:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
```

The requested roadmap path was also not found:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

`packages/project-site-template/README.md` exists and contains current Phase 1 completion language, but it also retains older scaffold-era sections that could confuse future implementers.

## Recommended README Location

Create:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
```

## Recommended README Structure

```markdown
# HB Project Control Center — Architecture Index

## Current Status
- Phase 0: complete
- Phase 1: complete
- Phase 2: planning / provisioning foundation
- Live tenant mutation: not authorized

## Governing Sources
1. Standard Project Site Template Contract
2. HB Project Control Center Target Architecture Blueprint
3. packages/project-site-template/
4. Phase 0 / Phase 1 closeout docs
5. Phase 2 planning docs

## Current Phase
Phase 2 — Provisioning Foundation and Template Consumer Boundary

## What Is In Scope
- template consumer boundary
- local read-only loader
- deterministic dry-run manifest
- mutation gates

## What Is Out of Scope
- live SharePoint mutation
- SPFx PCC implementation
- Procore runtime integration
- production deployment

## Folder Index
- phase-0/
- phase-1/
- phase-2/
- procore_hbintel_data_model_package/

## Next Prompt
Phase 2 Step 1 — Provisioning Foundation Audit and Consumer Boundary Documentation
```

## Recommended Project-Site-Template README Cleanup

In `packages/project-site-template/README.md`:

1. Keep the Phase 1 Step 5 completion section.
2. Remove or clearly mark the older “Current Status” scaffold-era section as historical.
3. Replace “Phase 1 Next Steps” with “Phase 2 Entry Point.”
4. Add explicit statement:

```text
This package remains schema/contract/validation only. It is not a provisioning executor.
```

5. Add pointer to:

```text
docs/architecture/blueprint/sp-project-control-center/phase-2/
```

## Recommended Roadmap File

Create:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

or explicitly document that the roadmap is governed elsewhere.

Recommended top-level roadmap:

```text
Phase 0 — Architecture Stabilization and Schema Extraction Planning
Phase 1 — Machine-Readable Template Contract and Validation Harness
Phase 2 — Provisioning Foundation and Template Consumer Boundary
Phase 3 — Non-Production Provisioning Harness
Phase 4 — Project Control Center Backend Services
Phase 5 — SPFx Project Control Center Shell
Phase 6 — Site Health / Drift / Repair
Phase 7 — Production Rollout
```

## README Acceptance Criteria

- No code changes.
- No schema changes.
- No package version changes.
- No backend/SPFx/tooling changes.
- Clear Phase 2 status.
- Clear no-live-tenant-mutation default.
- Clear Procore boundary.
- Clear next prompt.
