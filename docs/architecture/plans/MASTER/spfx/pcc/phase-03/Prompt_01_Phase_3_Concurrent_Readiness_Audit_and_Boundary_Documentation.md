# Prompt 01 — Phase 3 Concurrent Readiness Audit and Boundary Documentation

## Objective

Conduct an exhaustive repo-truth audit of the relevant Project Control Center files and create Phase 3 boundary documentation that determines what Phase 3 work can safely proceed while Phase 2 provisioning work remains active.

This is a planning, architecture, dependency, UX, and implementation-readiness audit only. Do not implement Phase 3 code. Do not modify backend execution paths, SPFx surfaces, provisioning packages, SharePoint tenant resources, PnP scripts, Graph calls, Procore integrations, deployment workflows, package manifests, or SPFx manifests.

## Context

Phase 2 is actively building the provisioning foundation.

Known Phase 2 state:

- Phase 2 Step 1:
  - Added provisioning foundation audit and consumer boundary documentation.
  - Confirmed `@hbc/project-site-template` remains schema-only.
  - Designated `packages/project-site-provisioning/` as the future headless consumer/planner package.
  - Preserved the no-mutation boundary.

- Phase 2 Step 2:
  - Created `@hbc/project-site-provisioning@0.1.0-scaffold`.
  - Added no-mutation mapper/planner scaffold.
  - Added mutation gate, manifest contract, validator, deterministic minimal mapper, fixtures, and tests.
  - Confirmed Phase 2 Step 3 readiness.

- Phase 2 Step 3:
  - Expected to expand manifest mapper contract coverage.
  - Should remain no-mutation.
  - Should produce family-level planned object coverage across all 14 contract families.
  - Should add deterministic proof/hash and scan posture.
  - Should not create backend adapters, SPFx wiring, tenant execution, Graph/PnP mutation, or Procore runtime behavior.

## Core Question

What Phase 3 work can safely begin now without depending on unfinished Phase 2 implementation details?

## Required Repo Sources

