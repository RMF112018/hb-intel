# Subcontractor Scorecard Scope Lock

Generated: 2026-05-03

## In Scope

- Documentation-only target architecture for the PCC Subcontractor Scorecard.
- Future-workstream placement under `Subcontractor Performance Center`.
- Source workbook field preservation and scoring taxonomy.
- System-of-record model across PCC, Procore, Sage, SharePoint/HB Document Control, Compass/Bespoke Metrics, and HBI.
- Developer implementation contracts for future runtime work.
- State machine, field mutability, validation, permissions, analytics, fixtures, source-lineage, HBI guardrails, and acceptance criteria.
- Documentation update map and staged local-agent prompts.

## Out of Scope

- Runtime code implementation.
- Backend route registration.
- SPFx navigation/surface changes.
- Package or dependency updates.
- `pnpm-lock.yaml` changes.
- Manifest/CI/workflow changes.
- Production deployment.
- Tenant mutation.
- Microsoft Graph, SharePoint REST, PnP, Procore, Sage, Compass, or Document Crunch runtime calls.
- External writeback, sync, mirror, or mutation.
- Evidence binary upload/sync/storage.
- Vendor-facing scorecard portal.
- Automatic bidder exclusion, blacklist, default, debarment, or legal conclusions.

## Locked Naming

| Concept | Locked Value |
|---|---|
| Module | Subcontractor Scorecard |
| Work center | Subcontractor Performance Center |
| Work center id | `subcontractor-performance` |
| Primary record | `SubcontractorScorecardProjectInstance` |
| Template record | `SubcontractorScorecardTemplate` |
| Default source workbook | `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx` |
| Target docs folder | `docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/` |

## First Implementation Posture

Future runtime implementation must start as:

1. shared model contracts;
2. deterministic fixtures;
3. backend read-model route family;
4. SPFx read-only surface;
5. then, only after explicit gate, workflow write routes and mutation-aware UI.

No local agent may skip directly to write-enabled production behavior.
