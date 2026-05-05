# 00 — Objective and Current Phase 17 Context

## Objective

Create the complete documentation authority for PCC Phase 3 Wave 17 Site Health. The documentation must be explicit enough for a later implementation agent to build models, fixtures, read-model routes, SPFx clients, UX components, tests, and closeout evidence without guessing.

## Repo-Truth Summary

Remote repo truth established during audit:

| Fact | Finding |
|---|---|
| Remote repo | `RMF112018/hb-intel` |
| Local repo path expected | `/Users/bobbyfetting/hb-intel` |
| Remote `main` audited | `a444cebf999b92437ad1db6d630ca027409fd11c` |
| Known Wave 16 closeout reference | `714ca190c0dc12d738b10cc342b5253f94909895` |
| Remote main vs Wave 16 closeout | Five commits ahead during audit |
| Wave 17 blueprint path | Not found on remote `main` |
| Site Health already present | Yes, in models, fixtures, planning prompt, and project-site-template schema/fields |

## Required Local Reverification

The local agent must run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

The local agent must record results in the Prompt 01 closeout before writing documentation.

## Existing Site Health Inputs

Known existing files to inspect and reconcile:

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/Prompt_09_PCC_Site_Health_Drift_Read_Model_Gated_Implementation.md`
- `packages/models/src/pcc/SiteHealth.ts`
- `packages/models/src/pcc/fixtures/siteHealth.ts`
- `packages/project-site-template/schemas/families/site-health.schema.json`
- `packages/project-site-template/fields/families/site-health.fields.json`

## Current Dependency Context

| Dependency | Wave 17 Use |
|---|---|
| Wave 14 Approvals / Checkpoints | Repair requests and admin verification route to governed review; Wave 17 does not approve or execute repair |
| Wave 15 External Systems | Site Health consumes source-health snapshots and stale/degraded source signals without duplicating external-system authority |
| Wave 16 Control Center Settings | Site Health references settings validation and health snapshots without becoming settings writeback authority |
| Project Home | Shows aggregate health cards and priority project readiness blockers |
| Priority Actions | Consumes derived health action candidates for user-visible escalation |
| Team & Access | Supplies role/access posture; Wave 17 displays/redacts but does not mutate permissions |
| Document Control | Supplies library/storage posture; Wave 17 displays compliance and drift without file operations |
| Standard Project Site Template Contract | Supplies desired-state template, schema, validation, and drift baseline |
| HB Central | Supplies global project/configuration/check definitions where appropriate |

## Resolved Naming and Path Decision

Use these names unless local repo truth shows a direct conflict:

| Concept | Decision |
|---|---|
| User-facing module | Site Health |
| Surface ID | `site-health` |
| TypeScript root | `SiteHealth` |
| Canonical wave path | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/` |
| Route family | `/api/pcc/projects/{projectId}/site-health...` |
| Read-model client methods | `getSiteHealth*` |