Audit at minimum:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/**
docs/architecture/blueprint/sp-project-control-center/phase-1/**
docs/architecture/blueprint/sp-project-control-center/phase-2/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/provisioning/**
tools/pnp-runner-local/**
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
docs/reference/sharepoint/**
backend/functions/**
packages/**
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

## Required Searches

Run targeted repo searches for at least:

```text
Project Control Center
PCC
project site
project-site-template
project-site-provisioning
Document Control Center
Project Sites
site health
drift
repair
provision
provisioning
manifest
dry-run
mutation
SharePoint
Graph
PnP
SPFx
Admin
control plane
evidence
readiness
HBCentral
Procore
Sage
permissions
groups
pages
libraries
lists
modules
workflows
integrations
```

## Allowed Files

Create documentation only under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/
```

Optional:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
```

Only add a small cross-link section if the existing README structure supports it. Do not broadly restructure the README.

## Forbidden Files

Do not modify:

```text
apps/**
backend/**
packages/**
tools/**
.github/**
infra/**
scripts/**
pnpm-lock.yaml
package.json
tsconfig.base.json
turbo.json
SPFx manifests
deployment workflows
tenant/provisioning scripts
```

## Required Deliverables

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Concurrent_Readiness_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Workstream_Boundary.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Prompt_Package_Outline.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Closeout.md
```

## Required Content — `Phase_3_Concurrent_Readiness_Audit.md`

Include:

- Objective
- Scope
- Repo areas audited
- Current Phase 2 dependency state
- What Phase 3 can do concurrently
- What Phase 3 cannot do yet
- Applicable architecture sources
- Applicable UI/UX doctrine
- Applicable backend/service patterns
- Applicable SharePoint/project-site patterns
- Applicable safety/provisioning/dry-run patterns
- Risks
- Open decisions
- Files inspected
- Evidence summary

## Required Content — `Phase_3_Workstream_Boundary.md`

Include:

- Phase 3 purpose
- Phase 3 workstreams
- Workstream ownership
- Allowed concurrent work
- Blocked implementation work
- Phase 2 dependency map
- SPFx boundary
- Backend boundary
- Provisioning boundary
- SharePoint tenant boundary
- Procore boundary
- Admin/control-plane boundary
- Site-health/drift/repair boundary
- Production rollout boundary

## Required Content — `Phase_3_Development_Roadmap.md`

Include:

- Phase 3 objective
- Current repo baseline
- Phase 3 assumptions
- Phase 2 dependencies
- Workstream sequence
- Prompt sequence
- Readiness gates
- Validation gates
- Deliverables
- Out-of-scope items
- Risk register
- Open decision register
- Phase 3 exit criteria

## Required Content — `Phase_3_Prompt_Package_Outline.md`

Include prompts for:

1. Phase 3 concurrent readiness audit and boundary documentation
2. PCC product architecture and user journey blueprint
3. PCC SPFx shell design spec, planning only
4. PCC backend/service contract design, planning only
5. PCC admin/workflow/readiness model
6. Phase 3 implementation gate review after Phase 2 Step 4 or Step 5
7. Implementation prompts only if Phase 2 gates are closed

For each prompt include:

- objective
- allowed files
- forbidden files
- dependency gate
- validation expectation
- required closeout

## Required Content — `Phase_3_Closeout.md`

Include:

- What was completed
- What was not implemented
- Validation commands run
- Validation commands not run and why
- Files created/modified
- Phase 3 concurrent-readiness decision
- Work that may proceed immediately
- Work blocked by Phase 2
- Recommended next prompt
- Proposed commit summary
- Proposed commit description

## Required Classification Matrix

Include a matrix similar to:

```markdown
| Phase 3 Work Item | Concurrent-Safe Now | Depends on Phase 2 Step 4 | Depends on Phase 2 Step 5/6 | Depends on Phase 2 Closeout | Production-Blocked |
|---|---:|---:|---:|---:|---:|
```

Include at minimum:

- product architecture
- user journeys
- SPFx shell wireframe/spec
- UI doctrine mapping
- backend service contract design
- admin/control-plane workflow design
- site health UX design
- drift/repair operating model
- manifest consumer interface design
- non-production rollout plan
- production rollout plan
- tenant execution
- Procore integration planning
- Procore runtime implementation

## Validation

Run:

```bash
git status --short
```

If documentation-only:

```text
Do not force full workspace build/typecheck.
State that no build/typecheck is required because no code changed.
```

If any package, app, backend, config, SPFx, or deployment file is accidentally modified:

1. Stop.
2. Revert the accidental change.
3. Re-run `git status --short`.

If Markdown lint/check commands exist and are standard in the repo, run the appropriate documentation check. If not, state that no repo-standard Markdown validation command was found.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Phase 3 concurrent-readiness status
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): add phase 3 concurrent readiness planning
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or SPFx version change; documentation-only Phase 3 planning step.

Adds Phase 3 concurrent-readiness planning under docs/architecture/blueprint/sp-project-control-center/phase-3/. Establishes which Phase 3 workstreams may proceed while Phase 2 continues and which remain blocked by Phase 2 manifest, proof, mutation-gate, non-production execution, and validation closeout gates.

Defines the Phase 3 workstream boundary across PCC product architecture, SPFx shell planning, backend/service contract design, admin/control-plane workflow, site-health/drift/repair posture, tenant rollout, and Procore boundary management.

Preserves all Phase 1 and Phase 2 invariants:
- @hbc/project-site-template remains schema/contract/validation-only.
- @hbc/project-site-provisioning remains no-mutation planner/mapper/proof until Phase 2 authorizes executor work.
- no tenant mutation.
- no backend executor.
- no SPFx implementation.
- no Graph/PnP mutation.
- no Procore runtime, secrets, mirror, or write-back.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed

Phase 3 concurrent-readiness: READY for planning-only work; implementation remains gated by Phase 2 Step 4/5/6 and Phase 2 closeout.
```
